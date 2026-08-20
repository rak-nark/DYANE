import { apiFetch, printResult, ApiError } from "./http.js";
import { classifyToken, authHeader } from "./oauth.js";
import type { DynatraceConfig } from "./config.js";

export interface DqlResult {
  columns?: Array<{ name: string; type: string }>;
  records?: Array<Array<unknown>>;
  [key: string]: unknown;
}

function usesPlatformApi(config: DynatraceConfig): boolean {
  return !config.platformToken || classifyToken(config.platformToken) !== "api";
}

export async function runDql(
  config: DynatraceConfig,
  query: string,
  options: { output?: string; timeoutMs?: number } = {},
): Promise<void> {
  const result = (await apiFetch(
    config,
    "/platform/storage/query/v1/query:execute",
    {
      method: "POST",
      body: {
        query,
        requestTimeoutMilliseconds: options.timeoutMs ?? 30_000,
      },
    },
  )) as DqlResult;

  if (options.output === "json") {
    printResult(result, "json");
    return;
  }

  const records = result.records ?? [];
  const columns = (result.columns ?? []).map((c) => c.name);
  if (records.length === 0) {
    console.log("(sin resultados)");
    return;
  }
  if (options.output === "raw") {
    console.log(JSON.stringify(records, null, 2));
    return;
  }

  const widths = columns.map((c, i) =>
    Math.max(c.length, ...records.map((r) => String(r[i] ?? "").length)),
  );
  const pad = (v: unknown, w: number) => String(v ?? "").padEnd(w);
  console.log(columns.map((c, i) => pad(c, widths[i])).join("  "));
  console.log(widths.map((w) => "-".repeat(w)).join("  "));
  for (const row of records) {
    console.log(row.map((v, i) => pad(v, widths[i])).join("  "));
  }
}

export async function checkPlatformApi(config: DynatraceConfig): Promise<void> {
  await apiFetch(config, "/platform/storage/query/v1/query:execute", {
    method: "POST",
    body: { query: "fetch logs | limit 1", requestTimeoutMilliseconds: 30_000 },
  });
}

export async function getEntities(
  config: DynatraceConfig,
  options: {
    type?: string;
    tag?: string;
    pageSize?: number;
    output?: string;
  } = {},
): Promise<void> {
  const output = options.output ?? "json";
  if (usesPlatformApi(config)) {
    const entityType = (options.type ?? "SERVICE").toLowerCase();
    const tagClause = options.tag ? ` and tag == "${options.tag}"` : "";
    await runDql(
      config,
      `fetch dt.entity.${entityType} | filter true${tagClause} | limit ${options.pageSize ?? 50}`,
      { output },
    );
    return;
  }

  const result = await apiFetch(config, "/api/v2/entities", {
    query: {
      entitySelector: [options.type ? `type("${options.type}")` : "", options.tag ? `tag("${options.tag}")` : ""]
        .filter(Boolean)
        .join(" and "),
      pageSize: options.pageSize ?? 50,
      fields: "+name,+type,+properties",
    },
  });
  printResult(result, output);
}

export async function getProblems(
  config: DynatraceConfig,
  options: { status?: string; pageSize?: number; output?: string } = {},
): Promise<void> {
  const output = options.output ?? "json";
  if (usesPlatformApi(config)) {
    await runDql(
      config,
      `fetch events | filter event.kind == "PROBLEM"${options.status ? ` and status == "${options.status}"` : ""} | limit ${options.pageSize ?? 50}`,
      { output },
    );
    return;
  }

  const result = await apiFetch(config, "/api/v2/problems", {
    query: {
      problemSelector: options.status ? `status("${options.status}")` : "",
      pageSize: options.pageSize ?? 50,
    },
  });
  printResult(result, output);
}

export async function getMetrics(
  config: DynatraceConfig,
  options: { metric?: string; output?: string } = {},
): Promise<void> {
  const output = options.output ?? "json";
  if (usesPlatformApi(config)) {
    await runDql(
      config,
      `fetch metrics { A = ${options.metric ?? "dem:builtin:host.cpu:value"} } | fields A | limit 5`,
      { output },
    );
    return;
  }

  const result = await apiFetch(config, "/api/v2/metrics", {
    query: { pageSize: 50 },
  });
  printResult(result, output);
}

export async function genericGet(
  config: DynatraceConfig,
  path: string,
  options: { output?: string } = {},
): Promise<void> {
  if (!path.startsWith("/")) throw new Error("El path de la API debe empezar con '/'");
  const result = await apiFetch(config, path);
  printResult(result, options.output ?? "json");
}

export { ApiError, authHeader };