export type Document = {
  id: string;
  title: string;
  url: string;
  source: string;
  category: string;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
  lastSyncedAt: string | null;
};

export const mockDocuments: Document[] = [
  {
    id: "dynatrace-doc-001",
    title: "Dynatrace Platform Overview",
    url: "https://docs.dynatrace.com/platform",
    source: "dynatrace-docs",
    category: "getting-started",
    currentVersion: 1,
    createdAt: "2026-08-19T00:00:00Z",
    updatedAt: "2026-08-19T00:00:00Z",
    lastSyncedAt: null,
  },
  {
    id: "dynatrace-doc-002",
    title: "Dynatrace REST API",
    url: "https://docs.dynatrace.com/api",
    source: "dynatrace-docs",
    category: "api",
    currentVersion: 1,
    createdAt: "2026-08-19T00:00:00Z",
    updatedAt: "2026-08-19T00:00:00Z",
    lastSyncedAt: null,
  },
  {
    id: "dynatrace-doc-003",
    title: "Dynatrace MCP Integration",
    url: "https://docs.dynatrace.com/mcp",
    source: "dynatrace-docs",
    category: "integration",
    currentVersion: 1,
    createdAt: "2026-08-19T00:00:00Z",
    updatedAt: "2026-08-19T00:00:00Z",
    lastSyncedAt: null,
  },
];
