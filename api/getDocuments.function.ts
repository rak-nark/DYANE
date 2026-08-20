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

type StoredData = {
  document: Document;
  versions: unknown[];
};

const DYANE_TYPE = "dyane-document";

const memoryStore = new Map<string, StoredData>();

export async function getDocuments(): Promise<{ documents: Document[]; total: number; storage: string }> {
  // Try Document Service first
  try {
    const { documentsClient } = await import("@dynatrace-sdk/client-document");
    const result = await documentsClient.listDocuments({
      filter: `type == "${DYANE_TYPE}"`,
      pageSize: 1000,
    });

    const documents: Document[] = [];

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
        const data = JSON.parse(text) as StoredData;
        documents.push(data.document);
      } catch {
        // Skip broken documents
      }
    }

    if (documents.length > 0) {
      return { documents, total: documents.length, storage: "document-service" };
    }
  } catch {
    // Fall through to memory
  }

  // Fallback to memory
  const documents: Document[] = [];
  for (const data of memoryStore.values()) {
    documents.push(data.document);
  }

  return { documents, total: documents.length, storage: "memory" };
}

// Called by syncDocument/crawlDocuments to persist data
export function setDocument(id: string, data: StoredData) {
  memoryStore.set(id, data);
}

// For App Function export
export default async function () {
  return getDocuments();
}
