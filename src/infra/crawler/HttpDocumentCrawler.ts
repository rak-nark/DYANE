import type {
  DocumentCrawler,
  CrawledDocument,
  CrawlSource,
} from "../../domain/crawler/DocumentCrawler";

export class HttpDocumentCrawler implements DocumentCrawler {
  async crawl(source: CrawlSource): Promise<CrawledDocument[]> {
    const results: CrawledDocument[] = [];

    for (const url of source.startUrls) {
      try {
        const response = await fetch(url);
        const rawContent = await response.text();
        const title = this.extractTitle(rawContent);

        results.push({
          url,
          title,
          rawContent,
          crawledAt: new Date().toISOString(),
        });
      } catch {
        console.error(`Failed to crawl: ${url}`);
      }
    }

    return results;
  }

  private extractTitle(html: string): string {
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return match ? match[1].trim() : "Untitled";
  }
}
