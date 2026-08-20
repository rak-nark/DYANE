// ─── Parser Test Cases ───────────────────────────────────────────────────────
// Representative sample of Dynatrace documentation pages for parser audit.
// Each type tests a different parser challenge.

export type TestCaseType = "normal" | "api" | "mcp" | "cli" | "tutorial" | "table" | "tabs" | "images" | "deep" | "updated" | "links";

export type TestCase = {
  url: string;
  type: TestCaseType;
  description: string;
  expected: {
    hasTitle: boolean;
    hasDescription: boolean;
    minSections: number;
    hasCode: boolean;
    hasBreadcrumbs: boolean;
    hasCanonicalUrl: boolean;
    hasLastModified: boolean;
    minLinks: number;
  };
};

export const TEST_CASES: TestCase[] = [
  {
    url: "https://docs.dynatrace.com/docs/platform-modules/infrastructure-monitoring/host-monitoring/host-monitoring",
    type: "normal",
    description: "Documentación normal — estructura básica",
    expected: { hasTitle: true, hasDescription: true, minSections: 3, hasCode: false, hasBreadcrumbs: true, hasCanonicalUrl: true, hasLastModified: true, minLinks: 5 },
  },
  {
    url: "https://docs.dynatrace.com/docs/api/rest-api/monitored-entities",
    type: "api",
    description: "API — endpoints + código",
    expected: { hasTitle: true, hasDescription: true, minSections: 2, hasCode: true, hasBreadcrumbs: true, hasCanonicalUrl: true, hasLastModified: true, minLinks: 3 },
  },
  {
    url: "https://docs.dynatrace.com/docs/platform-modules/infrastructure-monitoring/host-monitoring/extensions/dynatrace-oneagent-extensions-sdk",
    type: "mcp",
    description: "SDK/Extension — integración + código",
    expected: { hasTitle: true, hasDescription: true, minSections: 2, hasCode: true, hasBreadcrumbs: true, hasCanonicalUrl: true, hasLastModified: true, minLinks: 3 },
  },
  {
    url: "https://docs.dynatrace.com/docs/shortlived/dynatrace-cli",
    type: "cli",
    description: "CLI — comandos",
    expected: { hasTitle: true, hasDescription: true, minSections: 2, hasCode: true, hasBreadcrumbs: true, hasCanonicalUrl: true, hasLastModified: true, minLinks: 2 },
  },
  {
    url: "https://docs.dynatrace.com/docs/get-started/quickstart/quickstart-1-create-a-simple-alert",
    type: "tutorial",
    description: "Tutorial — pasos",
    expected: { hasTitle: true, hasDescription: true, minSections: 2, hasCode: false, hasBreadcrumbs: true, hasCanonicalUrl: true, hasLastModified: true, minLinks: 3 },
  },
  {
    url: "https://docs.dynatrace.com/docs/platform-modules/infrastructure-monitoring/host-monitoring/host-monitoring-overview",
    type: "table",
    description: "Página con tablas — información estructurada",
    expected: { hasTitle: true, hasDescription: true, minSections: 2, hasCode: false, hasBreadcrumbs: true, hasCanonicalUrl: true, hasLastModified: true, minLinks: 5 },
  },
  {
    url: "https://docs.dynatrace.com/docs/get-started/quickstart",
    type: "tabs",
    description: "Quickstart — contenido con tabs (Linux/Windows/K8s)",
    expected: { hasTitle: true, hasDescription: true, minSections: 2, hasCode: true, hasBreadcrumbs: true, hasCanonicalUrl: true, hasLastModified: true, minLinks: 5 },
  },
  {
    url: "https://docs.dynatrace.com/docs/platform-modules/infrastructure-monitoring/container-platform-monitoring/kubernetes-monitoring/kubernetes-monitoring",
    type: "images",
    description: "Kubernetes — contenido con imágenes/diagramas",
    expected: { hasTitle: true, hasDescription: true, minSections: 3, hasCode: false, hasBreadcrumbs: true, hasCanonicalUrl: true, hasLastModified: true, minLinks: 5 },
  },
  {
    url: "https://docs.dynatrace.com/docs/platform-modules/infrastructure-monitoring/process-modules/process-monitoring/process-details",
    type: "deep",
    description: "Process details — página profunda con breadcrumbs",
    expected: { hasTitle: true, hasDescription: true, minSections: 2, hasCode: false, hasBreadcrumbs: true, hasCanonicalUrl: true, hasLastModified: true, minLinks: 5 },
  },
  {
    url: "https://docs.dynatrace.com/docs/platform-modules/infrastructure-monitoring/host-monitoring/dynatrace-oneagent",
    type: "updated",
    description: "OneAgent — página frecuentemente actualizada",
    expected: { hasTitle: true, hasDescription: true, minSections: 3, hasCode: true, hasBreadcrumbs: true, hasCanonicalUrl: true, hasLastModified: true, minLinks: 10 },
  },
  {
    url: "https://docs.dynatrace.com/docs/platform-modules/infrastructure-monitoring/host-monitoring/host-monitoring-overview",
    type: "links",
    description: "Host monitoring overview — muchos links internos",
    expected: { hasTitle: true, hasDescription: true, minSections: 2, hasCode: false, hasBreadcrumbs: true, hasCanonicalUrl: true, hasLastModified: true, minLinks: 15 },
  },
];

export function getTestCasesByType(type: TestCaseType): TestCase[] {
  return TEST_CASES.filter((tc) => tc.type === type);
}

export function getTestSummary(results: { url: string; type: string; success: boolean; score: number; warnings: string[] }[]) {
  const byType = new Map<string, { total: number; passed: number; failed: number; avgScore: number }>();

  for (const r of results) {
    const existing = byType.get(r.type) || { total: 0, passed: 0, failed: 0, avgScore: 0 };
    existing.total++;
    if (r.score >= 70) existing.passed++;
    else existing.failed++;
    existing.avgScore = (existing.avgScore * (existing.total - 1) + r.score) / existing.total;
    byType.set(r.type, existing);
  }

  return Object.fromEntries(byType);
}
