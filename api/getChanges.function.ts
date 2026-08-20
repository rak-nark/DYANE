import { createHash } from "crypto";

// ─── Types ───────────────────────────────────────────────────────────────────

type ChangeSummary = {
  headingsAdded: number;
  headingsRemoved: number;
  headingsModified: number;
  codeBlocksAdded: number;
  codeBlocksRemoved: number;
  linksAdded: number;
  linksRemoved: number;
  contentChanged: boolean;
};

type DocumentChange = {
  id: string;
  documentId: string;
  documentTitle: string;
  fromVersion: number;
  toVersion: number;
  detectedAt: string;
  type: "created" | "updated" | "removed";
  summary: ChangeSummary;
  description: string;
};

type DocumentVersion = {
  version: number;
  headings: string[];
  codeBlocks: string[];
  links: { text: string; href: string }[];
  normalizedContent: string;
};

type StoredData = {
  document: {
    id: string;
    title: string;
  };
  versions: DocumentVersion[];
};

// ─── Change Detection ────────────────────────────────────────────────────────

function computeSummary(prev: DocumentVersion, curr: DocumentVersion): ChangeSummary {
  const prevHeadings = new Set(prev.headings.map((h) => h.toLowerCase()));
  const currHeadings = new Set(curr.headings.map((h) => h.toLowerCase()));

  let headingsAdded = 0;
  let headingsRemoved = 0;
  let headingsModified = 0;

  for (const h of currHeadings) {
    if (!prevHeadings.has(h)) headingsAdded++;
  }
  for (const h of prevHeadings) {
    if (!currHeadings.has(h)) headingsRemoved++;
  }

  const prevOrder = prev.headings.map((h) => h.toLowerCase());
  const currOrder = curr.headings.map((h) => h.toLowerCase());
  const minLen = Math.min(prevOrder.length, currOrder.length);
  for (let i = 0; i < minLen; i++) {
    if (prevOrder[i] !== currOrder[i]) headingsModified++;
  }

  const prevCode = new Set(prev.codeBlocks);
  const currCode = new Set(curr.codeBlocks);
  let codeBlocksAdded = 0;
  let codeBlocksRemoved = 0;
  for (const c of currCode) if (!prevCode.has(c)) codeBlocksAdded++;
  for (const c of prevCode) if (!currCode.has(c)) codeBlocksRemoved++;

  const prevLinks = new Set(prev.links.map((l) => l.href));
  const currLinks = new Set(curr.links.map((l) => l.href));
  let linksAdded = 0;
  let linksRemoved = 0;
  for (const l of currLinks) if (!prevLinks.has(l)) linksAdded++;
  for (const l of prevLinks) if (!currLinks.has(l)) linksRemoved++;

  const contentChanged = prev.normalizedContent !== curr.normalizedContent;

  return {
    headingsAdded,
    headingsRemoved,
    headingsModified,
    codeBlocksAdded,
    codeBlocksRemoved,
    linksAdded,
    linksRemoved,
    contentChanged,
  };
}

function hasChanges(s: ChangeSummary): boolean {
  return (
    s.headingsAdded > 0 ||
    s.headingsRemoved > 0 ||
    s.headingsModified > 0 ||
    s.codeBlocksAdded > 0 ||
    s.codeBlocksRemoved > 0 ||
    s.linksAdded > 0 ||
    s.linksRemoved > 0 ||
    s.contentChanged
  );
}

function buildDescription(type: string, s: ChangeSummary): string {
  if (type === "created") return "Document created";
  if (type === "removed") return "Document removed";

  const parts: string[] = [];
  if (s.headingsAdded > 0) parts.push(`+${s.headingsAdded} heading${s.headingsAdded > 1 ? "s" : ""}`);
  if (s.headingsRemoved > 0) parts.push(`-${s.headingsRemoved} heading${s.headingsRemoved > 1 ? "s" : ""}`);
  if (s.headingsModified > 0) parts.push(`~${s.headingsModified} section${s.headingsModified > 1 ? "s" : ""}`);
  if (s.codeBlocksAdded > 0) parts.push(`+${s.codeBlocksAdded} code block${s.codeBlocksAdded > 1 ? "s" : ""}`);
  if (s.codeBlocksRemoved > 0) parts.push(`-${s.codeBlocksRemoved} code block${s.codeBlocksRemoved > 1 ? "s" : ""}`);
  if (s.linksAdded > 0) parts.push(`+${s.linksAdded} link${s.linksAdded > 1 ? "s" : ""}`);
  if (s.linksRemoved > 0) parts.push(`-${s.linksRemoved} link${s.linksRemoved > 1 ? "s" : ""}`);
  if (s.contentChanged && parts.length === 0) parts.push("~ content modified");

  return parts.length > 0 ? parts.join(", ") : "No structural changes";
}

function detectChanges(doc: { id: string; title: string }, versions: DocumentVersion[]): DocumentChange[] {
  if (versions.length === 0) return [];

  const sorted = [...versions].sort((a, b) => a.version - b.version);
  const changes: DocumentChange[] = [];

  // First version = creation
  changes.push({
    id: `${doc.id}-change-0-${sorted[0].version}`,
    documentId: doc.id,
    documentTitle: doc.title,
    fromVersion: 0,
    toVersion: sorted[0].version,
    detectedAt: new Date().toISOString(),
    type: "created",
    summary: {
      headingsAdded: sorted[0].headings.length,
      headingsRemoved: 0,
      headingsModified: 0,
      codeBlocksAdded: sorted[0].codeBlocks.length,
      codeBlocksRemoved: 0,
      linksAdded: sorted[0].links.length,
      linksRemoved: 0,
      contentChanged: true,
    },
    description: "Document created",
  });

  // Detect changes between consecutive versions
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const summary = computeSummary(prev, curr);

    if (hasChanges(summary)) {
      changes.push({
        id: `${doc.id}-change-${prev.version}-${curr.version}`,
        documentId: doc.id,
        documentTitle: doc.title,
        fromVersion: prev.version,
        toVersion: curr.version,
        detectedAt: new Date().toISOString(),
        type: "updated",
        summary,
        description: buildDescription("updated", summary),
      });
    }
  }

  return changes;
}

// ─── In-Memory Fallback ──────────────────────────────────────────────────────

const DYANE_TYPE = "dyane-document";
const memoryStore = new Map<string, StoredData>();

async function getAllDocuments(): Promise<StoredData[]> {
  // Try Document Service
  try {
    const { documentsClient } = await import("@dynatrace-sdk/client-document");
    const result = await documentsClient.listDocuments({
      filter: `type == "${DYANE_TYPE}"`,
      pageSize: 1000,
    });

    const docs: StoredData[] = [];
    for (const meta of result.documents) {
      try {
        const docResult = await documentsClient.getDocument({ id: meta.id });
        const content = docResult.content;
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
        docs.push(JSON.parse(text) as StoredData);
      } catch {
        // skip
      }
    }

    if (docs.length > 0) return docs;
  } catch {
    // fall through
  }

  // Fallback to memory
  return Array.from(memoryStore.values());
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default async function () {
  const documents = await getAllDocuments();

  const allChanges: DocumentChange[] = [];

  for (const data of documents) {
    const versions: DocumentVersion[] = data.versions.map((v: any) => ({
      version: v.version,
      headings: v.headings || [],
      codeBlocks: v.codeBlocks || [],
      links: v.links || [],
      normalizedContent: v.normalizedContent || "",
    }));

    const changes = detectChanges(data.document, versions);
    allChanges.push(...changes);
  }

  // Sort by detectedAt descending (most recent first)
  allChanges.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());

  return {
    changes: allChanges,
    total: allChanges.length,
  };
}
