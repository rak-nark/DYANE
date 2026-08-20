import React from "react";

import { useAppFunction } from "@dynatrace-sdk/react-hooks";
import { Flex } from "@dynatrace/strato-components/layouts";
import { Heading, Text, Strong } from "@dynatrace/strato-components/typography";
import { Surface } from "@dynatrace/strato-components/layouts";
import { HealthIndicator, ProgressBar } from "@dynatrace/strato-components/content";
import { Button } from "@dynatrace/strato-components/buttons";
import { BackendStatus } from "../components/BackendStatus";
import { KnowledgeStatus } from "../components/KnowledgeStatus";

type SyncState = {
  source: string;
  status: "idle" | "running" | "completed" | "partial" | "failed";
  lastStartedAt?: string;
  lastCompletedAt?: string;
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

type SyncStateResponse = {
  state: SyncState;
  reports: any[];
  totalReports: number;
};

type RunSyncResult = {
  success: boolean;
  state: SyncState;
  report?: any;
  error?: string;
};

const SyncStatusCard = ({ state, onRunSync, isRunning }: { state: SyncState; onRunSync: () => void; isRunning: boolean }) => {
  const statusColor = state.status === "completed" ? "ideal" : state.status === "failed" ? "critical" : state.status === "running" ? "warning" : "neutral";

  return (
    <Surface elevation="raised" padding={24}>
      <Flex flexDirection="column" gap={16}>
        <Flex justifyContent="space-between" alignItems="center">
          <Flex alignItems="center" gap={8}>
            <Heading level={3}>Sync Status</Heading>
            <HealthIndicator status={statusColor}>
              <HealthIndicator.Label>{state.status}</HealthIndicator.Label>
            </HealthIndicator>
          </Flex>
          <Button onClick={onRunSync} disabled={isRunning} variant="emphasized">
            {isRunning ? "Syncing..." : "Run Sync Now"}
          </Button>
        </Flex>

        {state.status === "running" && (
          <ProgressBar value="indeterminate" />
        )}

        {state.lastResult && (
          <Flex gap={24} flexWrap="wrap">
            <Flex flexDirection="column" gap={2}>
              <Text textStyle="small">Discovered</Text>
              <Strong>{state.lastResult.discovered}</Strong>
            </Flex>
            <Flex flexDirection="column" gap={2}>
              <Text textStyle="small">Processed</Text>
              <Strong>{state.lastResult.processed}</Strong>
            </Flex>
            <Flex flexDirection="column" gap={2}>
              <Text textStyle="small">New</Text>
              <Strong>{state.lastResult.created}</Strong>
            </Flex>
            <Flex flexDirection="column" gap={2}>
              <Text textStyle="small">Updated</Text>
              <Strong>{state.lastResult.updated}</Strong>
            </Flex>
            <Flex flexDirection="column" gap={2}>
              <Text textStyle="small">Unchanged</Text>
              <Strong>{state.lastResult.unchanged}</Strong>
            </Flex>
            <Flex flexDirection="column" gap={2}>
              <Text textStyle="small">Failed</Text>
              <Strong>{state.lastResult.failed}</Strong>
            </Flex>
          </Flex>
        )}

        {state.lastCompletedAt && (
          <Flex gap={16}>
            <Text textStyle="small">
              Last sync: {new Date(state.lastCompletedAt).toLocaleString()}
            </Text>
            {state.lastDuration && (
              <Text textStyle="small">
                Duration: {state.lastDuration}s
              </Text>
            )}
          </Flex>
        )}

        {!state.lastCompletedAt && state.status === "idle" && (
          <Text textStyle="small">
            No sync has been run yet. Click "Run Sync Now" to start.
          </Text>
        )}
      </Flex>
    </Surface>
  );
};

export const Overview = () => {
  const { data: syncData, isLoading: syncLoading } = useAppFunction<SyncStateResponse>({
    name: "getSyncState",
    data: undefined,
  });

  const { refetch: runSync, isLoading: syncRunning } = useAppFunction<RunSyncResult>(
    { name: "runSync", data: {} },
    { autoFetch: false, autoFetchOnUpdate: false },
  );

  const handleRunSync = async () => {
    await runSync();
  };

  const syncState = syncData?.state || { source: "dynatrace-docs", status: "idle" as const };

  return (
    <Flex flexDirection="column" padding={32} gap={32}>
      <Heading level={2}>DYANE Knowledge Status</Heading>

      <SyncStatusCard state={syncState} onRunSync={handleRunSync} isRunning={syncRunning} />

      <KnowledgeStatus />

      <Heading level={3}>System</Heading>

      <BackendStatus />
    </Flex>
  );
};
