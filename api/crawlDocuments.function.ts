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

type CrawlJobStatus = "running" | "completed" | "failed" | "partial";

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
  batches: BatchResult[];
};

type BatchResult = {
  batchIndex: number;
  urls: string[];
  created: number;
  updated: number;
  unchanged: number;
  failed: number;
  errors: string[];
};

type CrawlDocumentsInput = {
  source?: string;
  batchSize?: number;
};

type CrawlDocumentsResult = {
  success: boolean;
  job?: CrawlJob;
  error?: string;
};

type CrawlSource = {
  id: string;
  host: string;
  type: "sitemap" | "rss" | "api" | "page-discovery";
  sitemapUrl?: string;
  baseUrl?: string;
  allowedPatterns: string[];
  enabled: boolean;
};

type SitemapEntry = {
  url: string;
  lastmod?: string;
};

const DYANE_TYPE = "dyane-document";
const CRAWL_JOB_TYPE = "dyane-crawl-job";
const DEFAULT_BATCH_SIZE = 25;
const MAX_DOCUMENTS = 5;

const SOURCES: Record<string, CrawlSource> = {
  "dynatrace-docs": {
    id: "dynatrace-docs",
    host: "docs.dynatrace.com",
    type: "sitemap",
    baseUrl: "https://docs.dynatrace.com",
    sitemapUrl: "https://docs.dynatrace.com/docs/sitemap.xml",
    allowedPatterns: ["https://docs.dynatrace.com/docs/*"],
    enabled: true,
  },
};

// ─── In-Memory Fallback ──────────────────────────────────────────────────────

const memoryStore = new Map<string, StoredData>();
const jobMemoryStore = new Map<string, CrawlJob>();

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
    return memoryStore.get(id) ?? null;
  }
}

async function saveStoredData(id: string, data: StoredData, createSnapshot: boolean): Promise<void> {
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

async function saveCrawlJob(job: CrawlJob): Promise<void> {
  const id = `crawl-job-${job.id}`;
  jobMemoryStore.set(id, job);

  try {
    const { documentsClient } = await import("@dynatrace-sdk/client-document");
    try {
      const existing = await documentsClient.getDocument({ id });
      await documentsClient.updateDocument({
        id,
        optimisticLockingVersion: existing.metadata.version,
        createSnapshot: false,
        body: {
          name: `Crawl Job ${job.id}`,
          type: CRAWL_JOB_TYPE,
          description: `Crawl job for ${job.source}`,
          content: new Blob([JSON.stringify(job)], { type: "application/json" }),
        },
      });
    } catch {
      await documentsClient.createDocument({
        body: {
          name: `Crawl Job ${job.id}`,
          type: CRAWL_JOB_TYPE,
          description: `Crawl job for ${job.source}`,
          id,
          isPrivate: false,
          content: new Blob([JSON.stringify(job)], { type: "application/json" }),
        },
      });
    }
  } catch {
    // Memory fallback already saved
  }
}

// ─── Sitemap Parser ──────────────────────────────────────────────────────────

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

function filterByPattern(entries: SitemapEntry[], patterns: string[]): SitemapEntry[] {
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
  const id = url
    .replace("https://docs.dynatrace.com/", "dy-")
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return id.length > 80 ? id.substring(0, 80) : id;
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

    const existing = await getStoredData(id);

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

      await saveStoredData(id, { document: doc, versions: [ver] }, false);
      return { success: true, action: "created" };
    }

    const latest = existing.versions[existing.versions.length - 1];

    if (latest && latest.contentHash === hash) {
      existing.document.lastSyncedAt = now;
      await saveStoredData(id, existing, false);
      return { success: true, action: "unchanged" };
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
    return { success: true, action: "updated" };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ─── Batch Processing ────────────────────────────────────────────────────────

async function processBatch(
  urls: string[],
  sourceName: string,
  batchIndex: number
): Promise<BatchResult> {
  const batch: BatchResult = {
    batchIndex,
    urls,
    created: 0,
    updated: 0,
    unchanged: 0,
    failed: 0,
    errors: [],
  };

  for (const url of urls) {
    const result = await syncSingleDocument(url, sourceName);

    if (!result.success) {
      batch.failed++;
      batch.errors.push(`${url}: ${result.error}`);
      continue;
    }

    switch (result.action) {
      case "created":
        batch.created++;
        break;
      case "updated":
        batch.updated++;
        break;
      case "unchanged":
        batch.unchanged++;
        break;
    }
  }

  return batch;
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default async function (payload: unknown) {
  const input = payload as CrawlDocumentsInput;
  const sourceName = input?.source ?? "dynatrace-docs";
  const batchSize = input?.batchSize ?? DEFAULT_BATCH_SIZE;
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
    batches: [],
  };

  try {
    const entries = await parseSitemap(source.sitemapUrl!);
    const filtered = filterByPattern(entries, source.allowedPatterns);
    job.discovered = filtered.length;

    // Split into batches - limit to MAX_DOCUMENTS
    const urls = filtered.map((e) => e.url).slice(0, MAX_DOCUMENTS);
    const batches: string[][] = [];
    for (let i = 0; i < urls.length; i += batchSize) {
      batches.push(urls.slice(i, i + batchSize));
    }

    for (let i = 0; i < batches.length; i++) {
      const batchResult = await processBatch(batches[i], sourceName, i);
      job.batches.push(batchResult);

      job.created += batchResult.created;
      job.updated += batchResult.updated;
      job.unchanged += batchResult.unchanged;
      job.failed += batchResult.failed;
      job.processed += batchResult.created + batchResult.updated + batchResult.unchanged + batchResult.failed;
      job.errors.push(...batchResult.errors);
    }

    job.status = job.failed > 0 ? (job.processed === job.failed ? "failed" : "partial") : "completed";
  } catch (err) {
    job.status = "failed";
    job.errors.push(err instanceof Error ? err.message : "Unknown error");
  }

  job.finishedAt = new Date().toISOString();

  await saveCrawlJob(job);

  return {
    success: job.status === "completed" || job.status === "partial",
    job,
  } as CrawlDocumentsResult;
}
