import { createHash } from "crypto";

// ─── Types ───────────────────────────────────────────────────────────────────

type Document = {
  id: string;
  title: string;
  description: string;
  url: string;
  sourceUrl: string;
  source: string;
  category: string;
  currentVersion: number;
  headings: string[];
  codeBlocks: string[];
  links: { text: string; href: string }[];
  createdAt: string;
  updatedAt: string;
  lastSyncedAt: string | null;
};

type DocumentVersion = {
  id: string;
  documentId: string;
  version: number;
  content: string;
  normalizedContent: string;
  contentHash: string;
  headings: string[];
  codeBlocks: string[];
  links: { text: string; href: string }[];
  retrievedAt: string;
};

type StoredData = {
  document: Document;
  versions: DocumentVersion[];
};

type SyncDocumentInput = {
  url: string;
};

type SyncDocumentResult = {
  success: boolean;
  action?: "created" | "updated" | "unchanged";
  document?: Document;
  version?: DocumentVersion;
  error?: string;
};

const DYANE_TYPE = "dyane-document";

// ─── In-Memory Fallback ──────────────────────────────────────────────────────

const memoryStore = new Map<string, StoredData>();

// ─── Document Service (with fallback) ────────────────────────────────────────

async function getStoredData(id: string): Promise<StoredData | null> {
  try {
    const { documentsClient } = await import("@dynatrace-sdk/client-document");
    const result = await documentsClient.getDocument({ id });
    const content = result.content;
    let text: string;
    if (typeof content === "string") {
      text = content;
    } else if (content instanceof Blob) {
      text = await content.text();
    } else if (content instanceof ArrayBuffer) {
      text = new TextDecoder().decode(content);
    } else {
      text = String(content);
    }
    return JSON.parse(text) as StoredData;
  } catch {
    // Fallback to memory
    return memoryStore.get(id) ?? null;
  }
}

async function saveStoredData(
  id: string,
  data: StoredData,
  createSnapshot: boolean
): Promise<void> {
  // Always save to memory as fallback
  memoryStore.set(id, data);

  try {
    const { documentsClient } = await import("@dynatrace-sdk/client-document");
    const existing = await documentsClient.getDocument({ id });
    await documentsClient.updateDocument({
      id,
      optimisticLockingVersion: existing.metadata.version,
      createSnapshot,
      body: {
        name: data.document.title,
        type: DYANE_TYPE,
        description: data.document.description,
        content: new Blob([JSON.stringify(data)], { type: "application/json" }),
      },
    });
  } catch {
    try {
      const { documentsClient } = await import("@dynatrace-sdk/client-document");
      await documentsClient.createDocument({
        body: {
          name: data.document.title,
          type: DYANE_TYPE,
          description: data.document.description,
          id,
          isPrivate: false,
          content: new Blob([JSON.stringify(data)], { type: "application/json" }),
        },
      });
    } catch {
      // Memory fallback already saved
    }
  }
}

// ─── Versioning ──────────────────────────────────────────────────────────────

function sha256(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

function normalizeContent(content: string): string {
  return content
    .replace(/[ \t]+/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ─── HTML Parser ─────────────────────────────────────────────────────────────

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function stripTags(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]+>/g, ""));
}

function extractMainContent(html: string): string {
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) return mainMatch[1];
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  if (articleMatch) return articleMatch[1];
  return html;
}

function stripNoise(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
}

function extractTitle(html: string): string {
  const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
  if (ogTitle) return decodeHtmlEntities(ogTitle[1]);
  const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleTag) return decodeHtmlEntities(titleTag[1].trim());
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return stripTags(h1[1]).trim();
  return "Untitled";
}

function extractDescription(html: string): string {
  const ogDesc = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
  if (ogDesc) return decodeHtmlEntities(ogDesc[1]);
  const metaDesc = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  if (metaDesc) return decodeHtmlEntities(metaDesc[1]);
  return "";
}

function extractHeadings(html: string): string[] {
  const headings: string[] = [];
  const regex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    headings.push(stripTags(match[2]).trim());
  }
  return headings;
}

function extractCodeBlocks(html: string): string[] {
  const blocks: string[] = [];
  const preCodeRegex = /<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi;
  let match;
  while ((match = preCodeRegex.exec(html)) !== null) {
    blocks.push(stripTags(match[1]).trim());
  }
  return blocks;
}

function extractLinks(html: string): { text: string; href: string }[] {
  const links: { text: string; href: string }[] = [];
  const regex = /<a\s+[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const href = match[1];
    const text = stripTags(match[2]).trim();
    if (text && href && !href.startsWith("#") && !href.startsWith("javascript:")) {
      links.push({ text, href });
    }
  }
  return links;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractCategory(url: string): string {
  const parts = url.replace("https://docs.dynatrace.com/", "").split("/").filter(Boolean);
  if (parts.length > 1) return parts.slice(0, -1).join("/");
  return "documentation";
}

function generateId(url: string): string {
  return url
    .replace("https://docs.dynatrace.com/", "dynatrace-")
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default async function (payload: unknown) {
  const input = payload as SyncDocumentInput;

  if (!input?.url) {
    return { success: false, error: "URL is required" } as SyncDocumentResult;
  }

  if (!input.url.startsWith("https://docs.dynatrace.com/")) {
    return { success: false, error: "URL must be from docs.dynatrace.com" } as SyncDocumentResult;
  }

  try {
    const response = await fetch(input.url);
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` } as SyncDocumentResult;
    }

    const html = await response.text();
    const title = extractTitle(html);
    const description = extractDescription(html);
    const headings = extractHeadings(html);
    const codeBlocks = extractCodeBlocks(html);
    const links = extractLinks(html);

    const mainHtml = stripNoise(extractMainContent(html));
    const rawContent = stripTags(mainHtml);
    const normalized = normalizeContent(rawContent);
    const hash = sha256(normalized);
    const now = new Date().toISOString();
    const id = generateId(input.url);

    const existing = await getStoredData(id);

    if (!existing) {
      const doc: Document = {
        id,
        title,
        description,
        url: input.url,
        sourceUrl: input.url,
        source: "dynatrace-docs",
        category: extractCategory(input.url),
        currentVersion: 1,
        headings,
        codeBlocks,
        links,
        createdAt: now,
        updatedAt: now,
        lastSyncedAt: now,
      };

      const ver: DocumentVersion = {
        id: `${id}-v1`,
        documentId: id,
        version: 1,
        content: rawContent,
        normalizedContent: normalized,
        contentHash: hash,
        headings,
        codeBlocks,
        links,
        retrievedAt: now,
      };

      await saveStoredData(id, { document: doc, versions: [ver] }, false);

      return {
        success: true,
        action: "created",
        document: doc,
        version: ver,
      } as SyncDocumentResult;
    }

    const latest = existing.versions[existing.versions.length - 1];

    if (latest && latest.contentHash === hash) {
      existing.document.lastSyncedAt = now;
      await saveStoredData(id, existing, false);
      return {
        success: true,
        action: "unchanged",
        document: existing.document,
        version: latest,
      } as SyncDocumentResult;
    }

    const newVersion = existing.document.currentVersion + 1;
    const ver: DocumentVersion = {
      id: `${id}-v${newVersion}`,
      documentId: id,
      version: newVersion,
      content: rawContent,
      normalizedContent: normalized,
      contentHash: hash,
      headings,
      codeBlocks,
      links,
      retrievedAt: now,
    };

    existing.document.currentVersion = newVersion;
    existing.document.lastSyncedAt = now;
    existing.document.headings = headings;
    existing.document.codeBlocks = codeBlocks;
    existing.document.links = links;
    existing.versions.push(ver);

    await saveStoredData(id, existing, true);

    return {
      success: true,
      action: "updated",
      document: existing.document,
      version: ver,
    } as SyncDocumentResult;
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    } as SyncDocumentResult;
  }
}
