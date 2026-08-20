export type SyncStatus = "idle" | "running" | "completed" | "partial" | "failed";

export interface SyncState {
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
}

export function createSyncState(source: string): SyncState {
  return {
    source,
    status: "idle",
  };
}

export function syncStarted(state: SyncState, jobId: string): SyncState {
  return {
    ...state,
    status: "running",
    lastStartedAt: new Date().toISOString(),
    currentJobId: jobId,
  };
}

export function syncCompleted(
  state: SyncState,
  result: {
    discovered: number;
    processed: number;
    created: number;
    updated: number;
    unchanged: number;
    failed: number;
  },
  duration: number
): SyncState {
  const status: SyncStatus = result.failed === result.processed
    ? "failed"
    : result.failed > 0
      ? "partial"
      : "completed";

  return {
    ...state,
    status,
    lastCompletedAt: new Date().toISOString(),
    currentJobId: undefined,
    lastResult: result,
    lastDuration: duration,
  };
}
