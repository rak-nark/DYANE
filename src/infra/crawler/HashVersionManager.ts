import { createHash } from "crypto";
import type { Document } from "../../domain/documents/Document";
import type { DocumentVersion } from "../../domain/documents/DocumentVersion";
import type { DocumentRepository } from "../../domain/documents/DocumentRepository";
import type {
  DocumentVersionManager,
  VersionCheckResult,
} from "../../domain/crawler/DocumentVersionManager";

export class HashVersionManager implements DocumentVersionManager {
  constructor(private repository: DocumentRepository) {}

  private calculateHash(content: string): string {
    return createHash("sha256").update(content).digest("hex");
  }

  async checkAndVersion(params: {
    id: string;
    url: string;
    title: string;
    source: string;
    content: string;
  }): Promise<VersionCheckResult> {
    const { id, url, title, source, content } = params;
    const hash = this.calculateHash(content);
    const now = new Date().toISOString();

    const existing = await this.repository.getDocument(id);

    if (!existing) {
      const document: Document = {
        id,
        url,
        title,
        source,
        currentVersion: 1,
        createdAt: now,
        updatedAt: now,
      };

      const version: DocumentVersion = {
        id: `${id}-v1`,
        documentId: id,
        version: 1,
        content,
        contentHash: hash,
        retrievedAt: now,
      };

      await this.repository.createDocument(document);
      await this.repository.createVersion(version);

      return { action: "created", document, version };
    }

    const latest = await this.repository.getLatestVersion(id);

    if (latest && latest.contentHash === hash) {
      return { action: "unchanged", document: existing };
    }

    const newVersion = existing.currentVersion + 1;
    const version: DocumentVersion = {
      id: `${id}-v${newVersion}`,
      documentId: id,
      version: newVersion,
      content,
      contentHash: hash,
      retrievedAt: now,
    };

    await this.repository.createVersion(version);

    return {
      action: "updated",
      document: existing,
      version,
    };
  }
}
