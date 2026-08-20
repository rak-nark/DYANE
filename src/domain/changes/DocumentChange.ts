export type ChangeType = "created" | "updated" | "removed";

export interface ChangeSummary {
  headingsAdded: number;
  headingsRemoved: number;
  headingsModified: number;
  codeBlocksAdded: number;
  codeBlocksRemoved: number;
  linksAdded: number;
  linksRemoved: number;
  contentChanged: boolean;
}

export interface DocumentChange {
  id: string;
  documentId: string;
  documentTitle: string;
  fromVersion: number;
  toVersion: number;
  detectedAt: string;
  type: ChangeType;
  summary: ChangeSummary;
  description: string;
}

export function createDocumentChange(
  documentId: string,
  documentTitle: string,
  fromVersion: number,
  toVersion: number,
  type: ChangeType,
  summary: ChangeSummary
): DocumentChange {
  const description = buildDescription(type, summary);

  return {
    id: `${documentId}-change-${fromVersion}-${toVersion}-${Date.now()}`,
    documentId,
    documentTitle,
    fromVersion,
    toVersion,
    detectedAt: new Date().toISOString(),
    type,
    summary,
    description,
  };
}

function buildDescription(type: ChangeType, summary: ChangeSummary): string {
  if (type === "created") return "Document created";
  if (type === "removed") return "Document removed";

  const parts: string[] = [];

  if (summary.headingsAdded > 0) parts.push(`+${summary.headingsAdded} heading${summary.headingsAdded > 1 ? "s" : ""}`);
  if (summary.headingsRemoved > 0) parts.push(`-${summary.headingsRemoved} heading${summary.headingsRemoved > 1 ? "s" : ""}`);
  if (summary.headingsModified > 0) parts.push(`~${summary.headingsModified} section${summary.headingsModified > 1 ? "s" : ""}`);
  if (summary.codeBlocksAdded > 0) parts.push(`+${summary.codeBlocksAdded} code block${summary.codeBlocksAdded > 1 ? "s" : ""}`);
  if (summary.codeBlocksRemoved > 0) parts.push(`-${summary.codeBlocksRemoved} code block${summary.codeBlocksRemoved > 1 ? "s" : ""}`);
  if (summary.linksAdded > 0) parts.push(`+${summary.linksAdded} link${summary.linksAdded > 1 ? "s" : ""}`);
  if (summary.linksRemoved > 0) parts.push(`-${summary.linksRemoved} link${summary.linksRemoved > 1 ? "s" : ""}`);
  if (summary.contentChanged && parts.length === 0) parts.push("~ content modified");

  return parts.length > 0 ? parts.join(", ") : "No structural changes";
}
