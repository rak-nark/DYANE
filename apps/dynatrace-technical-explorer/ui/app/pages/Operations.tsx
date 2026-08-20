import React, { useState } from "react";

import { Flex } from "@dynatrace/strato-components/layouts";
import { Heading, Paragraph, Strong } from "@dynatrace/strato-components/typography";

import { QueryRunner } from "../components/QueryRunner";
import { queryPresets, type QueryArea } from "../queryCatalog";

const areas: Array<{ id: QueryArea; label: string; presetId: string }> = [
  { id: "logs", label: "Logs", presetId: "logs-recent" },
  { id: "metrics", label: "Metrics", presetId: "metrics-host-cpu" },
  { id: "entities", label: "Entities", presetId: "entities-services" },
  { id: "events", label: "Events", presetId: "events-recent" },
  { id: "problems", label: "Problems", presetId: "problems-open" },
];

export const Operations = () => {
  const [area, setArea] = useState<QueryArea>("logs");
  const selected = areas.find((item) => item.id === area) ?? areas[0];
  const count = queryPresets.filter((preset) => preset.area === area).length;

  return (
    <Flex flexDirection="column" gap={20} padding={32}>
      <Flex flexDirection="column" gap={8}>
        <Heading level={2}>Operations Center</Heading>
        <Paragraph>Use curated read-only views for the core Dynatrace data types.</Paragraph>
      </Flex>

      <Flex gap={8} flexWrap="wrap">
        {areas.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setArea(item.id)}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: item.id === area ? "2px solid #006bba" : "1px solid #c9ced8",
              background: item.id === area ? "#edf7ff" : "#ffffff",
              cursor: "pointer",
            }}
          >
            {item.label}
          </button>
        ))}
      </Flex>

      <Paragraph>
        <Strong>{selected.label}</Strong> has {count} initial preset query.
      </Paragraph>

      <QueryRunner
        key={selected.presetId}
        title={`${selected.label} query`}
        subtitle="Start with the predefined query, then adjust filters or fields as needed."
        initialPresetId={selected.presetId}
      />
    </Flex>
  );
};
