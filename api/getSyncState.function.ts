type SyncStatus = "idle" | "running" | "completed" | "partial" | "failed";

type SyncState = {
  source: string;
  status: SyncStatus;
  lastStartedAt?: string;
  lastCompletedAt?: string;
  currentJobId?: string;
  nextScheduledAt?: string;
  lastResult?: {
    discovered: number;
    processed: number;
    created: number;
    updated: number;
    unchanged: number;
    failed: number;
  };
  lastDuration?: number;
};

type WeeklySyncReport = {
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
};

const SYNC_STATE_TYPE = "dyane-sync-state";
const SYNC_REPORT_TYPE = "dyane-sync-report";

const defaultState: SyncState = {
  source: "dynatrace-docs",
  status: "idle",
};

const memoryState = new Map<string, SyncState>();
const memoryReports = new Map<string, WeeklySyncReport>();

async function getFromStore<T>(type: string, id: string): Promise<T | null> {
  try {
    const { documentsClient } = await import("@dynatrace-sdk/client-document");
    const result = await documentsClient.getDocument({ id });
    const content = result.content;
    let text: string;
    if (typeof content === "string") text = content;
    else if (content instanceof Blob) text = await content.text();
    else if (content instanceof ArrayBuffer) text = new TextDecoder().decode(content);
    else text = String(content);
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function saveToStore(type: string, id: string, data: unknown): Promise<void> {
  try {
    const { documentsClient } = await import("@dynatrace-sdk/client-document");
    try {
      const existing = await documentsClient.getDocument({ id });
      await documentsClient.updateDocument({
        id,
        optimisticLockingVersion: existing.metadata.version,
        createSnapshot: false,
        body: {
          name: id,
          type,
          description: `DYANE ${type}`,
          content: new Blob([JSON.stringify(data)], { type: "application/json" }),
        },
      });
    } catch {
      await documentsClient.createDocument({
        body: {
          name: id,
          type,
          description: `DYANE ${type}`,
          id,
          isPrivate: false,
          content: new Blob([JSON.stringify(data)], { type: "application/json" }),
        },
      });
    }
  } catch {
    // Memory fallback
  }
}

async function getSyncState(source: string): Promise<SyncState> {
  // Try Document Service
  const stored = await getFromStore<SyncState>(SYNC_STATE_TYPE, `sync-state-${source}`);
  if (stored) return stored;

  // Try memory
  const mem = memoryState.get(source);
  if (mem) return mem;

  // Return default
  return { ...defaultState, source };
}

async function saveSyncState(state: SyncState): Promise<void> {
  memoryState.set(state.source, state);
  await saveToStore(SYNC_STATE_TYPE, `sync-state-${state.source}`, state);
}

async function getReports(): Promise<WeeklySyncReport[]> {
  const reports: WeeklySyncReport[] = [];

  // Try Document Service
  try {
    const { documentsClient } = await import("@dynatrace-sdk/client-document");
    const result = await documentsClient.listDocuments({
      filter: `type == '${SYNC_REPORT_TYPE}'`,
      pageSize: 100,
    });

    for (const meta of result.documents) {
      try {
        const doc = await documentsClient.getDocument({ id: meta.id });
        const content = doc.content;
        let text: string;
        if (typeof content === "string") text = content;
        else if (content instanceof Blob) text = await content.text();
        else if (content instanceof ArrayBuffer) text = new TextDecoder().decode(content);
        else text = String(content);
        reports.push(JSON.parse(text) as WeeklySyncReport);
      } catch { /* skip */ }
    }
  } catch { /* fall through */ }

  // Also from memory
  for (const report of memoryReports.values()) {
    if (!reports.find((r) => r.id === report.id)) {
      reports.push(report);
    }
  }

  reports.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  return reports;
}

export default async function () {
  const state = await getSyncState("dynatrace-docs");
  const reports = await getReports();

  return {
    state,
    reports,
    totalReports: reports.length,
  };
}
