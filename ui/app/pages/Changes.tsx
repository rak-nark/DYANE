import React, { useEffect, useState } from "react";

import { useAppFunction } from "@dynatrace-sdk/react-hooks";
import { Flex } from "@dynatrace/strato-components/layouts";
import { Heading, Text } from "@dynatrace/strato-components/typography";
import { Surface } from "@dynatrace/strato-components/layouts";
import { ProgressBar } from "@dynatrace/strato-components/content";
import { Chip } from "@dynatrace/strato-components/content";

type ChangeSummary = {
  headingsAdded: number;
  headingsRemoved: number;
  headingsModified: number;
  codeBlocksAdded: number;
  codeBlocksRemoved: number;
  linksAdded: number;
  linksRemoved: number;
  contentChanged: boolean;
};

type DocumentChange = {
  id: string;
  documentId: string;
  documentTitle: string;
  fromVersion: number;
  toVersion: number;
  detectedAt: string;
  type: "created" | "updated" | "removed";
  summary: ChangeSummary;
  description: string;
};

const ChangeCard = ({ change }: { change: DocumentChange }) => {
  const typeColor = change.type === "created" ? "success" : change.type === "removed" ? "critical" : "primary";
  const typeLabel = change.type === "created" ? "Creado" : change.type === "removed" ? "Eliminado" : "Actualizado";

  return (
    <Surface elevation="raised" padding={16}>
      <Flex flexDirection="column" gap={12}>
        <Flex justifyContent="space-between" alignItems="center">
          <Flex alignItems="center" gap={8}>
            <Heading level={4}>{change.documentTitle}</Heading>
            <Chip color={typeColor} variant="emphasized">
              {typeLabel}
            </Chip>
          </Flex>
          <Text textStyle="small">
            {new Date(change.detectedAt).toLocaleDateString()}
          </Text>
        </Flex>

        {change.type === "updated" && (
          <Flex gap={16} alignItems="center">
            <Text textStyle="small-emphasized">
              v{change.fromVersion} → v{change.toVersion}
            </Text>
          </Flex>
        )}

        {change.type !== "created" && change.type !== "removed" && (
          <Flex gap={8} flexWrap="wrap">
            {change.summary.headingsAdded > 0 && (
              <Chip color="success">+{change.summary.headingsAdded} encabezado{change.summary.headingsAdded > 1 ? "s" : ""}</Chip>
            )}
            {change.summary.headingsRemoved > 0 && (
              <Chip color="critical">-{change.summary.headingsRemoved} encabezado{change.summary.headingsRemoved > 1 ? "s" : ""}</Chip>
            )}
            {change.summary.headingsModified > 0 && (
              <Chip color="warning">~{change.summary.headingsModified} sección{change.summary.headingsModified > 1 ? "es" : ""}</Chip>
            )}
            {change.summary.codeBlocksAdded > 0 && (
              <Chip color="success">+{change.summary.codeBlocksAdded} bloque de código</Chip>
            )}
            {change.summary.codeBlocksRemoved > 0 && (
              <Chip color="critical">-{change.summary.codeBlocksRemoved} bloque de código</Chip>
            )}
            {change.summary.linksAdded > 0 && (
              <Chip color="success">+{change.summary.linksAdded} enlace{change.summary.linksAdded > 1 ? "s" : ""}</Chip>
            )}
            {change.summary.linksRemoved > 0 && (
              <Chip color="critical">-{change.summary.linksRemoved} enlace{change.summary.linksRemoved > 1 ? "s" : ""}</Chip>
            )}
            {change.summary.contentChanged && (
              <Chip color="primary">~ contenido modificado</Chip>
            )}
          </Flex>
        )}

        {change.type === "created" && (
          <Text textStyle="small">{change.description}</Text>
        )}
      </Flex>
    </Surface>
  );
};

export const Changes = () => {
  const { data, isLoading, error } = useAppFunction({ name: "getChanges" });
  const [changes, setChanges] = useState<DocumentChange[]>([]);

  useEffect(() => {
    if (data) {
      setChanges((data as any).changes || []);
    }
  }, [data]);

  if (isLoading) {
    return (
      <Flex flexDirection="column" padding={32} gap={32}>
        <Heading level={2}>Cambios</Heading>
        <ProgressBar />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex flexDirection="column" padding={32} gap={32}>
        <Heading level={2}>Cambios</Heading>
        <Surface elevation="raised" padding={16}>
          <Flex flexDirection="column" gap={8}>
            <Text textStyle="small-emphasized">Error al cargar cambios</Text>
            <Text textStyle="small">{error.message}</Text>
          </Flex>
        </Surface>
      </Flex>
    );
  }

  return (
    <Flex flexDirection="column" padding={32} gap={32}>
      <Flex justifyContent="space-between" alignItems="center">
        <Heading level={2}>Cambios</Heading>
        <Text textStyle="small">
          {changes.length} cambio{changes.length !== 1 ? "s" : ""} detectado{changes.length !== 1 ? "s" : ""}
        </Text>
      </Flex>

      {changes.length === 0 ? (
        <Surface elevation="raised" padding={32}>
          <Flex flexDirection="column" gap={8} alignItems="center">
            <Heading level={3}>No se detectaron cambios</Heading>
            <Text textStyle="small">
              Ejecuta un rastreo para detectar cambios entre versiones de documentos.
            </Text>
          </Flex>
        </Surface>
      ) : (
        <Flex flexDirection="column" gap={12}>
          {changes.map((change) => (
            <ChangeCard key={change.id} change={change} />
          ))}
        </Flex>
      )}
    </Flex>
  );
};
