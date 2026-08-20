import { createHash } from "crypto";
import type { Document } from "../../domain/documents/Document";
import type { DocumentVersion } from "../../domain/documents/DocumentVersion";
import type { DocumentRepository } from "../../domain/documents/DocumentRepository";

export class VersioningEngine {
  constructor(private repository: DocumentRepository) {}

  private calculateHash(content: string): string {
    return createHash("sha256").update(content).digest("hex");
  }

  private normalizeContent(content: string): string {
    return content
      .replace(/\s+/g, " ")
      .replace(/\n+/g, "\n")
      .trim();
  }

  async processDocument(
    id: string,
    url: string,
    title: string,
    source: string,
    content: string
  ): Promise<{ action: "created" | "updated" | "unchanged"; version?: number }> {
    const normalized = this.normalizeContent(content);
    const hash = this.calculateHash(normalized);
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
        content: normalized,
        contentHash: hash,
        retrievedAt: now,
      };

      await this.repository.createDocument(document);
      await this.repository.createVersion(version);

      return { action: "created", version: 1 };
    }

    const latest = await this.repository.getLatestVersion(id);

    if (latest && latest.contentHash === hash) {
      return { action: "unchanged" };
    }

    const newVersion = existing.currentVersion + 1;
    const version: DocumentVersion = {
      id: `${id}-v${newVersion}`,
      documentId: id,
      version: newVersion,
      content: normalized,
      contentHash: hash,
      retrievedAt: now,
    };

    await this.repository.createVersion(version);

    return { action: "updated", version: newVersion };
  }
}
