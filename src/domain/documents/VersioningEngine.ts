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
      .replace(/[ \t]+/g, " ")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  async processDocument(params: {
    id: string;
    title: string;
    description: string;
    url: string;
    sourceUrl: string;
    source: string;
    category: string;
    content: string;
    headings: string[];
    codeBlocks: string[];
    links: { text: string; href: string }[];
  }): Promise<{
    action: "created" | "updated" | "unchanged";
    document: Document;
    version: DocumentVersion;
  }> {
    const normalized = this.normalizeContent(params.content);
    const hash = this.calculateHash(normalized);
    const now = new Date().toISOString();

    const existing = await this.repository.getDocument(params.id);

    if (!existing) {
      const document: Document = {
        id: params.id,
        title: params.title,
        description: params.description,
        url: params.url,
        sourceUrl: params.sourceUrl,
        source: params.source,
        category: params.category,
        currentVersion: 1,
        headings: params.headings,
        codeBlocks: params.codeBlocks,
        links: params.links,
        createdAt: now,
        updatedAt: now,
        lastSyncedAt: now,
      };

      const version: DocumentVersion = {
        id: `${params.id}-v1`,
        documentId: params.id,
        version: 1,
        content: params.content,
        normalizedContent: normalized,
        contentHash: hash,
        headings: params.headings,
        codeBlocks: params.codeBlocks,
        links: params.links,
        retrievedAt: now,
      };

      await this.repository.createDocument(document);
      await this.repository.createVersion(version);

      return { action: "created", document, version };
    }

    const latest = await this.repository.getLatestVersion(params.id);

    if (latest && latest.contentHash === hash) {
      existing.lastSyncedAt = now;
      await this.repository.updateDocument(existing);
      return { action: "unchanged", document: existing, version: latest };
    }

    const newVersion = existing.currentVersion + 1;
    const version: DocumentVersion = {
      id: `${params.id}-v${newVersion}`,
      documentId: params.id,
      version: newVersion,
      content: params.content,
      normalizedContent: normalized,
      contentHash: hash,
      headings: params.headings,
      codeBlocks: params.codeBlocks,
      links: params.links,
      retrievedAt: now,
    };

    existing.currentVersion = newVersion;
    existing.lastSyncedAt = now;
    existing.headings = params.headings;
    existing.codeBlocks = params.codeBlocks;
    existing.links = params.links;
    await this.repository.updateDocument(existing);
    await this.repository.createVersion(version);

    return { action: "updated", document: existing, version };
  }
}
