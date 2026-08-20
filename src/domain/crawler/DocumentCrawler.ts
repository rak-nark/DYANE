export interface CrawledDocument {
  url: string;
  title: string;
  rawContent: string;
  crawledAt: string;
}

export interface CrawlSource {
  name: string;
  baseUrl: string;
  startUrls: string[];
}

export interface DocumentCrawler {
  crawl(source: CrawlSource): Promise<CrawledDocument[]>;
}
