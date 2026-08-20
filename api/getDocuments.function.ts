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
  const documents: Document[] = [];

  // Try Document Service first
  try {
    const { documentsClient } = await import("@dynatrace-sdk/client-document");
    const result = await documentsClient.listDocuments({
      filter: `type == '${DYANE_TYPE}'`,
      pageSize: 1000,
    });

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
        if (data.document) {
          documents.push(data.document);
        }
      } catch {
        // Skip documents that can't be retrieved
      }
    }
  } catch {
    // Document Service unavailable, fall through to memory
  }

  // Also add any documents from memory that aren't already in the list
  const existingIds = new Set(documents.map((d) => d.id));
  for (const data of memoryStore.values()) {
    if (!existingIds.has(data.document.id)) {
      documents.push(data.document);
    }
  }

  return { documents, total: documents.length, storage: documents.length > 0 ? "combined" : "empty" };
}

export function setDocument(id: string, data: StoredData) {
  memoryStore.set(id, data);
}

export default async function () {
  return getDocuments();
}
