import type { DynatraceConfig } from "./config.js";
import { getAccessToken, hasAnyToken, authHeader } from "./oauth.js";

export class ApiError extends Error {
  status: number;
  body: string;
  constructor(status: number, body: string, message?: string) {
    super(message ?? `Dynatrace API error (HTTP ${status}): ${body.slice(0, 300)}`);
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch(
  config: DynatraceConfig,
  path: string,
  options: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
    query?: Record<string, string | number | boolean | undefined>;
  } = {},
): Promise<unknown> {
  if (!config.environmentUrl) {
    throw new Error(
      "No hay entorno configurado. Define DT_ENVIRONMENT_ID en .env (o DT_ENVIRONMENT_URL).",
    );
  }
  if (!hasAnyToken(config)) {
    throw new Error(
      "No hay credenciales configuradas. Define DT_PLATFORM_TOKEN o DT_OAUTH_CLIENT_ID + DT_OAUTH_CLIENT_SECRET en .env.",
    );
  }

  const { method = "GET", body, headers = {}, query } = options;

  const url = new URL(path, config.environmentUrl.endsWith("/") ? config.environmentUrl : `${config.environmentUrl}/`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const token = await getAccessToken(config);
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: authHeader(token),
      "Content-Type": "application/json",
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new ApiError(response.status, text);
  }
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function printResult(data: unknown, format: string): void {
  if (format === "raw") {
    console.log(typeof data === "string" ? data : JSON.stringify(data, null, 2));
    return;
  }
  console.log(JSON.stringify(data, null, 2));
}