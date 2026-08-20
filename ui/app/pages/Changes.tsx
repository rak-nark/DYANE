import React, { useEffect, useState } from "react";

import { useAppFunction } from "@dynatrace-sdk/react-hooks";
import { Flex } from "@dynatrace/strato-components/layouts";
import { Heading, Text } from "@dynatrace/strato-components/typography";
import { Surface, Container } from "@dynatrace/strato-components/layouts";
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
  const typeColor =
    change.type === "created"
      ? "success"
      : change.type === "removed"
        ? "critical"
        : "primary";

  const typeLabel =
    change.type === "created"
      ? "Created"
      : change.type === "removed"
        ? "Removed"
        : "Updated";

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
              <Chip color="success">+{change.summary.headingsAdded} heading{change.summary.headingsAdded > 1 ? "s" : ""}</Chip>
            )}
            {change.summary.headingsRemoved > 0 && (
              <Chip color="critical">-{change.summary.headingsRemoved} heading{change.summary.headingsRemoved > 1 ? "s" : ""}</Chip>
            )}
            {change.summary.headingsModified > 0 && (
              <Chip color="warning">~{change.summary.headingsModified} section{change.summary.headingsModified > 1 ? "s" : ""}</Chip>
            )}
            {change.summary.codeBlocksAdded > 0 && (
              <Chip color="success">+{change.summary.codeBlocksAdded} code block{change.summary.codeBlocksAdded > 1 ? "s" : ""}</Chip>
            )}
            {change.summary.codeBlocksRemoved > 0 && (
              <Chip color="critical">-{change.summary.codeBlocksRemoved} code block{change.summary.codeBlocksRemoved > 1 ? "s" : ""}</Chip>
            )}
            {change.summary.linksAdded > 0 && (
              <Chip color="success">+{change.summary.linksAdded} link{change.summary.linksAdded > 1 ? "s" : ""}</Chip>
            )}
            {change.summary.linksRemoved > 0 && (
              <Chip color="critical">-{change.summary.linksRemoved} link{change.summary.linksRemoved > 1 ? "s" : ""}</Chip>
            )}
            {change.summary.contentChanged && (
              <Chip color="primary">~ content modified</Chip>
            )}
          </Flex>
        )}

        {change.type === "created" && (
          <Text textStyle="small">
            {change.description}
          </Text>
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
        <Heading level={2}>Changes</Heading>
        <ProgressBar />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex flexDirection="column" padding={32} gap={32}>
        <Heading level={2}>Changes</Heading>
        <Surface elevation="raised" padding={16}>
          <Flex flexDirection="column" gap={8}>
            <Text textStyle="small-emphasized">Error loading changes</Text>
            <Text textStyle="small">{error.message}</Text>
          </Flex>
        </Surface>
      </Flex>
    );
  }

  return (
    <Flex flexDirection="column" padding={32} gap={32}>
      <Flex justifyContent="space-between" alignItems="center">
        <Heading level={2}>Changes</Heading>
        <Text textStyle="small">
          {changes.length} change{changes.length !== 1 ? "s" : ""} detected
        </Text>
      </Flex>

      {changes.length === 0 ? (
        <Surface elevation="raised" padding={32}>
          <Flex flexDirection="column" gap={8} alignItems="center">
            <Heading level={3}>No changes detected</Heading>
            <Text textStyle="small">
              Run a crawl to detect changes between document versions.
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
