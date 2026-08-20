type Document = {
  id: string;
  title: string;
  description: string;
  url: string;
  sourceUrl: string;
  source: string;
  category: string;
  currentVersion: number;
  headings: string[];
  codeBlocks: string[];
  links: { text: string; href: string }[];
  createdAt: string;
  updatedAt: string;
  lastSyncedAt: string | null;
};

const documents: Document[] = [
  {
    id: "dynatrace-doc-001",
    title: "Dynatrace Platform Overview",
    description: "Overview of the Dynatrace platform",
    url: "https://docs.dynatrace.com/platform",
    sourceUrl: "https://docs.dynatrace.com/platform",
    source: "dynatrace-docs",
    category: "getting-started",
    currentVersion: 1,
    headings: [],
    codeBlocks: [],
    links: [],
    createdAt: "2026-08-19T00:00:00Z",
    updatedAt: "2026-08-19T00:00:00Z",
    lastSyncedAt: null,
  },
  {
    id: "dynatrace-doc-002",
    title: "Dynatrace REST API",
    description: "REST API reference documentation",
    url: "https://docs.dynatrace.com/api",
    sourceUrl: "https://docs.dynatrace.com/api",
    source: "dynatrace-docs",
    category: "api",
    currentVersion: 1,
    headings: [],
    codeBlocks: [],
    links: [],
    createdAt: "2026-08-19T00:00:00Z",
    updatedAt: "2026-08-19T00:00:00Z",
    lastSyncedAt: null,
  },
  {
    id: "dynatrace-doc-003",
    title: "Dynatrace MCP Integration",
    description: "MCP integration guide",
    url: "https://docs.dynatrace.com/mcp",
    sourceUrl: "https://docs.dynatrace.com/mcp",
    source: "dynatrace-docs",
    category: "integration",
    currentVersion: 1,
    headings: [],
    codeBlocks: [],
    links: [],
    createdAt: "2026-08-19T00:00:00Z",
    updatedAt: "2026-08-19T00:00:00Z",
    lastSyncedAt: null,
  },
];

export default function () {
  return {
    documents,
    total: documents.length,
  };
}
