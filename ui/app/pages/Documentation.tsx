import React, { useState, useMemo } from "react";

import { Flex } from "@dynatrace/strato-components/layouts";
import { Heading, Text, Strong } from "@dynatrace/strato-components/typography";
import { SearchInput } from "@dynatrace/strato-components/forms";
import { SimpleTable } from "@dynatrace/strato-components/tables";
import { HealthIndicator } from "@dynatrace/strato-components/content";
import { Button } from "@dynatrace/strato-components/buttons";
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

type SyncResult = {
  success: boolean;
  document?: Document & { content: string; contentHash: string };
  error?: string;
};

const SYNC_URL = "https://docs.dynatrace.com/docs/discover-dynatrace/what-is-dynatrace";

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
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const { data, error, isLoading } = useAppFunction<DocumentsResponse>({
    name: "getDocuments",
    data: undefined,
  });

  const { refetch: syncDocument } = useAppFunction<SyncResult>(
    { name: "syncDocument", data: { url: SYNC_URL } },
    { autoFetch: false, autoFetchOnUpdate: false },
  );

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const result = await syncDocument();
      setSyncResult(result ?? { success: false, error: "No result" });
    } catch (err) {
      setSyncResult({
        success: false,
        error: err instanceof Error ? err.message : "Sync failed",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const documents = useMemo(() => {
    const list: Document[] = data?.documents ? [...data.documents] : [];

    if (syncResult?.success && syncResult.document) {
      const doc = syncResult.document;
      const exists = list.find((d) => d.id === doc.id);
      if (!exists) {
        list.unshift({
          id: doc.id,
          title: doc.title,
          url: doc.url,
          source: doc.source,
          category: doc.category,
          currentVersion: doc.currentVersion,
          createdAt: doc.createdAt,
          updatedAt: doc.lastSyncedAt ?? doc.createdAt,
          lastSyncedAt: doc.lastSyncedAt ?? null,
        });
      }
    }

    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.source.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q)
    );
  }, [data?.documents, search, syncResult]);

  return (
    <Flex flexDirection="column" padding={32} gap={24}>
      <Flex justifyContent="space-between" alignItems="center">
        <Heading level={2}>Documentation</Heading>
        <Button onClick={handleSync} disabled={isSyncing}>
          {isSyncing ? "Syncing..." : "Sync"}
        </Button>
      </Flex>

      {syncResult && (
        <HealthIndicator status={syncResult.success ? "ideal" : "critical"}>
          <HealthIndicator.Label>
            {syncResult.success
              ? `Synced: ${syncResult.document?.title}`
              : `Error: ${syncResult.error}`}
          </HealthIndicator.Label>
        </HealthIndicator>
      )}

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
