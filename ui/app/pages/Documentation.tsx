import React, { useState, useMemo } from "react";

import { Flex } from "@dynatrace/strato-components/layouts";
import { Heading, Text, Strong } from "@dynatrace/strato-components/typography";
import { SearchInput } from "@dynatrace/strato-components/forms";
import { SimpleTable } from "@dynatrace/strato-components/tables";
import { HealthIndicator } from "@dynatrace/strato-components/content";
import { useAppFunction } from "@dynatrace-sdk/react-hooks";

type Document = {
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

type DocumentsResponse = {
  documents: Document[];
  total: number;
};

const columns = [
  {
    id: "title",
    header: "Document",
    accessor: "title" as const,
    cell: (props: { rowData: Document }) => (
      <Flex flexDirection="column" gap={4}>
        <Strong>{props.rowData.title}</Strong>
        <Text textStyle="small">{props.rowData.url}</Text>
      </Flex>
    ),
  },
  {
    id: "source",
    header: "Source",
    accessor: "source" as const,
  },
  {
    id: "category",
    header: "Category",
    accessor: "category" as const,
  },
  {
    id: "version",
    header: "Version",
    accessor: "currentVersion" as const,
    cell: (props: { rowData: Document }) => (
      <Text>v{props.rowData.currentVersion}</Text>
    ),
  },
  {
    id: "status",
    header: "Status",
    accessor: "lastSyncedAt" as const,
    cell: (props: { rowData: Document }) => {
      const synced = props.rowData.lastSyncedAt !== null;
      return (
        <HealthIndicator status={synced ? "ideal" : "warning"}>
          <HealthIndicator.Label>
            {synced ? "Synchronized" : "Never synced"}
          </HealthIndicator.Label>
        </HealthIndicator>
      );
    },
  },
];

export const Documentation = () => {
  const [search, setSearch] = useState("");
  const { data, error, isLoading } = useAppFunction<DocumentsResponse>({
    name: "getDocuments",
    data: undefined,
  });

  const documents = useMemo(() => {
    if (!data?.documents) return [];
    if (!search.trim()) return data.documents;
    const q = search.toLowerCase();
    return data.documents.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.source.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q)
    );
  }, [data?.documents, search]);

  return (
    <Flex flexDirection="column" padding={32} gap={24}>
      <Heading level={2}>Documentation</Heading>

      <SearchInput
        placeholder="Search documentation..."
        value={search}
        onChange={(e) => setSearch(e)}
      />

      {isLoading && (
        <Text>Loading documents...</Text>
      )}

      {error && (
        <Text>Error loading documents: {error.message}</Text>
      )}

      {!isLoading && !error && (
        <Flex flexDirection="column" gap={8}>
          <Flex justifyContent="space-between" alignItems="center">
            <Text>
              <Strong>{documents.length}</Strong> documents
            </Text>
          </Flex>

          <SimpleTable data={documents} columns={columns} />
        </Flex>
      )}
    </Flex>
  );
};
