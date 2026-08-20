import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { DynatraceConfig } from "./config.js";

const TOKEN_ENDPOINT = "https://sso.dynatrace.com/sso/oauth2/token";
const CACHE_DIR = join(tmpdir(), "dtx-dynatrace");
const CACHE_FILE = join(CACHE_DIR, "oauth-token.json");

interface TokenCache {
  accessToken: string;
  expiresAt: number;
  resource?: string;
  scope?: string;
  clientId?: string;
}

let memoryToken: TokenCache | null = null;

function readCache(): TokenCache | null {
  if (memoryToken) return memoryToken;
  try {
    if (!existsSync(CACHE_FILE)) return null;
    return JSON.parse(readFileSync(CACHE_FILE, "utf8")) as TokenCache;
  } catch {
    return null;
  }
}

function writeCache(token: TokenCache): void {
  memoryToken = token;
  try {
    if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
    writeFileSync(CACHE_FILE, JSON.stringify(token), { mode: 0o600 });
  } catch {
    // caché no persistida (p. ej. permisos); el token en memoria sigue valiendo
  }
}

function isValid(cache: TokenCache | null, config: DynatraceConfig): boolean {
  if (!cache?.accessToken) return false;
  if (cache.clientId !== config.oauthClientId) return false;
  return cache.expiresAt > Date.now() + 30_000;
}

export class OAuthError extends Error {
  status?: number;
  body?: string;
  constructor(message: string, status?: number, body?: string) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export function hasOAuthCredentials(config: DynatraceConfig): boolean {
  return Boolean(config.oauthClientId && config.oauthClientSecret);
}

export function hasAnyToken(config: DynatraceConfig): boolean {
  return Boolean(config.platformToken || hasOAuthCredentials(config));
}

export type TokenKind = "api" | "platform" | "bearer";

export function classifyToken(token: string): TokenKind {
  if (token.startsWith("dt0c01.")) return "api";
  if (token.startsWith("dt0s16.")) return "platform";
  return "bearer";
}

export function authHeader(token: string): string {
  return classifyToken(token) === "api" ? `Api-Token ${token}` : `Bearer ${token}`;
}

export async function getAccessToken(config: DynatraceConfig): Promise<string> {
  if (config.platformToken) return config.platformToken;

  if (!hasOAuthCredentials(config)) {
    throw new OAuthError(
      "No hay credenciales: define DT_PLATFORM_TOKEN o DT_OAUTH_CLIENT_ID + DT_OAUTH_CLIENT_SECRET en .env",
    );
  }

  const cached = readCache();
  if (isValid(cached, config) && cached) return cached.accessToken;

  const body = new URLSearchParams();
  body.set("grant_type", "client_credentials");
  body.set("client_id", config.oauthClientId);
  body.set("client_secret", config.oauthClientSecret);
  if (config.accountUrn) body.set("resource", config.accountUrn);

  let response: Response;
  try {
    response = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
  } catch (err) {
    throw new OAuthError(`No se pudo contactar con el SSO de Dynatrace: ${(err as Error).message}`);
  }

  const text = await response.text();
  if (!response.ok) {
    throw new OAuthError(
      `Fallo al obtener access token (HTTP ${response.status}): ${text.slice(0, 300)}`,
      response.status,
      text,
    );
  }

  let parsed: { access_token?: string; expires_in?: number; scope?: string; resource?: string };
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new OAuthError(`Respuesta del SSO no es JSON válido: ${text.slice(0, 300)}`);
  }

  if (!parsed.access_token) {
    throw new OAuthError(`El SSO no devolvió access_token: ${text.slice(0, 300)}`);
  }

  const expiresIn = (parsed.expires_in ?? 300) - 30;
  const token: TokenCache = {
    accessToken: parsed.access_token,
    expiresAt: Date.now() + expiresIn * 1000,
    resource: parsed.resource,
    scope: parsed.scope,
    clientId: config.oauthClientId,
  };
  writeCache(token);
  return token.accessToken;
}

export async function tokenInfo(config: DynatraceConfig): Promise<{
  mode: "platform-token" | "oauth";
  cached: boolean;
  expiresAt?: string;
  scope?: string;
  resource?: string;
  error?: string;
}> {
  if (config.platformToken) return { mode: "platform-token", cached: true };
  if (!hasOAuthCredentials(config)) {
    return { mode: "oauth", cached: false, error: "Credenciales OAuth no configuradas" };
  }
  const cached = readCache();
  if (isValid(cached, config) && cached) {
    return {
      mode: "oauth",
      cached: true,
      expiresAt: new Date(cached.expiresAt).toISOString(),
      scope: cached.scope,
      resource: cached.resource,
    };
  }
  try {
    const token = await getAccessToken(config);
    const expiresAt = new Date(Date.now() + 270 * 1000).toISOString();
    return {
      mode: "oauth",
      cached: false,
      expiresAt,
      scope: token ? "nuevo access token obtenido" : undefined,
    };
  } catch (err) {
    return { mode: "oauth", cached: false, error: (err as Error).message };
  }
}