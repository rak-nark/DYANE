export interface CrawlSource {
  name: string;
  baseUrl: string;
  sitemapUrl: string;
  allowedPatterns: string[];
}

export const DYNATRACE_DOCS: CrawlSource = {
  name: "dynatrace-docs",
  baseUrl: "https://docs.dynatrace.com",
  sitemapUrl: "https://docs.dynatrace.com/docs/sitemap.xml",
  allowedPatterns: [
    "https://docs.dynatrace.com/docs/*",
  ],
};
