import React, { useState } from "react";

import { RunQueryButton, type QueryStateType } from "@dynatrace/strato-components/buttons";
import { TimeseriesChart, convertToTimeseries } from "@dynatrace/strato-components/charts";
import { DQLEditor } from "@dynatrace/strato-components/editors";
import { Flex } from "@dynatrace/strato-components/layouts";
import { Heading, Paragraph, Strong } from "@dynatrace/strato-components/typography";
import Colors from "@dynatrace/strato-design-tokens/colors";
import { CriticalIcon } from "@dynatrace/strato-icons";
import { useDql } from "@dynatrace-sdk/react-hooks";

import { applyLimit, getPreset, queryPresets } from "../queryCatalog";

interface QueryRunnerProps {
  initialPresetId?: string;
  showCatalog?: boolean;
  title: string;
  subtitle: string;
  chartMode?: boolean;
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function ResultTable({ records }: { records: unknown[] }) {
  if (records.length === 0) {
    return <Paragraph>No records returned.</Paragraph>;
  }

  const rows = records.slice(0, 100);
  const first = rows[0];
  const columns = Array.isArray(first)
    ? first.map((_, index) => `Column ${index + 1}`)
    : Object.keys((first ?? {}) as Record<string, unknown>);

  return (
    <div style={{ overflowX: "auto", border: "1px solid #d5d8df", borderRadius: 6 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #d5d8df" }}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, columnIndex) => {
                const value = Array.isArray(row) ? row[columnIndex] : (row as Record<string, unknown>)[column];
                return (
                  <td key={column} style={{ padding: 8, borderBottom: "1px solid #edf0f5", verticalAlign: "top" }}>
                    {formatCell(value)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const QueryRunner = ({
  initialPresetId = "logs-recent",
  showCatalog = true,
  title,
  subtitle,
  chartMode = false,
}: QueryRunnerProps) => {
  const initialPreset = getPreset(initialPresetId);
  const [selectedPresetId, setSelectedPresetId] = useState(initialPreset.id);
  const [limit, setLimit] = useState(100);
  const [editorQueryString, setEditorQueryString] = useState(initialPreset.query);
  const [queryString, setQueryString] = useState(applyLimit(initialPreset.query, limit));

  const { data, error, isLoading, cancel, refetch } = useDql({ query: queryString });

  function selectPreset(presetId: string) {
    const preset = getPreset(presetId);
    setSelectedPresetId(preset.id);
    setEditorQueryString(preset.query);
    setQueryString(applyLimit(preset.query, limit));
  }

  function onClickQuery() {
    if (isLoading) {
      void cancel();
      return;
    }
    const nextQuery = applyLimit(editorQueryString, limit);
    if (queryString !== nextQuery) setQueryString(nextQuery);
    else void refetch();
  }

  let queryState: QueryStateType = "idle";
  if (error) queryState = "error";
  else if (isLoading) queryState = "loading";
  else if (data) queryState = "success";

  const records = (data?.records ?? []) as unknown[];
  const selectedPreset = getPreset(selectedPresetId);
  const shouldChart = chartMode || selectedPreset.chartable;

  return (
    <Flex flexDirection="column" gap={24} padding={32}>
      <Flex flexDirection="column" gap={8}>
        <Heading level={2}>{title}</Heading>
        <Paragraph>{subtitle}</Paragraph>
      </Flex>

      {showCatalog && (
        <Flex flexDirection="column" gap={8}>
          <Strong>Preset query</Strong>
          <select
            value={selectedPresetId}
            onChange={(event) => selectPreset(event.target.value)}
            style={{ maxWidth: 420, padding: 8 }}
          >
            {queryPresets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label}
              </option>
            ))}
          </select>
          <Paragraph>{selectedPreset.description}</Paragraph>
        </Flex>
      )}

      <Flex gap={12} alignItems="center">
        <label>
          Limit{" "}
          <input
            type="number"
            min={10}
            max={500}
            step={10}
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value))}
            style={{ width: 88, padding: 6 }}
          />
        </label>
      </Flex>

      <DQLEditor value={editorQueryString} onChange={(value) => setEditorQueryString(value)} />

      <Flex justifyContent={error ? "space-between" : "flex-end"} alignItems="center">
        {error && (
          <Flex alignItems="center" gap={8} style={{ color: Colors.Text.Critical.Default }}>
            <CriticalIcon />
            <Paragraph>{error.message}</Paragraph>
          </Flex>
        )}
        <RunQueryButton onClick={onClickQuery} queryState={queryState} />
      </Flex>

      {shouldChart && data?.records && data?.types && (
        <TimeseriesChart data={convertToTimeseries(data.records, data.types)} gapPolicy="connect" variant="line" />
      )}

      {data?.records && <ResultTable records={records} />}
    </Flex>
  );
};
