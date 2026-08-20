export interface Document {
  id: string;
  title: string;
  url: string;
  source: string;
  category?: string;
  content?: string;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
  lastSyncedAt?: string;
}
