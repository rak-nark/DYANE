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
  sections: { heading: string; level: number; content: string }[];
  codeBlocks: string[];
  links: { text: string; href: string }[];
  parserWarnings: string[];
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
  action?: "created" | "updated" | "unchanged";
  document?: Document;
  error?: string;
};

type CrawlJob = {
  id: string;
  source: string;
  startedAt: string;
  finishedAt?: string;
  discovered: number;
  processed: number;
  created: number;
  updated: number;
  unchanged: number;
  failed: number;
  status: "running" | "completed" | "failed";
  errors: string[];
};

type CrawlResult = {
  success: boolean;
  job?: CrawlJob;
  error?: string;
};

const SYNC_URL = "https://docs.dynatrace.com/docs/discover-dynatrace/what-is-dynatrace";

const columns = [
  {
    id: "title",
    header: "Documento",
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
    header: "Versión",
    accessor: "currentVersion" as const,
    cell: (props: { rowData: Document }) => (
      <Text>v{props.rowData.currentVersion}</Text>
    ),
  },
  {
    id: "structure",
    header: "Estructura",
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
    id: "quality",
    header: "Calidad",
    accessor: "parserWarnings" as const,
    cell: (props: { rowData: Document }) => {
      const warnings = props.rowData.parserWarnings?.length ?? 0;
      const status = warnings === 0 ? "ideal" : warnings <= 2 ? "warning" : "critical";
      return (
        <HealthIndicator status={status}>
          <HealthIndicator.Label>{warnings === 0 ? "OK" : `${warnings} warns`}</HealthIndicator.Label>
        </HealthIndicator>
      );
    },
  },
  {
    id: "lastSyncedAt",
    header: "Última sincronización",
    accessor: "lastSyncedAt" as const,
    cell: (props: { rowData: Document }) => {
      if (!props.rowData.lastSyncedAt) return <Text textStyle="small">—</Text>;
      const date = new Date(props.rowData.lastSyncedAt);
      return <Text textStyle="small">{date.toLocaleTimeString()}</Text>;
    },
  },
];

export const Documentation = () => {
  const [search, setSearch] = useState("");
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [crawlResult, setCrawlResult] = useState<CrawlResult | null>(null);
  const [isCrawling, setIsCrawling] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const { data, error, isLoading } = useAppFunction<DocumentsResponse>({
    name: "getDocuments",
    data: undefined,
  });

  const { refetch: syncDocument } = useAppFunction<SyncResult>(
    { name: "syncDocument", data: { url: SYNC_URL } },
    { autoFetch: false, autoFetchOnUpdate: false },
  );

  const { refetch: crawlDocuments } = useAppFunction<CrawlResult>(
    { name: "crawlDocuments", data: {} },
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

  const handleCrawl = async () => {
    setIsCrawling(true);
    setCrawlResult(null);
    try {
      const result = await crawlDocuments();
      setCrawlResult(result ?? { success: false, error: "No result" });
    } catch (err) {
      setCrawlResult({
        success: false,
        error: err instanceof Error ? err.message : "Crawl failed",
      });
    } finally {
      setIsCrawling(false);
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
          sections: doc.sections,
          codeBlocks: doc.codeBlocks,
          links: doc.links,
          parserWarnings: doc.parserWarnings,
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

  const job = crawlResult?.job;

  return (
    <Flex flexDirection="column" padding={32} gap={24}>
      <Flex justifyContent="space-between" alignItems="center">
        <Heading level={2}>Documentación</Heading>
        <Flex gap={8}>
          <Button onClick={handleSync} disabled={isSyncing}>
            {isSyncing ? "Sincronizando..." : "Sincronizar"}
          </Button>
          <Button onClick={handleCrawl} disabled={isCrawling}>
            {isCrawling ? "Rastreando..." : "Rastrear Todo"}
          </Button>
        </Flex>
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
        </Flex>
      )}

      {job && (
        <Flex flexDirection="column" gap={8} padding={16} style={{ border: "1px solid var(--dt-colors-foreground-base-usual)", borderRadius: 8 }}>
          <Flex justifyContent="space-between" alignItems="center">
            <Strong>Resultados del Rastreo</Strong>
            <HealthIndicator status={job.status === "completed" ? "ideal" : job.status === "failed" ? "critical" : "warning"}>
              <HealthIndicator.Label>{job.status}</HealthIndicator.Label>
            </HealthIndicator>
          </Flex>
          <Flex gap={24}>
            <Text textStyle="small"><Strong>{job.discovered}</Strong> descubiertos</Text>
            <Text textStyle="small"><Strong>{job.processed}</Strong> procesados</Text>
            <Text textStyle="small"><Strong>{job.created}</Strong> nuevos</Text>
            <Text textStyle="small"><Strong>{job.updated}</Strong> actualizados</Text>
            <Text textStyle="small"><Strong>{job.unchanged}</Strong> sin cambios</Text>
            <Text textStyle="small"><Strong>{job.failed}</Strong> fallidos</Text>
          </Flex>
          {job.finishedAt && job.startedAt && (
            <Text textStyle="small">
              Duración: {Math.round((new Date(job.finishedAt).getTime() - new Date(job.startedAt).getTime()) / 1000)}s
            </Text>
          )}
        </Flex>
      )}

      <SearchInput
        placeholder="Buscar documentación..."
        value={search}
        onChange={(e) => setSearch(e)}
      />

      {isLoading && (
        <Text>Cargando documentos...</Text>
      )}

      {error && (
        <Text>Error al cargar documentos: {error.message}</Text>
      )}

      {!isLoading && !error && (
        <Flex flexDirection="column" gap={8}>
          <Flex justifyContent="space-between" alignItems="center">
            <Text>
              <Strong>{documents.length}</Strong> documentos
            </Text>
          </Flex>

          <SimpleTable data={documents} columns={columns} />
        </Flex>
      )}

      {selectedDoc && (
        <Flex flexDirection="column" gap={16} padding={24} style={{ border: "1px solid var(--dt-colors-foreground-base-usual)", borderRadius: 8 }}>
          <Flex justifyContent="space-between" alignItems="center">
            <Heading level={3}>{selectedDoc.title}</Heading>
            <Button onClick={() => setSelectedDoc(null)} variant="default">Cerrar</Button>
          </Flex>

          <Flex flexDirection="column" gap={8}>
            <Text><Strong>Fuente:</Strong> {selectedDoc.source}</Text>
            <Text><Strong>Categoría:</Strong> {selectedDoc.category}</Text>
            <Text><Strong>URL:</Strong> {selectedDoc.url}</Text>
            <Text><Strong>Versión actual:</Strong> v{selectedDoc.currentVersion}</Text>
            <Text>
              <Strong>Última sincronización:</Strong>{" "}
              {selectedDoc.lastSyncedAt ? new Date(selectedDoc.lastSyncedAt).toLocaleString() : "Nunca"}
            </Text>
          </Flex>

          <Flex flexDirection="column" gap={8}>
            <Strong>Estructura</Strong>
            <Text textStyle="small">
              {selectedDoc.headings?.length ?? 0} encabezados ·{" "}
              {selectedDoc.codeBlocks?.length ?? 0} bloques de código ·{" "}
              {selectedDoc.links?.length ?? 0} enlaces
            </Text>
          </Flex>

          {selectedDoc.parserWarnings && selectedDoc.parserWarnings.length > 0 && (
            <Flex flexDirection="column" gap={8}>
              <Strong>Advertencias del Parser</Strong>
              {selectedDoc.parserWarnings.map((w, i) => (
                <Text key={i} textStyle="small">• {w}</Text>
              ))}
            </Flex>
          )}
        </Flex>
      )}
    </Flex>
  );
};
