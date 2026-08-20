import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export interface DynatraceConfig {
  environmentId: string;
  environmentUrl: string;
  platformToken: string;
  oauthClientId: string;
  oauthClientSecret: string;
  accountUrn: string;
  dtctlBin: string;
  output: string;
  mcpServerUrl: string;
}

function parseEnvFile(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!existsSync(path)) return out;
  const content = readFileSync(path, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function loadEnv(): Record<string, string> {
  const parsed: Record<string, string> = {};
  for (const key of Object.keys(process.env)) {
    if (key.startsWith("DT_") || key.startsWith("DTCTL_")) {
      parsed[key] = process.env[key] as string;
    }
  }
  const envFile = resolve(PROJECT_ROOT, ".env");
  Object.assign(parsed, parseEnvFile(envFile));
  return parsed;
}

export function loadConfig(): DynatraceConfig {
  const env = loadEnv();

  const environmentId = env.DT_ENVIRONMENT_ID ?? "";
  const environmentUrl =
    env.DT_ENVIRONMENT_URL ??
    (environmentId ? `https://${environmentId}.apps.dynatrace.com` : "");

  return {
    environmentId,
    environmentUrl,
    platformToken: env.DT_PLATFORM_TOKEN ?? "",
    oauthClientId: env.DT_OAUTH_CLIENT_ID ?? "",
    oauthClientSecret: env.DT_OAUTH_CLIENT_SECRET ?? "",
    accountUrn: env.DT_ACCOUNT_URN ?? "",
    dtctlBin: env.DTCTL_BIN ?? "dtctl",
    output: env.DTX_OUTPUT ?? "json",
    mcpServerUrl: env.DT_MCP_SERVER_URL ?? "",
  };
}

export function mcpServerUrl(config: DynatraceConfig): string {
  if (config.mcpServerUrl) return config.mcpServerUrl;
  if (!config.environmentUrl) return "";
  return `${config.environmentUrl}/platform-reserved/mcp-gateway/v0.1/servers/dynatrace-mcp/mcp`;
}

export { PROJECT_ROOT };
