export type CrawlSourceType = "sitemap" | "rss" | "api" | "page-discovery";

export interface CrawlSource {
  id: string;
  host: string;
  type: CrawlSourceType;
  sitemapUrl?: string;
  baseUrl?: string;
  allowedPatterns: string[];
  enabled: boolean;
}

export const DYNATRACE_DOCS: CrawlSource = {
  id: "dynatrace-docs",
  host: "docs.dynatrace.com",
  type: "sitemap",
  baseUrl: "https://docs.dynatrace.com",
  sitemapUrl: "https://docs.dynatrace.com/docs/sitemap.xml",
  allowedPatterns: ["https://docs.dynatrace.com/docs/*"],
  enabled: true,
};

export const ALL_SOURCES: CrawlSource[] = [DYNATRACE_DOCS];
