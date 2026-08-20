import React from "react";

import { Flex } from "@dynatrace/strato-components/layouts";
import { Surface } from "@dynatrace/strato-components/layouts";
import { Text, Strong } from "@dynatrace/strato-components/typography";
import { HealthIndicator } from "@dynatrace/strato-components/content";
import { SingleValue } from "@dynatrace/strato-components/charts";
import { useAppFunction } from "@dynatrace-sdk/react-hooks";

type Document = {
  id: string;
  title: string;
  lastSyncedAt: string | null;
  currentVersion: number;
};

type DocumentsResponse = {
  documents: Document[];
  total: number;
};

export const KnowledgeStatus = () => {
  const { data, isLoading } = useAppFunction<DocumentsResponse>({
    name: "getDocuments",
    data: undefined,
  });

  const documents = data?.documents ?? [];
  const totalDocs = documents.length;
  const syncedDocs = documents.filter((d) => d.lastSyncedAt !== null).length;
  const lastSync = documents
    .filter((d) => d.lastSyncedAt)
    .sort((a, b) => new Date(b.lastSyncedAt!).getTime() - new Date(a.lastSyncedAt!).getTime())[0]
    ?.lastSyncedAt;
  const totalVersions = documents.reduce((sum, d) => sum + d.currentVersion, 0);
  const changes = totalVersions - totalDocs;

  return (
    <Flex gap={24} flexFlow="wrap">
      <Surface elevation="raised" style={{ padding: 24, minWidth: 220 }}>
        <Flex flexDirection="column" gap={12}>
          <Text textStyle="small">Documentación</Text>
          {isLoading ? (
            <Text>Cargando...</Text>
          ) : syncedDocs > 0 ? (
            <HealthIndicator status="ideal">
              <HealthIndicator.Label>Sincronizada</HealthIndicator.Label>
            </HealthIndicator>
          ) : (
            <HealthIndicator status="warning">
              <HealthIndicator.Label>No sincronizada</HealthIndicator.Label>
            </HealthIndicator>
          )}
        </Flex>
      </Surface>

      <Surface elevation="raised" style={{ padding: 24, minWidth: 220 }}>
        <Flex flexDirection="column" gap={12}>
          <Text textStyle="small">Última sincronización</Text>
          {lastSync ? (
            <Strong>{new Date(lastSync).toLocaleString()}</Strong>
          ) : (
            <Strong>Nunca</Strong>
          )}
        </Flex>
      </Surface>

      <Surface elevation="raised" style={{ padding: 24, minWidth: 220 }}>
        <Flex flexDirection="column" gap={12}>
          <Text textStyle="small">Documentos</Text>
          <SingleValue data={totalDocs} alignment="start" />
        </Flex>
      </Surface>

      <Surface elevation="raised" style={{ padding: 24, minWidth: 220 }}>
        <Flex flexDirection="column" gap={12}>
          <Text textStyle="small">Cambios detectados</Text>
          <SingleValue data={changes > 0 ? changes : 0} alignment="start" />
        </Flex>
      </Surface>
    </Flex>
  );
};
