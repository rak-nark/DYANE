export type CrawlJobStatus = "running" | "completed" | "failed";

export interface CrawlJob {
  id: string;
  source: string;
  startedAt: string;
  finishedAt?: string;
  discovered: number;
  processed: number;
  created: number;
  updated: number;
  unchanged: number;
  failed: number;
  status: CrawlJobStatus;
  errors: string[];
}

export function createCrawlJob(source: string): CrawlJob {
  return {
    id: `crawl-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    source,
    startedAt: new Date().toISOString(),
    discovered: 0,
    processed: 0,
    created: 0,
    updated: 0,
    unchanged: 0,
    failed: 0,
    status: "running",
    errors: [],
  };
}
