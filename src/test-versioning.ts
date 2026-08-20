import { InMemoryRepository } from "./infra/repositories/InMemoryRepository";
import { VersioningEngine } from "./domain/documents/VersioningEngine";

async function main() {
  const repository = new InMemoryRepository();
  const engine = new VersioningEngine(repository);

  console.log("=== DYANE Versioning Engine Test ===\n");

  // Run 1: First time seeing this document
  console.log("--- Run 1: First crawl ---");
  const result1 = await engine.processDocument(
    "doc-001",
    "https://docs.dynatrace.com/kubernetes",
    "How to configure Kubernetes",
    "dynatrace-docs",
    "How to configure Kubernetes"
  );
  console.log(`Action: ${result1.action}, Version: ${result1.version}`);

  const doc1 = await repository.getDocument("doc-001");
  console.log(`Document: ${doc1?.title}, Current version: ${doc1?.currentVersion}`);

  // Run 2: Same content, no change
  console.log("\n--- Run 2: Same content ---");
  const result2 = await engine.processDocument(
    "doc-001",
    "https://docs.dynatrace.com/kubernetes",
    "How to configure Kubernetes",
    "dynatrace-docs",
    "How to configure Kubernetes"
  );
  console.log(`Action: ${result2.action}`);

  // Run 3: Content changed
  console.log("\n--- Run 3: Content updated ---");
  const result3 = await engine.processDocument(
    "doc-001",
    "https://docs.dynatrace.com/kubernetes",
    "How to configure Kubernetes",
    "dynatrace-docs",
    "How to configure Kubernetes using Dynatrace"
  );
  console.log(`Action: ${result3.action}, Version: ${result3.version}`);

  const doc2 = await repository.getDocument("doc-001");
  console.log(`Document: ${doc2?.title}, Current version: ${doc2?.currentVersion}`);

  // Show all versions
  console.log("\n--- All versions ---");
  const versions = await repository.getVersions("doc-001");
  for (const v of versions) {
    console.log(`  v${v.version}: hash=${v.contentHash.substring(0, 8)}... content="${v.content}"`);
  }

  console.log("\n=== Test completed ===");
}

main().catch(console.error);
