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
  description: string;
  url: string;
  sourceUrl: string;
  source: string;
  category: string;
  currentVersion: number;
  headings: string[];
  codeBlocks: string[];
  links: { text: string; href: string }[];
  createdAt: string;
  updatedAt: string;
  lastSyncedAt: string | null;
};

type DocumentVersion = {
  id: string;
  documentId: string;
  version: number;
  content: string;
  normalizedContent: string;
  contentHash: string;
  headings: string[];
  codeBlocks: string[];
  links: { text: string; href: string }[];
  retrievedAt: string;
};

type DocumentsResponse = {
  documents: Document[];
  total: number;
};

type SyncResult = {
  success: boolean;
  action?: "created" | "updated" | "unchanged";
  document?: Document;
  version?: DocumentVersion;
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
        <Text textStyle="small">{props.rowData.description || props.rowData.url}</Text>
      </Flex>
    ),
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
    id: "structure",
    header: "Structure",
    accessor: "headings" as const,
    cell: (props: { rowData: Document }) => {
      const h = props.rowData.headings?.length ?? 0;
      const c = props.rowData.codeBlocks?.length ?? 0;
      const l = props.rowData.links?.length ?? 0;
      return (
        <Text textStyle="small">
          {h}H / {c}C / {l}L
        </Text>
      );
    },
  },
  {
    id: "lastSyncedAt",
    header: "Last sync",
    accessor: "lastSyncedAt" as const,
    cell: (props: { rowData: Document }) => {
      if (!props.rowData.lastSyncedAt) return <Text textStyle="small">—</Text>;
      const date = new Date(props.rowData.lastSyncedAt);
      return <Text textStyle="small">{date.toLocaleTimeString()}</Text>;
    },
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
            {synced ? `v${props.rowData.currentVersion} Synced` : "Never synced"}
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
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

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
      if (exists) {
        Object.assign(exists, {
          title: doc.title,
          description: doc.description,
          currentVersion: doc.currentVersion,
          headings: doc.headings,
          codeBlocks: doc.codeBlocks,
          links: doc.links,
          lastSyncedAt: doc.lastSyncedAt,
          updatedAt: doc.lastSyncedAt ?? doc.updatedAt,
        });
      } else {
        list.unshift(doc);
      }
    }

    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (d) =>
        d.title?.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.source?.toLowerCase().includes(q) ||
        d.category?.toLowerCase().includes(q)
    );
  }, [data?.documents, search, syncResult]);

  const syncHash = syncResult?.version?.contentHash;

  return (
    <Flex flexDirection="column" padding={32} gap={24}>
      <Flex justifyContent="space-between" alignItems="center">
        <Heading level={2}>Documentation</Heading>
        <Button onClick={handleSync} disabled={isSyncing}>
          {isSyncing ? "Syncing..." : "Sync"}
        </Button>
      </Flex>

      {syncResult && (
        <Flex flexDirection="column" gap={8}>
          <HealthIndicator status={syncResult.success ? "ideal" : "critical"}>
            <HealthIndicator.Label>
              {syncResult.success
                ? `${syncResult.action}: ${syncResult.document?.title}`
                : `Error: ${syncResult.error}`}
            </HealthIndicator.Label>
          </HealthIndicator>
          {syncHash && (
            <Text textStyle="small">
              Hash: {syncHash.substring(0, 16)}...
            </Text>
          )}
        </Flex>
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

          <SimpleTable
            data={documents}
            columns={columns}
          />
        </Flex>
      )}

      {selectedDoc && (
        <Flex
          flexDirection="column"
          gap={16}
          padding={24}
          style={{
            border: "1px solid var(--dt-colors-foreground-base-usual)",
            borderRadius: 8,
          }}
        >
          <Flex justifyContent="space-between" alignItems="center">
            <Heading level={3}>{selectedDoc.title}</Heading>
            <Button onClick={() => setSelectedDoc(null)} variant="default">
              Close
            </Button>
          </Flex>

          <Flex flexDirection="column" gap={8}>
            <Text><Strong>Source:</Strong> {selectedDoc.source}</Text>
            <Text><Strong>Category:</Strong> {selectedDoc.category}</Text>
            <Text><Strong>URL:</Strong> {selectedDoc.url}</Text>
            <Text><Strong>Current version:</Strong> v{selectedDoc.currentVersion}</Text>
            <Text>
              <Strong>Last sync:</Strong>{" "}
              {selectedDoc.lastSyncedAt
                ? new Date(selectedDoc.lastSyncedAt).toLocaleString()
                : "Never"}
            </Text>
          </Flex>

          <Flex flexDirection="column" gap={8}>
            <Strong>Structure</Strong>
            <Text textStyle="small">
              {selectedDoc.headings?.length ?? 0} headings ·{" "}
              {selectedDoc.codeBlocks?.length ?? 0} code blocks ·{" "}
              {selectedDoc.links?.length ?? 0} links
            </Text>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};
