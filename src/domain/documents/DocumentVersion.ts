export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  content: string;
  contentHash: string;
  retrievedAt: string;
}
