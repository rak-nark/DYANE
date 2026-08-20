import { createHash } from "crypto";

// ─── Types ───────────────────────────────────────────────────────────────────

type SyncStatus = "idle" | "running" | "completed" | "partial" | "failed";

type SyncState = {
  source: string;
  status: SyncStatus;
  lastStartedAt?: string;
  lastCompletedAt?: string;
  currentJobId?: string;
  lastResult?: {
    discovered: number;
    processed: number;
    created: number;
    updated: number;
    unchanged: number;
    failed: number;
  };
  lastDuration?: number;
};

type WeeklySyncReport = {
  id: string;
  source: string;
  startedAt: string;
  completedAt: string;
  crawlJobId: string;
  documentsDiscovered: number;
  documentsProcessed: number;
  created: number;
  updated: number;
  unchanged: number;
  failed: number;
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

const SYNC_STATE_TYPE = "dyane-sync-state";
const SYNC_REPORT_TYPE = "dyane-sync-report";
const DYANE_TYPE = "dyane-document";
const memoryStore = new Map<string, any>();
const memoryState = new Map<string, SyncState>();

// ─── Store Helpers ───────────────────────────────────────────────────────────

async function saveToStore(type: string, id: string, data: unknown): Promise<void> {
  memoryStore.set(id, data);
  try {
    const { documentsClient } = await import("@dynatrace-sdk/client-document");
    try {
      const existing = await documentsClient.getDocument({ id });
      await documentsClient.updateDocument({
        id,
        optimisticLockingVersion: existing.metadata.version,
        createSnapshot: false,
        body: { name: id, type, description: `DYANE ${type}`, content: new Blob([JSON.stringify(data)], { type: "application/json" }) },
      });
    } catch {
      await documentsClient.createDocument({
        body: { name: id, type, description: `DYANE ${type}`, id, isPrivate: false, content: new Blob([JSON.stringify(data)], { type: "application/json" }) },
      });
    }
  } catch { /* memory fallback */ }
}

async function getSyncState(source: string): Promise<SyncState> {
  const mem = memoryState.get(source);
  if (mem) return mem;
  return { source, status: "idle" };
}

async function saveSyncState(state: SyncState): Promise<void> {
  memoryState.set(state.source, state);
  await saveToStore(SYNC_STATE_TYPE, `sync-state-${state.source}`, state);
}

// ─── Document Storage ────────────────────────────────────────────────────────

type StoredData = {
  document: any;
  versions: any[];
};

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
    return JSON.parse(text) as StoredData;
  } catch {
    return null;
  }
}

async function saveStoredData(id: string, data: StoredData): Promise<void> {
  memoryStore.set(id, data);
  try {
    const { documentsClient } = await import("@dynatrace-sdk/client-document");
    try {
      const existing = await documentsClient.getDocument({ id });
      await documentsClient.updateDocument({
        id, optimisticLockingVersion: existing.metadata.version, createSnapshot: true,
        body: { name: data.document.title, type: DYANE_TYPE, description: data.document.description, content: new Blob([JSON.stringify(data)], { type: "application/json" }) },
      });
    } catch {
      await documentsClient.createDocument({
        body: { name: data.document.title, type: DYANE_TYPE, description: data.document.description, id, isPrivate: false, content: new Blob([JSON.stringify(data)], { type: "application/json" }) },
      });
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

// ─── HTML Parser (inlined) ───────────────────────────────────────────────────

function decodeEntities(t: string) { return t.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'"); }
function stripTags(h: string) { return decodeEntities(h.replace(/<[^>]+>/g, "")); }
function extractMain(h: string) { const m = h.match(/<main[^>]*>([\s\S]*?)<\/main>/i); return m ? m[1] : h; }
function stripNoise(h: string) { return h.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "").replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "").replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "").replace(/<!--[\s\S]*?-->/g, ""); }
function extractTitle(h: string) { const o = h.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i); if (o) return decodeEntities(o[1]); const t = h.match(/<title[^>]*>([^<]+)<\/title>/i); if (t) return decodeEntities(t[1].trim()); return "Untitled"; }
function extractDescription(h: string) { const o = h.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i); if (o) return decodeEntities(o[1]); const m = h.match(/<meta\s+name="description"\s+content="([^"]+)"/i); if (m) return decodeEntities(m[1]); return ""; }
function extractHeadings(h: string) { const r: string[] = []; const rx = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi; let m; while ((m = rx.exec(h)) !== null) r.push(stripTags(m[2]).trim()); return r; }
function extractCodeBlocks(h: string) { const r: string[] = []; const rx = /<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi; let m; while ((m = rx.exec(h)) !== null) r.push(stripTags(m[1]).trim()); return r; }
function extractLinks(h: string) { const r: { text: string; href: string }[] = []; const rx = /<a\s+[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi; let m; while ((m = rx.exec(h)) !== null) { const t = stripTags(m[2]).trim(); if (t && m[1] && !m[1].startsWith("#")) r.push({ text: t, href: m[1] }); } return r; }
function normalizeContent(c: string) { return c.replace(/[ \t]+/g, " ").replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").map((l) => l.trim()).join("\n").replace(/\n{3,}/g, "\n\n").trim(); }
function sha256(c: string) { return createHash("sha256").update(c).digest("hex"); }
function generateId(url: string) { return url.replace("https://docs.dynatrace.com/", "dynatrace-").replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase(); }
function extractCategory(url: string) { const p = url.replace("https://docs.dynatrace.com/", "").split("/").filter(Boolean); return p.length > 1 ? p.slice(0, -1).join("/") : "documentation"; }

// ─── Sync Single Document ────────────────────────────────────────────────────

async function syncSingle(url: string, source: string): Promise<"created" | "updated" | "unchanged" | "failed"> {
  try {
    const res = await fetch(url);
    if (!res.ok) return "failed";
    const html = await res.text();
    const title = extractTitle(html);
    const description = extractDescription(html);
    const headings = extractHeadings(html);
    const codeBlocks = extractCodeBlocks(html);
    const links = extractLinks(html);
    const rawContent = stripTags(stripNoise(extractMain(html)));
    const normalized = normalizeContent(rawContent);
    const hash = sha256(normalized);
    const now = new Date().toISOString();
    const id = generateId(url);

    const existing = await getStoredData(id);

    if (!existing) {
      const doc = { id, title, description, url, sourceUrl: url, source, category: extractCategory(url), currentVersion: 1, headings, codeBlocks, links, createdAt: now, updatedAt: now, lastSyncedAt: now };
      const ver = { id: `${id}-v1`, documentId: id, version: 1, content: rawContent, normalizedContent: normalized, contentHash: hash, headings, codeBlocks, links, retrievedAt: now };
      await saveStoredData(id, { document: doc, versions: [ver] });
      return "created";
    }

    const latest = existing.versions[existing.versions.length - 1];
    if (latest && latest.contentHash === hash) {
      existing.document.lastSyncedAt = now;
      await saveStoredData(id, existing);
      return "unchanged";
    }

    const newVersion = existing.document.currentVersion + 1;
    const ver = { id: `${id}-v${newVersion}`, documentId: id, version: newVersion, content: rawContent, normalizedContent: normalized, contentHash: hash, headings, codeBlocks, links, retrievedAt: now };
    existing.document.currentVersion = newVersion;
    existing.document.lastSyncedAt = now;
    existing.document.headings = headings;
    existing.document.codeBlocks = codeBlocks;
    existing.document.links = links;
    existing.versions.push(ver);
    await saveStoredData(id, existing);
    return "updated";
  } catch {
    return "failed";
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default async function () {
  const source = "dynatrace-docs";
  const startedAt = new Date().toISOString();
  const jobId = `sync-${Date.now()}`;

  // Update state to running
  const state: SyncState = { source, status: "running", lastStartedAt: startedAt, currentJobId: jobId };
  await saveSyncState(state);

  const stats = { discovered: 0, processed: 0, created: 0, updated: 0, unchanged: 0, failed: 0 };

  try {
    const urls = await parseSitemap("https://docs.dynatrace.com/docs/sitemap.xml");
    stats.discovered = urls.length;

    // Process in batches of 50
    for (let i = 0; i < urls.length; i += 50) {
      const batch = urls.slice(i, i + 50);
      for (const url of batch) {
        const result = await syncSingle(url, source);
        stats.processed++;
        if (result === "created") stats.created++;
        else if (result === "updated") stats.updated++;
        else if (result === "unchanged") stats.unchanged++;
        else stats.failed++;
      }
    }
  } catch (err) {
    state.status = "failed";
  }

  const completedAt = new Date().toISOString();
  const duration = Math.round((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000);

  // Update final state
  const finalStatus: SyncStatus = stats.failed === stats.processed ? "failed" : stats.failed > 0 ? "partial" : "completed";
  const finalState: SyncState = {
    ...state,
    status: finalStatus,
    lastCompletedAt: completedAt,
    currentJobId: undefined,
    lastResult: stats,
    lastDuration: duration,
  };
  await saveSyncState(finalState);

  // Create report
  const report: WeeklySyncReport = {
    id: `report-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    source,
    startedAt,
    completedAt,
    crawlJobId: jobId,
    documentsDiscovered: stats.discovered,
    documentsProcessed: stats.processed,
    created: stats.created,
    updated: stats.updated,
    unchanged: stats.unchanged,
    failed: stats.failed,
    changesCount: stats.created + stats.updated,
    status: finalStatus,
    duration,
  };
  await saveToStore(SYNC_REPORT_TYPE, report.id, report);

  return {
    success: finalStatus === "completed" || finalStatus === "partial",
    state: finalState,
    report,
  } as RunSyncResult;
}
