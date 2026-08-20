import { loadConfig, mcpServerUrl } from "./config.js";
import { runDql, getEntities, getProblems, getMetrics, genericGet, checkPlatformApi } from "./api.js";
import { runDtctl, checkDtctl } from "./dtctl.js";
import { testMcpConnection } from "./mcp.js";
import { apiFetch, ApiError } from "./http.js";
import { tokenInfo, hasAnyToken, hasOAuthCredentials } from "./oauth.js";
import { runScraper } from "./docs/scraper.js";
import { searchDocs } from "./docs/search.js";
import { executeSkillPipeline } from "./docs/skillPipeline.js";
import { validateSkill, listAllSkills } from "./docs/validator.js";

export interface CliOptions {
  output?: string;
  pageSize?: number;
  type?: string;
  tag?: string;
  status?: string;
  timeoutMs?: number;
  smoke?: boolean;
  domain?: string;
  limit?: number;
  force?: boolean;
  name?: string;
}

const HELP = `
dtx - Entorno de trabajo Dynatrace (CLI + API + MCP + dtctl + Docs + Skills)

USO PRINCIPAL:
  dtx config                          Muestra la configuración actual (sin secretos)
  dtx doctor                          Comprueba entorno, token y conexión a la API
  dtx mcp                             Muestra la URL del MCP server y cómo configurarla
  dtx dql "<query>" [--output table]  Ejecuta una consulta DQL en Grail
  dtx entities [--type SVC] [--tag X] Lista entidades monitorizadas (API v2)
  dtx problems [--status OPEN]        Lista problemas detectados
  dtx metrics                         Lista métricas disponibles
  dtx api "/api/v2/<recurso>"         GET genérico a la API
  dtx dtctl [args...]                 Ejecuta dtctl (proxy). Ej: dtx dtctl get workflows
  dtx test                            Verifica MCP, CLI (dtctl) y API (requiere .env completo)
  dtx test --smoke                    Verificación básica sin credenciales (entorno, dtctl, URL MCP)
  dtx token                           Estado del access token (OAuth client credentials o platform)

DOCUMENTACIÓN Y BASE DE CONOCIMIENTO:
  dtx docs scrape [--domain <dom>]    Descarga/ingiere docs oficiales (docs.dynatrace.com)
  dtx docs update                     Actualización incremental de documentos modificados
  dtx docs search "<query>"           Busca en la base de conocimiento local

DESARROLLO AUTÓNOMO DE SKILLS:
  dtx skill create "<solicitud>"      Genera una skill validada por el pipeline de 11 pasos
  dtx skill validate <nombre>         Valida la trazabilidad y respaldo documental de una skill
  dtx skill list                      Lista todas las skills del entorno y su estado de verificación

OPCIONES GLOBALES:
  --output json|table|raw             Formato de salida (por defecto: env DTX_OUTPUT o json)
  --domain <dominio>                  Filtra por dominio (grail, k8s, openpipeline, appengine, etc.)
  --limit <n>                         Límite de resultados / páginas
  --force                             Fuerza re-descarga completa en scraper
  --smoke                             Modo de prueba sin credenciales
  --help, -h                          Muestra esta ayuda
`.trim();

export function cmdHelp(): void {
  console.log(HELP);
}

export async function cmdDocsScrape(options: CliOptions): Promise<void> {
  await runScraper({
    domain: options.domain,
    limit: options.limit ?? 25,
    force: options.force,
  });
}

export async function cmdDocsUpdate(): Promise<void> {
  console.log("[Docs] Ejecutando actualización incremental de documentación...");
  await runScraper({ force: false });
}

export function cmdDocsSearch(query: string, options: CliOptions): void {
  if (!query) {
    console.error('Uso: dtx docs search "<término de búsqueda>" [--domain <dominio>]');
    process.exitCode = 1;
    return;
  }
  const results = searchDocs(query, {
    domain: options.domain,
    limit: options.limit ?? 10,
  });

  if (results.length === 0) {
    console.log(`(Sin resultados para "${query}". Ingiere docs ejecutando: dtx docs scrape)`);
    return;
  }

  console.log(`\nEncontrados ${results.length} documentos para "${query}":\n`);
  for (const r of results) {
    console.log(`• [Score: ${r.score}] [${r.doc.domain.toUpperCase()}] ${r.doc.title}`);
    console.log(`  URL:     ${r.doc.url}`);
    console.log(`  Snippet: ${r.snippet}`);
    if (r.doc.codeBlocks && r.doc.codeBlocks.length > 0) {
      console.log(`  Código:  ${r.doc.codeBlocks[0].code.slice(0, 100).replace(/\n/g, " ")}...`);
    }
    console.log("");
  }
}

export async function cmdSkillCreate(prompt: string, options: CliOptions): Promise<void> {
  if (!prompt) {
    console.error('Uso: dtx skill create "<solicitud o capacidad>" [--domain <dominio>] [--force]');
    process.exitCode = 1;
    return;
  }

  const result = await executeSkillPipeline({
    prompt,
    domain: options.domain,
    skillName: options.name,
    autoDeploy: true,
    forceRecreate: options.force,
  });

  if (result.status !== "SUCCESS" && result.status !== "REUSED") {
    process.exitCode = 1;
  }
}

export function cmdSkillValidate(skillName: string): void {
  if (!skillName) {
    console.error("Uso: dtx skill validate <nombre-de-la-skill>");
    process.exitCode = 1;
    return;
  }
  const res = validateSkill(skillName);
  console.log(`\nAuditoría de Trazabilidad: Skill '${res.skillName}'`);
  console.log(`  - Archivo SKILL.md:         ${res.hasSkillMd ? "PRESENTE (OK)" : "FALTA"}`);
  console.log(`  - Frontmatter YAML:         ${res.validFrontmatter ? "VÁLIDO (OK)" : "INVÁLIDO"}`);
  console.log(`  - Evidencia (evidence.json): ${res.hasEvidence ? "PRESENTE (OK)" : "FALTA"}`);
  console.log(`  - Fuentes documentales:     ${res.backedByDocsCount} páginas oficiales`);
  console.log(`  - Estado de Verificación:   ${res.status}`);

  if (res.sources.length > 0) {
    console.log(`  - Fuentes respaldadas:`);
    for (const s of res.sources) {
      console.log(`    • ${s}`);
    }
  }
  console.log("");
}

export function cmdSkillList(): void {
  const skills = listAllSkills();
  const families: Array<{ label: string; name: "core" | "domain" }> = [
    { label: "CORE SKILLS", name: "core" },
    { label: "DOMAIN SKILLS", name: "domain" },
  ];

  for (const family of families) {
    const group = skills.filter((s) => s.family === family.name);
    if (group.length === 0) continue;

    console.log(`\n  ${family.label}`);
    console.log(`  ${"SKILL".padEnd(32)}   ${"ESTADO".padEnd(12)}   ${"FUENTES".padEnd(8)}   DETALLE`);
    console.log("  " + "-".repeat(75));

    for (const s of group) {
      const statusLabel = s.status === "VERIFIED" ? "VERIFICADA" : s.status === "PARTIAL" ? "PARCIAL   " : "LEGACY    ";
      const sourcesCount = `${s.backedByDocsCount} docs`.padEnd(8);
      const detail =
        s.status === "VERIFIED"
          ? "100% respaldada por docs"
          : s.validFrontmatter
            ? "Frontmatter OK, sin evidence.json"
            : "Incompleta o frontmatter inválido";
      console.log(`  ${s.skillName.padEnd(32)}   ${statusLabel.padEnd(12)}   ${sourcesCount}   ${detail}`);
    }
  }
  console.log("");
}

export function cmdConfig(): void {
  const config = loadConfig();
  console.log(
    JSON.stringify(
      {
        environmentId: config.environmentId || "(no configurado)",
        environmentUrl: config.environmentUrl || "(no configurado)",
        platformTokenSet: Boolean(config.platformToken),
        oauthClientIdSet: Boolean(config.oauthClientId),
        oauthClientSecretSet: Boolean(config.oauthClientSecret),
        accountUrnSet: Boolean(config.accountUrn),
        dtctlBin: config.dtctlBin,
        output: config.output,
        mcpServerUrl: mcpServerUrl(config) || "(no configurado)",
      },
      null,
      2,
    ),
  );
}

export async function cmdToken(): Promise<void> {
  const config = loadConfig();
  const info = await tokenInfo(config);
  const safe: Record<string, unknown> = {
    mode: info.mode,
    cached: info.cached,
  };
  if (info.mode === "oauth") {
    if (info.error) {
      safe.error = info.error;
    } else {
      safe.resource = info.resource ?? null;
      safe.scope = info.scope ?? null;
      if (info.expiresAt) safe.expiresAt = info.expiresAt;
    }
  }
  if (info.mode === "oauth" && info.error) {
    console.error(JSON.stringify(safe, null, 2));
    process.exitCode = 1;
  } else {
    console.log(JSON.stringify(safe, null, 2));
  }
}

export async function cmdDoctor(): Promise<void> {
  const config = loadConfig();
  const failures: string[] = [];

  if (!config.environmentUrl) {
    failures.push("DT_ENVIRONMENT_ID (o DT_ENVIRONMENT_URL) no configurado");
  }
  if (!hasAnyToken(config)) {
    failures.push("DT_PLATFORM_TOKEN o DT_OAUTH_CLIENT_ID/DT_OAUTH_CLIENT_SECRET no configurados");
  }

  if (failures.length > 0) {
    for (const f of failures) console.error(`[X] ${f}`);
    console.error("\nCopia .env.example a .env y completa los valores.");
    process.exitCode = 1;
    return;
  }

  console.log(`[OK] Entorno: ${config.environmentUrl}`);
  if (hasOAuthCredentials(config) && !config.platformToken) {
    console.log("[*] Autenticación: OAuth client credentials (token de 5 min con refresco automático)");
  }
  try {
    await checkPlatformApi(config);
    console.log("[OK] Token válido contra la API de plataforma (DQL/Grail)");
  } catch (err) {
    console.error("[X] Fallo al conectar con la API de plataforma");
    console.error((err as Error).message);
    process.exitCode = 1;
  }
}

export function cmdMcp(): void {
  const config = loadConfig();
  const url = mcpServerUrl(config);
  if (!url) {
    console.error("Configura DT_ENVIRONMENT_ID en .env para generar la URL del MCP server.");
    process.exitCode = 1;
    return;
  }
  console.log(`MCP server URL:\n  ${url}\n`);
  console.log("Autenticación (una de las dos):");
  console.log("  1) Platform token:  Authorization: Bearer <DT_PLATFORM_TOKEN>");
  console.log("  2) OAuth client (Authorization Code): ID + secret, el cliente refresca el token");
  console.log(
    "\nScopes MCP necesarios: mcp-gateway:servers:read, mcp-gateway:servers:invoke, ai:operator:execute, storage:*:read, davis-copilot:*:execute",
  );
}

export async function cmdDql(query: string, options: CliOptions): Promise<void> {
  if (!query) {
    console.error("Uso: dtx dql \"<query>\"  Ej: dtx dql \"fetch logs | limit 10\"");
    process.exitCode = 1;
    return;
  }
  await runDql(loadConfig(), query, {
    output: options.output ?? "json",
    timeoutMs: options.timeoutMs,
  });
}

export async function cmdEntities(options: CliOptions): Promise<void> {
  await getEntities(loadConfig(), {
    type: options.type,
    tag: options.tag,
    pageSize: options.pageSize ?? 50,
    output: options.output ?? "json",
  });
}

export async function cmdProblems(options: CliOptions): Promise<void> {
  await getProblems(loadConfig(), {
    status: options.status,
    pageSize: options.pageSize ?? 50,
    output: options.output ?? "json",
  });
}

export async function cmdMetrics(options: CliOptions): Promise<void> {
  await getMetrics(loadConfig(), { output: options.output ?? "json" });
}

export async function cmdApi(path: string, options: CliOptions): Promise<void> {
  if (!path) {
    console.error('Uso: dtx api "/api/v2/<recurso>"');
    process.exitCode = 1;
    return;
  }
  await genericGet(loadConfig(), path, { output: options.output ?? "json" });
}

export async function cmdDtctl(args: string[]): Promise<void> {
  const code = await runDtctl(loadConfig(), args);
  process.exitCode = code;
}

interface TestResult {
  area: string;
  ok: boolean;
  detail: string;
}

export async function cmdTest(options: CliOptions): Promise<void> {
  const config = loadConfig();
  const results: TestResult[] = [];

  results.push(
    config.environmentUrl
      ? { area: "entorno", ok: true, detail: config.environmentUrl }
      : { area: "entorno", ok: false, detail: "DT_ENVIRONMENT_ID (o DT_ENVIRONMENT_URL) no configurado en .env" },
  );

  const dtctl = checkDtctl(config);
  if (dtctl.installed) {
    const short = (dtctl.version ?? "").split(/\r?\n/)[0];
    results.push({ area: "cli", ok: true, detail: `dtctl instalado (${short})` });
  } else {
    results.push({
      area: "cli",
      ok: false,
      detail: `dtctl no encontrado (${dtctl.error}). Instálalo: .\\scripts\\setup.ps1 -InstallDtctl o config DTCTL_BIN`,
    });
  }

  if (options.smoke) {
    results.push({
      area: "mcp (url)",
      ok: Boolean(mcpServerUrl(config)),
      detail: mcpServerUrl(config) || "no se puede generar la URL del MCP sin entorno",
    });
  } else {
    if (!hasAnyToken(config)) {
      results.push({ area: "api", ok: false, detail: "DT_PLATFORM_TOKEN o DT_OAUTH_CLIENT_ID/DT_OAUTH_CLIENT_SECRET no configurado" });
      results.push({ area: "mcp", ok: false, detail: "DT_PLATFORM_TOKEN o DT_OAUTH_CLIENT_ID/DT_OAUTH_CLIENT_SECRET no configurado" });
    } else {
      try {
        await checkPlatformApi(config);
        results.push({ area: "api", ok: true, detail: "API de plataforma (DQL/Grail) -> 200 OK" });
      } catch (err) {
        const e = err as ApiError;
        results.push({
          area: "api",
          ok: false,
          detail: e.status ? `HTTP ${e.status}: ${e.body.slice(0, 200)}` : (e as Error).message,
        });
      }

      const mcp = await testMcpConnection(config);
      if (mcp.reachable && mcp.authenticated) {
        results.push({
          area: "mcp",
          ok: true,
          detail: `Handshake OK (protocol ${mcp.protocolVersion}) server=${JSON.stringify(mcp.serverInfo)}`,
        });
      } else if (mcp.reachable && !mcp.authenticated) {
        results.push({
          area: "mcp",
          ok: false,
          detail: `Servidor alcanzable (HTTP ${mcp.status}) pero ${mcp.error}`,
        });
      } else {
        results.push({ area: "mcp", ok: false, detail: `No alcanzable: ${mcp.error}` });
      }
    }
  }

  const label = (area: string) => area.padEnd(10);
  console.log(`\n  ${label("ÁREA")}   ESTADO   DETALLE`);
  for (const r of results) {
    const status = r.ok ? "OK    " : "FALLO ";
    console.log(`  ${label(r.area)}   ${status}  ${r.detail}`);
  }

  const allOk = results.every((r) => r.ok);
  console.log(`\n  ${allOk ? "TODO OK - MCP, CLI y API operativos" : "HAY FALLOS - revisa las entradas marcadas como FALLO"}`);
  if (!options.smoke && results.some((r) => r.area === "api" && r.ok === false)) {
    console.log("  Consejo: verifica el token y sus scopes (entities.read, metrics.read, ...) en docs/02-autenticacion.md");
  }
  if (!options.smoke && results.some((r) => r.area === "mcp" && r.ok === false && r.detail.includes("Alcanzable"))) {
    console.log("  Consejo: el servidor MCP responde pero requiere token con scopes mcp-gateway:servers:read/invoke");
  }
  process.exitCode = allOk ? 0 : 1;
}
