export interface WeeklySyncReport {
  id: string;
  source: string;
  startedAt: string;
  completedAt: string;
  crawlJobId: string;
  documentsDiscovered: number;
  documentsProcessed: number;
  created: number;
  updated: number;
  unchanged: number;
  failed: number;
  changesCount: number;
  status: "completed" | "partial" | "failed";
  duration: number;
}

export function createWeeklySyncReport(params: {
  source: string;
  crawlJobId: string;
  startedAt: string;
  completedAt: string;
  discovered: number;
  processed: number;
  created: number;
  updated: number;
  unchanged: number;
  failed: number;
  changesCount: number;
}): WeeklySyncReport {
  const status = params.failed === params.processed
    ? "failed"
    : params.failed > 0
      ? "partial"
      : "completed";

  const duration = Math.round(
    (new Date(params.completedAt).getTime() - new Date(params.startedAt).getTime()) / 1000
  );

  return {
    id: `report-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    source: params.source,
    startedAt: params.startedAt,
    completedAt: params.completedAt,
    crawlJobId: params.crawlJobId,
    documentsDiscovered: params.discovered,
    documentsProcessed: params.processed,
    created: params.created,
    updated: params.updated,
    unchanged: params.unchanged,
    failed: params.failed,
    changesCount: params.changesCount,
    status,
    duration,
  };
}
