import type { Document } from "./Document";
import type { DocumentVersion } from "./DocumentVersion";

export interface DocumentRepository {
  getDocument(id: string): Promise<Document | null>;
  getLatestVersion(documentId: string): Promise<DocumentVersion | null>;
  getVersion(documentId: string, version: number): Promise<DocumentVersion | null>;
  getVersions(documentId: string): Promise<DocumentVersion[]>;
  createDocument(document: Document): Promise<void>;
  createVersion(version: DocumentVersion): Promise<void>;
  listDocuments(): Promise<Document[]>;
}
