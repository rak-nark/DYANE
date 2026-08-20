import { createHash } from "crypto";

// ─── Types ───────────────────────────────────────────────────────────────────

type SyncStatus = "idle" | "running" | "completed" | "partial" | "failed" | "locked";

type SyncLock = { locked: boolean; jobId?: string; startedAt?: string };

type SyncState = {
  source: string;
  status: SyncStatus;
  lock: SyncLock;
  lastStartedAt?: string;
  lastCompletedAt?: string;
  lastResult?: {
    discovered: number;
    valid: number;
    excluded: number;
    duplicate: number;
    new: number;
    known: number;
    processed: number;
    created: number;
    updated: number;
    unchanged: number;
    failed: number;
    retried: number;
  };
  lastDuration?: number;
  nextScheduledAt?: string;
};

type DiscoveryReport = {
  discovered: number;
  valid: number;
  excluded: number;
  duplicate: number;
  new: number;
  known: number;
  failedUrls: string[];
};

type BatchResult = {
  index: number;
  urls: string[];
  created: number;
  updated: number;
  unchanged: number;
  failed: number;
  failedUrls: string[];
};

type WeeklySyncReport = {
  id: string;
  source: string;
  startedAt: string;
  completedAt: string;
  crawlJobId: string;
  discovery: DiscoveryReport;
  batches: BatchResult[];
  totalProcessed: number;
  created: number;
  updated: number;
  unchanged: number;
  failed: number;
  retried: number;
  changesCount: number;
  status: "completed" | "partial" | "failed";
  duration: number;
};

type RunSyncResult = {
  success: boolean;
  state: SyncState;
  report?: WeeklySyncReport;
  error?: string;
};

type StoredData = { document: any; versions: any[] };

// ─── Config ──────────────────────────────────────────────────────────────────

const MAX_DOCUMENTS = 50;
const BATCH_SIZE = 25;
const MAX_RETRIES = 2;
const SYNC_STATE_TYPE = "dyane-sync-state";
const SYNC_REPORT_TYPE = "dyane-sync-report";
const DYANE_TYPE = "dyane-document";

// ─── Stores ──────────────────────────────────────────────────────────────────

const memoryStore = new Map<string, any>();
const memoryState = new Map<string, SyncState>();

// ─── Store Helpers ───────────────────────────────────────────────────────────

async function saveToStore(type: string, id: string, data: unknown): Promise<void> {
  memoryStore.set(id, data);
  try {
    const { documentsClient } = await import("@dynatrace-sdk/client-document");
    try {
      const existing = await documentsClient.getDocument({ id });
      await documentsClient.updateDocument({ id, optimisticLockingVersion: existing.metadata.version, createSnapshot: false, body: { name: id, type, description: `DYANE ${type}`, content: new Blob([JSON.stringify(data)], { type: "application/json" }) } });
    } catch {
      await documentsClient.createDocument({ body: { name: id, type, description: `DYANE ${type}`, id, isPrivate: false, content: new Blob([JSON.stringify(data)], { type: "application/json" }) } });
    }
  } catch { /* memory fallback */ }
}

async function getSyncState(source: string): Promise<SyncState> {
  return memoryState.get(source) || { source, status: "idle", lock: { locked: false } };
}

async function saveSyncState(state: SyncState): Promise<void> {
  memoryState.set(state.source, state);
  await saveToStore(SYNC_STATE_TYPE, `sync-state-${state.source}`, state);
}

async function acquireLock(source: string, jobId: string): Promise<boolean> {
  const state = await getSyncState(source);
  if (state.lock.locked) return false;
  state.lock = { locked: true, jobId, startedAt: new Date().toISOString() };
  state.status = "running";
  await saveSyncState(state);
  return true;
}

async function releaseLock(source: string, status: SyncStatus): Promise<void> {
  const state = await getSyncState(source);
  state.lock = { locked: false };
  state.status = status;
  await saveSyncState(state);
}

// ─── Document Storage ────────────────────────────────────────────────────────

async function getStoredData(id: string): Promise<StoredData | null> {
  const mem = memoryStore.get(id);
  if (mem) return mem as StoredData;
  try {
    const { documentsClient } = await import("@dynatrace-sdk/client-document");
    const result = await documentsClient.getDocument({ id });
    const content = result.content;
    let text: string;
    if (typeof content === "string") text = content;
    else if (content instanceof Blob) text = await content.text();
    else if (content instanceof ArrayBuffer) text = new TextDecoder().decode(content);
    else text = String(content);
    const data = JSON.parse(text) as StoredData;
    memoryStore.set(id, data);
    return data;
  } catch { return null; }
}

async function saveStoredData(id: string, data: StoredData): Promise<void> {
  memoryStore.set(id, data);
  try {
    const { documentsClient } = await import("@dynatrace-sdk/client-document");
    try {
      const existing = await documentsClient.getDocument({ id });
      await documentsClient.updateDocument({ id, optimisticLockingVersion: existing.metadata.version, createSnapshot: false, body: { name: data.document.title, type: DYANE_TYPE, description: data.document.description, content: new Blob([JSON.stringify(data)], { type: "application/json" }) } });
    } catch {
      await documentsClient.createDocument({ body: { name: data.document.title, type: DYANE_TYPE, description: data.document.description, id, isPrivate: false, content: new Blob([JSON.stringify(data)], { type: "application/json" }) } });
    }
  } catch { /* memory fallback */ }
}

// ─── Sitemap Parser ──────────────────────────────────────────────────────────

async function parseSitemap(url: string): Promise<string[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sitemap fetch failed: ${res.status}`);
  const xml = await res.text();
  const urls: string[] = [];
  const regex = /<loc>([^<]+)<\/loc>/gi;
  let m;
  while ((m = regex.exec(xml)) !== null) urls.push(m[1].trim());
  return urls.filter((u) => u.startsWith("https://docs.dynatrace.com/docs/"));
}

// ─── Enhanced HTML Parser ────────────────────────────────────────────────────

function decodeEntities(t: string) { return t.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'"); }
function stripTags(h: string) { return decodeEntities(h.replace(/<[^>]+>/g, "")); }

function extractMain(h: string) {
  const m = h.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (m) return m[1];
  const a = h.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  if (a) return a[1];
  return h;
}

function stripNoise(h: string) {
  return h.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
}

function extractTitle(h: string) {
  const o = h.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
  if (o) return decodeEntities(o[1]);
  const t = h.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (t) return decodeEntities(t[1].trim());
  const h1 = h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return stripTags(h1[1]).trim();
  return "Untitled";
}

function extractDescription(h: string) {
  const o = h.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
  if (o) return decodeEntities(o[1]);
  const m = h.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  if (m) return decodeEntities(m[1]);
  return "";
}

function extractCanonicalUrl(h: string): string | undefined {
  const c = h.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  return c ? c[1] : undefined;
}

function extractBreadcrumbs(h: string): string[] {
  const breadcrumbs: string[] = [];
  const navMatch = h.match(/<nav[^>]*class="[^"]*breadcrumb[^"]*"[^>]*>([\s\S]*?)<\/nav>/i);
  if (navMatch) {
    const links = navMatch[1].match(/<a[^>]*>([^<]+)<\/a>/gi);
    if (links) {
      for (const link of links) {
        const text = stripTags(link).trim();
        if (text) breadcrumbs.push(text);
      }
    }
  }
  return breadcrumbs;
}

function extractLastModified(h: string): string | undefined {
  const meta = h.match(/<meta\s+property="article:modified_time"\s+content="([^"]+)"/i);
  if (meta) return meta[1];
  const date = h.match(/<time[^>]*datetime="([^"]+)"/i);
  if (date) return date[1];
  return undefined;
}

function extractSections(html: string): { heading: string; level: number; content: string }[] {
  const sections: { heading: string; level: number; content: string }[] = [];
  const regex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>([\s\S]*?)(?=<h[1-6]|$)/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1]);
    const heading = stripTags(match[2]).trim();
    const content = stripTags(match[3]).trim().slice(0, 2000);
    if (heading) sections.push({ heading, level, content });
  }
  return sections;
}

function extractHeadings(h: string) {
  const r: string[] = [];
  const rx = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let m;
  while ((m = rx.exec(h)) !== null) r.push(stripTags(m[2]).trim());
  return r;
}

function extractCodeBlocks(h: string) {
  const r: string[] = [];
  const rx = /<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi;
  let m;
  while ((m = rx.exec(h)) !== null) r.push(stripTags(m[1]).trim());
  return r;
}

function extractLinks(h: string) {
  const r: { text: string; href: string }[] = [];
  const rx = /<a\s+[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = rx.exec(h)) !== null) {
    const t = stripTags(m[2]).trim();
    if (t && m[1] && !m[1].startsWith("#") && !m[1].startsWith("javascript:")) r.push({ text: t, href: m[1] });
  }
  return r;
}

function normalizeContent(c: string) { return c.replace(/[ \t]+/g, " ").replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").map((l) => l.trim()).join("\n").replace(/\n{3,}/g, "\n\n").trim(); }
function sha256(c: string) { return createHash("sha256").update(c).digest("hex"); }
function generateId(url: string) {
  const id = url.replace("https://docs.dynatrace.com/", "dy-").replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase();
  return id.length > 80 ? id.substring(0, 80) : id;
}
function extractCategory(url: string) { const p = url.replace("https://docs.dynatrace.com/", "").split("/").filter(Boolean); return p.length > 1 ? p.slice(0, -1).join("/") : "documentation"; }

// ─── Sync Single Document ────────────────────────────────────────────────────

async function syncSingle(url: string, source: string): Promise<{ status: "created" | "updated" | "unchanged" | "failed"; url: string; isNew: boolean }> {
  try {
    const res = await fetch(url);
    if (!res.ok) return { status: "failed", url, isNew: false };
    const html = await res.text();

    const title = extractTitle(html);
    const description = extractDescription(html);
    const canonicalUrl = extractCanonicalUrl(html);
    const breadcrumbs = extractBreadcrumbs(html);
    const lastModified = extractLastModified(html);
    const headings = extractHeadings(html);
    const sections = extractSections(html);
    const codeBlocks = extractCodeBlocks(html);
    const links = extractLinks(html);

    const mainHtml = stripNoise(extractMain(html));
    const rawContent = stripTags(mainHtml);
    const normalized = normalizeContent(rawContent);
    const hash = sha256(normalized);
    const now = new Date().toISOString();
    const id = generateId(url);

    // Content quality checks
    const parserWarnings: string[] = [];
    if (rawContent.length < 500) parserWarnings.push("content shorter than expected");
    if (sections.length === 0) parserWarnings.push("no sections detected");
    if (codeBlocks.length === 0 && rawContent.length > 5000) parserWarnings.push("long content without code examples");
    if (!canonicalUrl) parserWarnings.push("canonical URL missing");
    if (!lastModified) parserWarnings.push("last modified date missing");
    if (description.length === 0) parserWarnings.push("description missing");

    const existing = await getStoredData(id);

    if (!existing) {
      const doc = { id, title, description, url, sourceUrl: url, canonicalUrl, breadcrumbs, source, category: extractCategory(url), currentVersion: 1, headings, sections, codeBlocks, links, lastModified, parserWarnings, createdAt: now, updatedAt: now, lastSyncedAt: now };
      const ver = { id: `${id}-v1`, documentId: id, version: 1, content: rawContent, normalizedContent: normalized, contentHash: hash, headings, sections, codeBlocks, links, retrievedAt: now };
      await saveStoredData(id, { document: doc, versions: [ver] });
      return { status: "created", url, isNew: true };
    }

    const latest = existing.versions[existing.versions.length - 1];
    if (latest && latest.contentHash === hash) {
      existing.document.lastSyncedAt = now;
      existing.document.parserWarnings = parserWarnings;
      await saveStoredData(id, existing);
      return { status: "unchanged", url, isNew: false };
    }

    const newVersion = existing.document.currentVersion + 1;
    const ver = { id: `${id}-v${newVersion}`, documentId: id, version: newVersion, content: rawContent, normalizedContent: normalized, contentHash: hash, headings, sections, codeBlocks, links, retrievedAt: now };
    existing.document.currentVersion = newVersion;
    existing.document.lastSyncedAt = now;
    existing.document.headings = headings;
    existing.document.sections = sections;
    existing.document.codeBlocks = codeBlocks;
    existing.document.links = links;
    existing.document.lastModified = lastModified;
    existing.document.parserWarnings = parserWarnings;
    existing.versions.push(ver);
    await saveStoredData(id, existing);
    return { status: "updated", url, isNew: false };
  } catch { return { status: "failed", url, isNew: false }; }
}

// ─── Batch Processing ────────────────────────────────────────────────────────

async function processBatch(urls: string[], source: string, batchIndex: number): Promise<BatchResult> {
  const result: BatchResult = { index: batchIndex, urls, created: 0, updated: 0, unchanged: 0, failed: 0, failedUrls: [] };
  for (const url of urls) {
    const r = await syncSingle(url, source);
    if (r.status === "created") result.created++;
    else if (r.status === "updated") result.updated++;
    else if (r.status === "unchanged") result.unchanged++;
    else { result.failed++; result.failedUrls.push(url); }
  }
  return result;
}

async function retryFailedBatch(urls: string[], source: string, batchIndex: number, retries: number): Promise<BatchResult> {
  let lastResult = await processBatch(urls, source, batchIndex);

  for (let attempt = 0; attempt < retries && lastResult.failedUrls.length > 0; attempt++) {
    const failedUrls = [...lastResult.failedUrls];
    lastResult.failedUrls = [];
    lastResult.failed = 0;

    // Wait before retry
    await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));

    for (const url of failedUrls) {
      const r = await syncSingle(url, source);
      if (r.status === "created") lastResult.created++;
      else if (r.status === "updated") lastResult.updated++;
      else if (r.status === "unchanged") lastResult.unchanged++;
      else { lastResult.failed++; lastResult.failedUrls.push(url); }
    }
  }

  return lastResult;
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default async function () {
  const source = "dynatrace-docs";
  const jobId = `sync-${Date.now()}`;

  const locked = await acquireLock(source, jobId);
  if (!locked) {
    const state = await getSyncState(source);
    return { success: false, state, error: "Sync already running" } as RunSyncResult;
  }

  const startedAt = new Date().toISOString();
  const stats = { discovered: 0, valid: 0, excluded: 0, duplicate: 0, new: 0, known: 0, processed: 0, created: 0, updated: 0, unchanged: 0, failed: 0, retried: 0 };
  const allFailedUrls: string[] = [];
  const batchResults: BatchResult[] = [];

  try {
    // Discovery
    const allUrls = await parseSitemap("https://docs.dynatrace.com/docs/sitemap.xml");
    stats.discovered = allUrls.length;

    // Filter valid URLs
    const validUrls = allUrls.filter((u) => u.includes("/docs/") && !u.endsWith(".xml"));
    stats.valid = validUrls.length;
    stats.excluded = allUrls.length - validUrls.length;

    // Deduplicate
    const uniqueUrls = [...new Set(validUrls)];
    stats.duplicate = validUrls.length - uniqueUrls.length;

    // Process all URLs (not just new ones - to detect updates)
    const urlsToProcess = uniqueUrls.slice(0, MAX_DOCUMENTS);
    stats.valid = urlsToProcess.length;

    // Process in batches
    for (let i = 0; i < urlsToProcess.length; i += BATCH_SIZE) {
      const batch = urlsToProcess.slice(i, i + BATCH_SIZE);
      const batchIndex = Math.floor(i / BATCH_SIZE);
      const result = await retryFailedBatch(batch, source, batchIndex, MAX_RETRIES);
      batchResults.push(result);

      stats.processed += result.created + result.updated + result.unchanged + result.failed;
      stats.created += result.created;
      stats.updated += result.updated;
      stats.unchanged += result.unchanged;
      stats.failed += result.failed;
      if (result.failedUrls.length > 0) stats.retried++;
      allFailedUrls.push(...result.failedUrls);
    }

    // Derived stats
    stats.new = stats.created;
    stats.known = stats.unchanged + stats.updated;
  } catch (err) {
    stats.failed = stats.processed || 1;
  }

  const completedAt = new Date().toISOString();
  const duration = Math.round((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000);

  const finalStatus: "completed" | "partial" | "failed" = stats.failed === 0 ? "completed" : stats.failed < stats.processed ? "partial" : "failed";
  await releaseLock(source, finalStatus);

  const state = await getSyncState(source);
  state.lastStartedAt = startedAt;
  state.lastCompletedAt = completedAt;
  state.lastResult = stats;
  state.lastDuration = duration;
  const nextSync = new Date();
  nextSync.setDate(nextSync.getDate() + 7);
  nextSync.setHours(2, 0, 0, 0);
  state.nextScheduledAt = nextSync.toISOString();
  await saveSyncState(state);

  const report: WeeklySyncReport = {
    id: `report-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    source, startedAt, completedAt, crawlJobId: jobId,
    discovery: { discovered: stats.discovered, valid: stats.valid, excluded: stats.excluded, duplicate: stats.duplicate, new: stats.new, known: stats.known, failedUrls: allFailedUrls },
    batches: batchResults, totalProcessed: stats.processed,
    created: stats.created, updated: stats.updated, unchanged: stats.unchanged, failed: stats.failed, retried: stats.retried,
    changesCount: stats.created + stats.updated, status: finalStatus, duration,
  };
  await saveToStore(SYNC_REPORT_TYPE, report.id, report);

  return { success: finalStatus === "completed" || finalStatus === "partial", state, report } as RunSyncResult;
}
