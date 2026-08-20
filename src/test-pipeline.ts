import { InMemoryRepository } from "./infra/repositories/InMemoryRepository";
import { HashVersionManager } from "./infra/crawler/HashVersionManager";
import { HtmlDocumentNormalizer } from "./infra/crawler/HtmlDocumentNormalizer";
import { CrawlerPipeline } from "./domain/crawler/CrawlerPipeline";
import type { DocumentCrawler, CrawledDocument, CrawlSource } from "./domain/crawler/DocumentCrawler";

// Mock crawler that simulates fetching documents
class MockDocumentCrawler implements DocumentCrawler {
  private scenarios: Map<string, string[]> = new Map();

  addScenario(url: string, contents: string[]) {
    this.scenarios.set(url, contents);
  }

  crawl(source: CrawlSource): Promise<CrawledDocument[]> {
    const results: CrawledDocument[] = [];

    for (const url of source.startUrls) {
      const contents = this.scenarios.get(url);
      if (!contents || contents.length === 0) continue;

      const content = contents[0];
      results.push({
        url,
        title: `Doc from ${url}`,
        rawContent: `<html><head><title>Doc</title></head><body>${content}</body></html>`,
        crawledAt: new Date().toISOString(),
      });
    }

    return Promise.resolve(results);
  }
}

async function main() {
  console.log("=== DYANE Crawler Pipeline Test ===\n");

  const repository = new InMemoryRepository();
  const versionManager = new HashVersionManager(repository);
  const normalizer = new HtmlDocumentNormalizer();
  const crawler = new MockDocumentCrawler();

  const pipeline = new CrawlerPipeline(crawler, normalizer, versionManager);

  // Scenario 1: First crawl
  console.log("--- Run 1: First crawl ---");
  crawler.addScenario("https://docs.example.com/k8s", [
    "How to configure Kubernetes monitoring",
  ]);

  const source: CrawlSource = {
    name: "dynatrace-docs",
    baseUrl: "https://docs.example.com",
    startUrls: ["https://docs.example.com/k8s"],
  };

  let results = await pipeline.run(source);
  for (const r of results) {
    console.log(`  ${r.title}: ${r.result.action} (v${r.result.version?.version})`);
  }

  // Scenario 2: Same content
  console.log("\n--- Run 2: Same content ---");
  results = await pipeline.run(source);
  for (const r of results) {
    console.log(`  ${r.title}: ${r.result.action}`);
  }

  // Scenario 3: Content changed
  console.log("\n--- Run 3: Content updated ---");
  crawler.addScenario("https://docs.example.com/k8s", [
    "How to configure Kubernetes monitoring with Dynatrace",
  ]);

  results = await pipeline.run(source);
  for (const r of results) {
    console.log(`  ${r.title}: ${r.result.action} (v${r.result.version?.version})`);
  }

  // Show all versions
  console.log("\n--- All versions ---");
  const docs = await repository.listDocuments();
  for (const doc of docs) {
    console.log(`  ${doc.title} (${doc.id}): ${doc.currentVersion} versions`);
    const versions = await repository.getVersions(doc.id);
    for (const v of versions) {
      console.log(`    v${v.version}: hash=${v.contentHash.substring(0, 8)}...`);
    }
  }

  console.log("\n=== Test completed ===");
}

main().catch(console.error);
