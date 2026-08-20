type BatchResult = {
  batchIndex: number;
  urls: string[];
  created: number;
  updated: number;
  unchanged: number;
  failed: number;
  errors: string[];
};

type CrawlJob = {
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
  status: string;
  errors: string[];
  batches: BatchResult[];
};

type StoredCrawlJob = {
  job: CrawlJob;
};

const CRAWL_JOB_TYPE = "dyane-crawl-job";
const memoryStore = new Map<string, StoredCrawlJob>();

export default async function () {
  // Try Document Service
  try {
    const { documentsClient } = await import("@dynatrace-sdk/client-document");
    const result = await documentsClient.listDocuments({
      filter: `type == "${CRAWL_JOB_TYPE}"`,
      pageSize: 100,
    });

    const jobs: CrawlJob[] = [];

    for (const meta of result.documents) {
      try {
        const docResult = await documentsClient.getDocument({ id: meta.id });
        const content = docResult.content;
        let text: string;
        if (typeof content === "string") {
          text = content;
        } else if (content instanceof Blob) {
          text = await content.text();
        } else if (content instanceof ArrayBuffer) {
          text = new TextDecoder().decode(content);
        } else {
          text = String(content);
        }
        const data = JSON.parse(text) as CrawlJob;
        jobs.push(data);
      } catch {
        // skip
      }
    }

    if (jobs.length > 0) {
      jobs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
      return { jobs, total: jobs.length };
    }
  } catch {
    // fall through
  }

  // Fallback to memory
  const jobs: CrawlJob[] = Array.from(memoryStore.values()).map((s) => s.job);
  jobs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  return { jobs, total: jobs.length };
}
