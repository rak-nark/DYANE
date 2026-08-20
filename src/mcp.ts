import type { DynatraceConfig } from "./config.js";
import { mcpServerUrl } from "./config.js";
import { getAccessToken, hasAnyToken, hasOAuthCredentials } from "./oauth.js";

export interface McpTestResult {
  reachable: boolean;
  status?: number;
  authenticated: boolean;
  protocolVersion?: string;
  serverInfo?: unknown;
  error?: string;
}

export async function testMcpConnection(config: DynatraceConfig): Promise<McpTestResult> {
  const url = mcpServerUrl(config);
  if (!url) {
    return { reachable: false, authenticated: false, error: "Entorno no configurado" };
  }
  if (!hasAnyToken(config)) {
    return {
      reachable: false,
      authenticated: false,
      error: "No hay credenciales: define DT_PLATFORM_TOKEN o DT_OAUTH_CLIENT_ID + DT_OAUTH_CLIENT_SECRET en .env",
    };
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    const token = await getAccessToken(config);
    headers["Authorization"] = `Bearer ${token}`;
  } catch (err) {
    return { reachable: false, authenticated: false, error: (err as Error).message };
  }

  const payload = {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-03-26",
      capabilities: {},
      clientInfo: { name: "dtx", version: "0.1.0" },
    },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const text = await res.text();

    if (res.status === 401 || res.status === 403) {
      return {
        reachable: true,
        status: res.status,
        authenticated: false,
        error: "Autenticación requerida o token sin permisos (scopes mcp-gateway:servers:read/invoke)",
      };
    }
    if (!res.ok) {
      return {
        reachable: true,
        status: res.status,
        authenticated: false,
        error: `HTTP ${res.status}: ${text.slice(0, 200)}`,
      };
    }

    let parsed: { result?: { protocolVersion?: string; serverInfo?: unknown } };
    try {
      parsed = JSON.parse(text);
    } catch {
      return {
        reachable: true,
        status: res.status,
        authenticated: true,
        error: `Respuesta no es JSON válido: ${text.slice(0, 200)}`,
      };
    }

    return {
      reachable: true,
      status: res.status,
      authenticated: true,
      protocolVersion: parsed?.result?.protocolVersion,
      serverInfo: parsed?.result?.serverInfo,
    };
  } catch (err) {
    return { reachable: false, authenticated: false, error: (err as Error).message };
  }
}