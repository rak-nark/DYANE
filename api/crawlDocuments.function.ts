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

type CrawlJobStatus = "running" | "completed" | "failed";

type CrawlJob = {
  id: string;
  source: string;
  startedAt: string;
  finishedAt?: string;
  discovered: number;
  processed: number;
  created: number;
  updated: number;
  unchanged: number;
  failed: number;
  status: CrawlJobStatus;
  errors: string[];
};

type CrawlDocumentsInput = {
  source?: string;
};

type CrawlDocumentsResult = {
  success: boolean;
  job?: CrawlJob;
  error?: string;
};

// ─── Source Config ───────────────────────────────────────────────────────────

type CrawlSource = {
  name: string;
  baseUrl: string;
  sitemapUrl: string;
  allowedPatterns: string[];
};

const SOURCES: Record<string, CrawlSource> = {
  "dynatrace-docs": {
    name: "dynatrace-docs",
    baseUrl: "https://docs.dynatrace.com",
    sitemapUrl: "https://docs.dynatrace.com/docs/sitemap.xml",
    allowedPatterns: ["https://docs.dynatrace.com/docs/*"],
  },
};

// ─── In-Memory Repository ────────────────────────────────────────────────────

const documents = new Map<string, Document>();
const versions = new Map<string, DocumentVersion[]>();
const crawlJobs = new Map<string, CrawlJob>();

function getDocument(id: string): Document | null {
  return documents.get(id) ?? null;
}

function getLatestVersion(documentId: string): DocumentVersion | null {
  const docVersions = versions.get(documentId);
  if (!docVersions || docVersions.length === 0) return null;
  return docVersions[docVersions.length - 1];
}

function createDocument(doc: Document): void {
  documents.set(doc.id, doc);
  versions.set(doc.id, []);
}

function updateDocument(doc: Document): void {
  documents.set(doc.id, doc);
}

function createVersion(ver: DocumentVersion): void {
  const docVersions = versions.get(ver.documentId) ?? [];
  docVersions.push(ver);
  versions.set(ver.documentId, docVersions);

  const doc = documents.get(ver.documentId);
  if (doc) {
    doc.currentVersion = ver.version;
    doc.updatedAt = ver.retrievedAt;
    doc.headings = ver.headings;
    doc.codeBlocks = ver.codeBlocks;
    doc.links = ver.links;
  }
}

function saveCrawlJob(job: CrawlJob): void {
  crawlJobs.set(job.id, job);
}

// ─── Sitemap Parser ──────────────────────────────────────────────────────────

type SitemapEntry = {
  url: string;
  lastmod?: string;
};

async function parseSitemap(sitemapUrl: string): Promise<SitemapEntry[]> {
  const response = await fetch(sitemapUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${response.status}`);
  }

  const xml = await response.text();
  const entries: SitemapEntry[] = [];
  const urlRegex = /<url>([\s\S]*?)<\/url>/gi;
  let urlMatch;

  while ((urlMatch = urlRegex.exec(xml)) !== null) {
    const urlBlock = urlMatch[1];
    const locMatch = urlBlock.match(/<loc>([^<]+)<\/loc>/i);
    if (!locMatch) continue;

    const lastmodMatch = urlBlock.match(/<lastmod>([^<]+)<\/lastmod>/i);
    entries.push({
      url: locMatch[1].trim(),
      lastmod: lastmodMatch?.[1]?.trim(),
    });
  }

  return entries;
}

function filterByPattern(
  entries: SitemapEntry[],
  patterns: string[]
): SitemapEntry[] {
  return entries.filter((entry) =>
    patterns.some((pattern) => {
      const regex = pattern.replace(/\*/g, ".*").replace(/\?/g, ".");
      return new RegExp(`^${regex}$`).test(entry.url);
    })
  );
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

// ─── Sync Single Document ────────────────────────────────────────────────────

async function syncSingleDocument(
  url: string,
  sourceName: string
): Promise<{
  success: boolean;
  action?: "created" | "updated" | "unchanged";
  error?: string;
}> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
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
    const id = generateId(url);

    const existing = getDocument(id);

    if (!existing) {
      const doc: Document = {
        id,
        title,
        description,
        url,
        sourceUrl: url,
        source: sourceName,
        category: extractCategory(url),
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

      createDocument(doc);
      createVersion(ver);
      return { success: true, action: "created" };
    }

    const latest = getLatestVersion(id);

    if (latest && latest.contentHash === hash) {
      existing.lastSyncedAt = now;
      updateDocument(existing);
      return { success: true, action: "unchanged" };
    }

    const newVersion = existing.currentVersion + 1;
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

    existing.currentVersion = newVersion;
    existing.lastSyncedAt = now;
    existing.headings = headings;
    existing.codeBlocks = codeBlocks;
    existing.links = links;
    updateDocument(existing);
    createVersion(ver);
    return { success: true, action: "updated" };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default async function (payload: unknown) {
  const input = payload as CrawlDocumentsInput;
  const sourceName = input?.source ?? "dynatrace-docs";
  const source = SOURCES[sourceName];

  if (!source) {
    return {
      success: false,
      error: `Unknown source: ${sourceName}. Available: ${Object.keys(SOURCES).join(", ")}`,
    } as CrawlDocumentsResult;
  }

  const job: CrawlJob = {
    id: `crawl-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    source: sourceName,
    startedAt: new Date().toISOString(),
    discovered: 0,
    processed: 0,
    created: 0,
    updated: 0,
    unchanged: 0,
    failed: 0,
    status: "running",
    errors: [],
  };

  try {
    const entries = await parseSitemap(source.sitemapUrl);
    const filtered = filterByPattern(entries, source.allowedPatterns);
    job.discovered = filtered.length;

    for (const entry of filtered) {
      const result = await syncSingleDocument(entry.url, sourceName);
      job.processed++;

      if (!result.success) {
        job.failed++;
        job.errors.push(`${entry.url}: ${result.error}`);
        continue;
      }

      switch (result.action) {
        case "created":
          job.created++;
          break;
        case "updated":
          job.updated++;
          break;
        case "unchanged":
          job.unchanged++;
          break;
      }
    }

    job.status = "completed";
  } catch (err) {
    job.status = "failed";
    job.errors.push(err instanceof Error ? err.message : "Unknown error");
  }

  job.finishedAt = new Date().toISOString();
  saveCrawlJob(job);

  return {
    success: job.status === "completed",
    job,
  } as CrawlDocumentsResult;
}
