import type { CrawlJob } from "./CrawlJob";
import { createCrawlJob } from "./CrawlJob";
import type { CrawlSource } from "./CrawlSource";
import { parseSitemap, filterByPattern } from "./SitemapParser";

type SyncDocumentFn = (url: string) => Promise<{
  success: boolean;
  action?: "created" | "updated" | "unchanged";
  error?: string;
}>;

export async function crawlDocuments(
  source: CrawlSource,
  syncDocument: SyncDocumentFn
): Promise<CrawlJob> {
  const job = createCrawlJob(source.name);

  try {
    const entries = await parseSitemap(source.sitemapUrl);
    const filtered = filterByPattern(entries, source.allowedPatterns);
    job.discovered = filtered.length;

    for (const entry of filtered) {
      try {
        const result = await syncDocument(entry.url);
        job.processed++;

        if (!result.success) {
          job.failed++;
          job.errors.push(`${entry.url}: ${result.error}`);
          continue;
        }

        switch (result.action) {
          case "created":
            job.created++;
            break;
          case "updated":
            job.updated++;
            break;
          case "unchanged":
            job.unchanged++;
            break;
        }
      } catch (err) {
        job.failed++;
        job.errors.push(
          `${entry.url}: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      }
    }

    job.status = "completed";
  } catch (err) {
    job.status = "failed";
    job.errors.push(
      err instanceof Error ? err.message : "Unknown error"
    );
  }

  job.finishedAt = new Date().toISOString();
  return job;
}
