import type { Document } from "../documents/Document";
import type { DocumentVersion } from "../documents/DocumentVersion";

export interface VersionCheckResult {
  action: "created" | "updated" | "unchanged";
  document?: Document;
  version?: DocumentVersion;
}

export interface DocumentVersionManager {
  checkAndVersion(params: {
    id: string;
    url: string;
    title: string;
    source: string;
    content: string;
  }): Promise<VersionCheckResult>;
}
