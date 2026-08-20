export type QueryArea = "logs" | "metrics" | "entities" | "events" | "problems";

export interface QueryPreset {
  id: string;
  area: QueryArea;
  label: string;
  description: string;
  query: string;
  chartable?: boolean;
}

export const queryPresets: QueryPreset[] = [
  {
    id: "logs-recent",
    area: "logs",
    label: "Recent logs",
    description: "Latest log records in the selected timeframe.",
    query: "fetch logs, from: now()-1h\n| sort timestamp desc\n| limit 100",
  },
  {
    id: "logs-volume",
    area: "logs",
    label: "Log volume",
    description: "Log count grouped into one-minute buckets.",
    query:
      "fetch logs, from: now()-1h\n| summarize count(), by:{bin(timestamp, 1m)}\n| sort `bin(timestamp, 1m)` asc",
    chartable: true,
  },
  {
    id: "metrics-host-cpu",
    area: "metrics",
    label: "Host CPU metric",
    description: "Small metrics smoke query for host CPU.",
    query: "fetch metrics { cpu = dem:builtin:host.cpu:value }\n| limit 20",
  },
  {
    id: "entities-services",
    area: "entities",
    label: "Services",
    description: "Monitored service entities.",
    query: "fetch dt.entity.service\n| fieldsAdd entity.name\n| limit 100",
  },
  {
    id: "events-recent",
    area: "events",
    label: "Recent events",
    description: "Latest events in Grail.",
    query: "fetch events, from: now()-24h\n| sort timestamp desc\n| limit 100",
  },
  {
    id: "problems-open",
    area: "problems",
    label: "Problems",
    description: "Problem events from the last 24 hours.",
    query:
      'fetch events, from: now()-24h\n| filter event.kind == "DAVIS_PROBLEM" or event.kind == "PROBLEM"\n| sort timestamp desc\n| limit 100',
  },
];

export const defaultPreset = queryPresets[0];

export function getPreset(id: string): QueryPreset {
  return queryPresets.find((preset) => preset.id === id) ?? defaultPreset;
}

export function applyLimit(query: string, limit: number): string {
  const safeLimit = Math.max(10, Math.min(limit, 500));
  if (/\|\s*limit\s+\d+/i.test(query)) {
    return query.replace(/\|\s*limit\s+\d+/i, `| limit ${safeLimit}`);
  }
  return `${query.trim()}\n| limit ${safeLimit}`;
}
