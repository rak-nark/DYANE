import type { DocumentCrawler, CrawlSource } from "../../domain/crawler/DocumentCrawler";
import type { DocumentNormalizer } from "../../domain/crawler/DocumentNormalizer";
import type { DocumentVersionManager, VersionCheckResult } from "../../domain/crawler/DocumentVersionManager";

export interface PipelineResult {
  url: string;
  title: string;
  result: VersionCheckResult;
}

export class CrawlerPipeline {
  constructor(
    private crawler: DocumentCrawler,
    private normalizer: DocumentNormalizer,
    private versionManager: DocumentVersionManager
  ) {}

  async run(source: CrawlSource): Promise<PipelineResult[]> {
    const crawled = await this.crawler.crawl(source);
    const results: PipelineResult[] = [];

    for (const doc of crawled) {
      const normalized = this.normalizer.normalizeDocument(doc);
      const id = this.generateId(source.name, normalized.url);

      const result = await this.versionManager.checkAndVersion({
        id,
        url: normalized.url,
        title: normalized.title,
        source: source.name,
        content: normalized.content,
      });

      results.push({
        url: normalized.url,
        title: normalized.title,
        result,
      });
    }

    return results;
  }

  private generateId(source: string, url: string): string {
    const slug = url
      .replace(/^https?:\/\//, "")
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();
    return `${source}-${slug}`;
  }
}
