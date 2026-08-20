import type { Document } from "../../domain/documents/Document";
import type { DocumentVersion } from "../../domain/documents/DocumentVersion";
import type { DocumentRepository } from "../../domain/documents/DocumentRepository";

export class InMemoryRepository implements DocumentRepository {
  private documents = new Map<string, Document>();
  private versions = new Map<string, DocumentVersion[]>();

  getDocument(id: string): Promise<Document | null> {
    return Promise.resolve(this.documents.get(id) ?? null);
  }

  getLatestVersion(documentId: string): Promise<DocumentVersion | null> {
    const docVersions = this.versions.get(documentId);
    if (!docVersions || docVersions.length === 0) return Promise.resolve(null);
    return Promise.resolve(docVersions[docVersions.length - 1]);
  }

  getVersion(
    documentId: string,
    version: number
  ): Promise<DocumentVersion | null> {
    const docVersions = this.versions.get(documentId);
    if (!docVersions) return Promise.resolve(null);
    return Promise.resolve(docVersions.find((v) => v.version === version) ?? null);
  }

  getVersions(documentId: string): Promise<DocumentVersion[]> {
    return Promise.resolve(this.versions.get(documentId) ?? []);
  }

  createDocument(document: Document): Promise<void> {
    this.documents.set(document.id, document);
    this.versions.set(document.id, []);
    return Promise.resolve();
  }

  createVersion(version: DocumentVersion): Promise<void> {
    const docVersions = this.versions.get(version.documentId) ?? [];
    docVersions.push(version);
    this.versions.set(version.documentId, docVersions);

    const doc = this.documents.get(version.documentId);
    if (doc) {
      doc.currentVersion = version.version;
      doc.updatedAt = version.retrievedAt;
    }
    return Promise.resolve();
  }

  listDocuments(): Promise<Document[]> {
    return Promise.resolve(Array.from(this.documents.values()));
  }
}
