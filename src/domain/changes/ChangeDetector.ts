import {
  DocumentChange,
  ChangeSummary,
  ChangeType,
  createDocumentChange,
} from "./DocumentChange";

interface VersionLike {
  version: number;
  headings: string[];
  codeBlocks: string[];
  links: { text: string; href: string }[];
  normalizedContent: string;
}

interface DocumentLike {
  id: string;
  title: string;
}

function computeSummary(prev: VersionLike, curr: VersionLike): ChangeSummary {
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

  const prevHeadingOrder = prev.headings.map((h) => h.toLowerCase());
  const currHeadingOrder = curr.headings.map((h) => h.toLowerCase());
  const minLen = Math.min(prevHeadingOrder.length, currHeadingOrder.length);
  for (let i = 0; i < minLen; i++) {
    if (prevHeadingOrder[i] !== currHeadingOrder[i]) headingsModified++;
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

function hasChanges(summary: ChangeSummary): boolean {
  return (
    summary.headingsAdded > 0 ||
    summary.headingsRemoved > 0 ||
    summary.headingsModified > 0 ||
    summary.codeBlocksAdded > 0 ||
    summary.codeBlocksRemoved > 0 ||
    summary.linksAdded > 0 ||
    summary.linksRemoved > 0 ||
    summary.contentChanged
  );
}

export function detectChanges(
  doc: DocumentLike,
  versions: VersionLike[]
): DocumentChange[] {
  if (versions.length === 0) return [];

  const changes: DocumentChange[] = [];

  const sorted = [...versions].sort((a, b) => a.version - b.version);

  changes.push(
    createDocumentChange(doc.id, doc.title, 0, sorted[0].version, "created", {
      headingsAdded: sorted[0].headings.length,
      headingsRemoved: 0,
      headingsModified: 0,
      codeBlocksAdded: sorted[0].codeBlocks.length,
      codeBlocksRemoved: 0,
      linksAdded: sorted[0].links.length,
      linksRemoved: 0,
      contentChanged: true,
    })
  );

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const summary = computeSummary(prev, curr);

    if (hasChanges(summary)) {
      changes.push(
        createDocumentChange(doc.id, doc.title, prev.version, curr.version, "updated", summary)
      );
    }
  }

  return changes;
}

export function detectLatestChange(
  doc: DocumentLike,
  versions: VersionLike[]
): DocumentChange | null {
  if (versions.length === 0) return null;

  const sorted = [...versions].sort((a, b) => a.version - b.version);

  if (sorted.length === 1) {
    return createDocumentChange(doc.id, doc.title, 0, sorted[0].version, "created", {
      headingsAdded: sorted[0].headings.length,
      headingsRemoved: 0,
      headingsModified: 0,
      codeBlocksAdded: sorted[0].codeBlocks.length,
      codeBlocksRemoved: 0,
      linksAdded: sorted[0].links.length,
      linksRemoved: 0,
      contentChanged: true,
    });
  }

  const prev = sorted[sorted.length - 2];
  const curr = sorted[sorted.length - 1];
  const summary = computeSummary(prev, curr);

  return createDocumentChange(doc.id, doc.title, prev.version, curr.version, "updated", summary);
}
