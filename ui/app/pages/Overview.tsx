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
  status: string;
  lock: { locked: boolean };
  lastStartedAt?: string;
  lastCompletedAt?: string;
  lastResult?: {
    discovered: number;
    valid: number;
    excluded: number;
    duplicate: number;
    new: number;
    known: number;
    processed: number;
    created: number;
    updated: number;
    unchanged: number;
    failed: number;
    retried: number;
  };
  lastDuration?: number;
  nextScheduledAt?: string;
};

type SyncStateResponse = { state: SyncState; reports: any[]; totalReports: number };
type RunSyncResult = { success: boolean; state: SyncState; report?: any; error?: string };

const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

const SyncStatusCard = ({ state, onRunSync, isRunning }: { state: SyncState; onRunSync: () => void; isRunning: boolean }) => {
  const isLocked = state.lock?.locked ?? false;
  const statusColor = state.status === "completed" ? "ideal" : state.status === "failed" ? "critical" : state.status === "running" || isLocked ? "warning" : "neutral";
  const statusLabel = isLocked ? "sincronizando" : state.status === "idle" ? "inactivo" : state.status === "completed" ? "completado" : state.status === "failed" ? "fallido" : state.status;

  return (
    <Surface elevation="raised" padding={24}>
      <Flex flexDirection="column" gap={16}>
        <Flex justifyContent="space-between" alignItems="center">
          <Flex alignItems="center" gap={8}>
            <Heading level={3}>Sincronización de Conocimiento</Heading>
            <HealthIndicator status={statusColor}>
              <HealthIndicator.Label>{statusLabel}</HealthIndicator.Label>
            </HealthIndicator>
          </Flex>
          <Button onClick={onRunSync} disabled={isRunning || isLocked} variant="emphasized">
            {isRunning || isLocked ? "Sincronizando..." : "Ejecutar Sincronización"}
          </Button>
        </Flex>

        {(state.status === "running" || isLocked) && <ProgressBar value="indeterminate" />}

        {state.lastResult && (
          <Flex flexDirection="column" gap={12}>
            <Flex justifyContent="space-between">
              <Text textStyle="small-emphasized">Descubrimiento</Text>
            </Flex>
            <Flex gap={16} flexWrap="wrap">
              <Text textStyle="small"><Strong>{state.lastResult.discovered}</Strong> descubiertos</Text>
              <Text textStyle="small"><Strong>{state.lastResult.valid}</Strong> válidos</Text>
              <Text textStyle="small"><Strong>{state.lastResult.excluded}</Strong> excluidos</Text>
              <Text textStyle="small"><Strong>{state.lastResult.duplicate}</Strong> duplicados</Text>
              <Text textStyle="small"><Strong>{state.lastResult.new}</Strong> nuevos</Text>
              <Text textStyle="small"><Strong>{state.lastResult.known}</Strong> conocidos</Text>
            </Flex>

            <Flex justifyContent="space-between">
              <Text textStyle="small-emphasized">Resultados</Text>
            </Flex>
            <Flex gap={16} flexWrap="wrap">
              <Text textStyle="small"><Strong>{state.lastResult.processed}</Strong> procesados</Text>
              <Text textStyle="small"><Strong>{state.lastResult.created}</Strong> creados</Text>
              <Text textStyle="small"><Strong>{state.lastResult.updated}</Strong> actualizados</Text>
              <Text textStyle="small"><Strong>{state.lastResult.unchanged}</Strong> sin cambios</Text>
              <Text textStyle="small"><Strong>{state.lastResult.failed}</Strong> fallidos</Text>
              {state.lastResult.retried > 0 && (
                <Text textStyle="small"><Strong>{state.lastResult.retried}</Strong> reintentados</Text>
              )}
            </Flex>
          </Flex>
        )}

        <Flex gap={24} flexWrap="wrap">
          {state.lastCompletedAt && (
            <Flex flexDirection="column" gap={2}>
              <Text textStyle="small">Última sincronización</Text>
              <Text textStyle="small-emphasized">{new Date(state.lastCompletedAt).toLocaleString()}</Text>
            </Flex>
          )}
          {state.lastDuration && (
            <Flex flexDirection="column" gap={2}>
              <Text textStyle="small">Duración</Text>
              <Text textStyle="small-emphasized">{formatDuration(state.lastDuration)}</Text>
            </Flex>
          )}
          {state.nextScheduledAt && (
            <Flex flexDirection="column" gap={2}>
              <Text textStyle="small">Próxima sincronización</Text>
              <Text textStyle="small-emphasized">{new Date(state.nextScheduledAt).toLocaleString()}</Text>
            </Flex>
          )}
        </Flex>

        {!state.lastCompletedAt && state.status === "idle" && (
          <Text textStyle="small">No se ha ejecutado ninguna sincronización. Haz clic en "Ejecutar Sincronización" para comenzar.</Text>
        )}
      </Flex>
    </Surface>
  );
};

export const Overview = () => {
  const { data: syncData } = useAppFunction<SyncStateResponse>({ name: "getSyncState", data: undefined });
  const { refetch: runSync, isLoading: syncRunning } = useAppFunction<RunSyncResult>(
    { name: "runSync", data: {} },
    { autoFetch: false, autoFetchOnUpdate: false },
  );

  const syncState = syncData?.state || { source: "dynatrace-docs", status: "idle", lock: { locked: false }, lastResult: undefined, lastCompletedAt: undefined, lastDuration: undefined, nextScheduledAt: undefined };

  return (
    <Flex flexDirection="column" padding={32} gap={32}>
      <Heading level={2}>DYANE Estado del Conocimiento</Heading>
      <SyncStatusCard state={syncState} onRunSync={runSync} isRunning={syncRunning} />
      <KnowledgeStatus />
      <Heading level={3}>Sistema</Heading>
      <BackendStatus />
    </Flex>
  );
};
