import { documentsClient } from "@dynatrace-sdk/client-document";
import type { Document } from "../../domain/documents/Document";
import type { DocumentVersion } from "../../domain/documents/DocumentVersion";
import type { DocumentRepository } from "../../domain/documents/DocumentRepository";

const DYANE_TYPE = "dyane-document";

interface StoredData {
  document: Document;
  versions: DocumentVersion[];
}

export class DocumentServiceRepository implements DocumentRepository {
  async getDocument(id: string): Promise<Document | null> {
    try {
      const result = await documentsClient.getDocument({ id });
      const data = JSON.parse(await this.readContent(result.content)) as StoredData;
      return data.document;
    } catch {
      return null;
    }
  }

  async getLatestVersion(documentId: string): Promise<DocumentVersion | null> {
    try {
      const result = await documentsClient.getDocument({ id: documentId });
      const data = JSON.parse(await this.readContent(result.content)) as StoredData;
      if (data.versions.length === 0) return null;
      return data.versions[data.versions.length - 1];
    } catch {
      return null;
    }
  }

  async getVersion(
    documentId: string,
    version: number
  ): Promise<DocumentVersion | null> {
    try {
      const result = await documentsClient.getDocument({ id: documentId });
      const data = JSON.parse(await this.readContent(result.content)) as StoredData;
      return data.versions.find((v) => v.version === version) ?? null;
    } catch {
      return null;
    }
  }

  async getVersions(documentId: string): Promise<DocumentVersion[]> {
    try {
      const result = await documentsClient.getDocument({ id: documentId });
      const data = JSON.parse(await this.readContent(result.content)) as StoredData;
      return data.versions;
    } catch {
      return [];
    }
  }

  async createDocument(document: Document): Promise<void> {
    const data: StoredData = { document, versions: [] };
    await documentsClient.createDocument({
      body: {
        name: document.title,
        type: DYANE_TYPE,
        description: document.description,
        id: document.id,
        isPrivate: false,
        content: new Blob([JSON.stringify(data)], { type: "application/json" }),
      },
    });
  }

  async updateDocument(document: Document): Promise<void> {
    const existing = await this.getRawData(document.id);
    if (existing) {
      existing.document = document;
      await this.saveRawData(document.id, existing, true);
    }
  }

  async createVersion(version: DocumentVersion): Promise<void> {
    const existing = await this.getRawData(version.documentId);
    if (existing) {
      existing.versions.push(version);
      await this.saveRawData(version.documentId, existing, true);
    }
  }

  async listDocuments(): Promise<Document[]> {
    const result = await documentsClient.listDocuments({
      filter: `type == '${DYANE_TYPE}'`,
      pageSize: 1000,
    });

    const documents: Document[] = [];
    for (const meta of result.documents) {
      try {
        const docResult = await documentsClient.getDocument({ id: meta.id });
        const data = JSON.parse(
          await this.readContent(docResult.content)
        ) as StoredData;
        documents.push(data.document);
      } catch {
        // Skip broken documents
      }
    }

    return documents;
  }

  private async getRawData(id: string): Promise<StoredData | null> {
    try {
      const result = await documentsClient.getDocument({ id });
      return JSON.parse(await this.readContent(result.content)) as StoredData;
    } catch {
      return null;
    }
  }

  private async saveRawData(
    id: string,
    data: StoredData,
    createSnapshot: boolean
  ): Promise<void> {
    const docMeta = await documentsClient.getDocument({ id });
    await documentsClient.updateDocument({
      id,
      optimisticLockingVersion: docMeta.metadata.version,
      createSnapshot,
      body: {
        name: data.document.title,
        type: DYANE_TYPE,
        description: data.document.description,
        content: new Blob([JSON.stringify(data)], { type: "application/json" }),
      },
    });
  }

  private async readContent(content: unknown): Promise<string> {
    if (typeof content === "string") return content;
    if (content instanceof Blob) return content.text();
    if (content instanceof ArrayBuffer) {
      return new TextDecoder().decode(content);
    }
    return String(content);
  }
}
