import { loadConfig, mcpServerUrl } from "./config.js";
import { runDql, getEntities, getProblems, getMetrics, genericGet, checkPlatformApi } from "./api.js";
import { runDtctl, checkDtctl } from "./dtctl.js";
import { testMcpConnection } from "./mcp.js";
import { apiFetch, ApiError } from "./http.js";
import { tokenInfo, hasAnyToken, hasOAuthCredentials } from "./oauth.js";
import { runScraper, loadDocsIndex, calculateDocsStorage, listStaleFormatDocs, DOC_FORMAT_VERSION } from "./docs/scraper.js";
import { searchDocs } from "./docs/search.js";
import { executeSkillPipeline, backfillSkillEvidence } from "./docs/skillPipeline.js";
import { buildResearchDraft } from "./docs/distill.js";
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
  maxBytes?: number;
  budget?: number;
  maxCodeChars?: number;
  force?: boolean;
  source?: string;
  dryRun?: boolean;
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
  dtx docs stats                      Muestra estadísticas y almacenamiento consumido por docs
  dtx docs details                    Alias con detalle de almacenamiento y desglose por dominio
  dtx docs update-format              Migra al formato vigente solo los docs sin formato 3.0.0
     [--domain <dom>] [--limit <n>]   (sin consultar sitemap; --dry-run para previsualizar)
  dtx docs refresh-videos             Regenera solo los docs con videos para añadir sección "## Videos"
     [--limit <n>]                    (--dry-run lista los documentos afectados)
DESARROLLO AUTÓNOMO DE SKILLS:
dtx skill draft "<capacidad>"       SEMIAUTOMÁTICO paso 1: destila la KB local en references/research-brief.md
      [--domain <dom>] [--limit <n>]   (determinista, 0 tokens IA; sin límites por defecto, --limit/budget opcional)
  dtx skill create "<solicitud>"      Genera una skill validada por el pipeline de 11 pasos [--limit <n>]
  dtx skill validate <nombre>         Valida trazabilidad documental + calidad de contenido
  dtx skill backfill <nombre>         Genera evidence.json para una skill buscando en la base documental local
  dtx skill list                      Lista todas las skills del entorno y su estado de verificación

OPCIONES GLOBALES:
  --output json|table|raw             Formato de salida (por defecto: env DTX_OUTPUT o json)
  --domain <dominio>                  Filtra por dominio (grail, k8s, openpipeline, appengine, etc.)
  --limit <n>                         Límite de resultados / páginas
  --force                             Fuerza re-descarga completa en scraper
  --source docs|developer             Sitio del scraper: docs.dynatrace.com o developer.dynatrace.com
  --dry-run                           Previsualiza cuántos docs migraría update-format sin descargar
  --smoke                             Modo de prueba sin credenciales
  --help, -h                          Muestra esta ayuda
`.trim();

export function cmdHelp(): void {
  console.log(HELP);
}

export function cmdDocsStats(options: CliOptions): void {
  const index = loadDocsIndex();
  const storage = calculateDocsStorage();

  if (options.output === "json") {
    console.log(
      JSON.stringify(
        {
          totalDocuments: index.totalDocuments,
          lastUpdated: index.lastUpdated,
          storage: {
            total: storage.totalFormatted,
            totalBytes: storage.totalBytes,
            markdown: storage.markdownFormatted,
            markdownBytes: storage.markdownBytes,
            records: storage.recordsFormatted,
            recordsBytes: storage.recordsBytes,
            index: storage.indexFormatted,
            indexBytes: storage.indexBytes,
            averagePerDoc: storage.averageDocFormatted,
          },
          domains: index.domains,
          domainStorage: storage.domainStorage,
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log("\n  BASE DE CONOCIMIENTO LOCAL (Dynatrace Official Docs)");
  console.log("  " + "=".repeat(70));
  console.log(`  Total de registros en existencia: ${index.totalDocuments} documentos`);
  console.log(
    `  Última actualización:             ${index.lastUpdated ? new Date(index.lastUpdated).toLocaleString() : "Nunca"}`,
  );
  console.log(
    `  Almacenamiento total consumido:   ${storage.totalFormatted} (Markdown: ${storage.markdownFormatted}, Records: ${storage.recordsFormatted}, Index: ${storage.indexFormatted})`,
  );
  console.log(`  Tamaño promedio por documento:    ${storage.averageDocFormatted}`);
  console.log("\n  DESGLOSE POR DOMINIO:");
  console.log(
    `  ${"DOMINIO".padEnd(18)}   ${"DOCUMENTOS".padEnd(12)}   ${"ALMACENAMIENTO".padEnd(16)}   PORCENTAJE`,
  );
  console.log("  " + "-".repeat(70));

  const sortedDomains = Object.entries(index.domains || {}).sort((a, b) => b[1] - a[1]);
  for (const [domain, count] of sortedDomains) {
    const domStorage = storage.domainStorage[domain]?.formatted ?? "0 B";
    const pct = storage.domainStorage[domain]?.percentage ?? (index.totalDocuments > 0 ? `${((count / index.totalDocuments) * 100).toFixed(1)}%` : "0.0%");
    console.log(
      `  ${domain.padEnd(18)}   ${count.toString().padEnd(12)}   ${domStorage.padEnd(16)}   ${pct}`,
    );
  }
  console.log("  " + "-".repeat(70));
  console.log(
    `  ${"TOTAL".padEnd(18)}   ${index.totalDocuments.toString().padEnd(12)}   ${storage.markdownFormatted.padEnd(16)}   100.0%\n`,
  );
}

export function cmdDocsList(options: CliOptions): void {
  const index = loadDocsIndex();
  let docs = Object.values(index.documents || {});
  if (options.domain) {
    const target = options.domain.toLowerCase();
    docs = docs.filter((d) => d.domain.toLowerCase() === target || d.url.toLowerCase().includes(target));
  }
  const limit = options.limit ?? 20;

  if (options.output === "json") {
    console.log(JSON.stringify(docs.slice(0, limit), null, 2));
    return;
  }

  if (docs.length === 0) {
    console.log("\n(No hay documentos descargados que coincidan con el criterio)\n");
    return;
  }

  console.log(`\nDocumentos descargados (${Math.min(docs.length, limit)} de ${docs.length}):\n`);
  for (const doc of docs.slice(0, limit)) {
    console.log(`• [${doc.domain.toUpperCase()}] ${doc.title}`);
    console.log(`  URL:     ${doc.url}`);
    console.log(`  Archivo: ${doc.localPath || doc.slug || doc.id}`);
    console.log("");
  }
}

export async function cmdDocsScrape(options: CliOptions): Promise<void> {
  await runScraper({
    domain: options.domain,
    limit: options.limit,
    force: options.force,
    source: options.source,
  });
}

export async function cmdDocsUpdate(): Promise<void> {
  console.log("[Docs] Ejecutando actualización incremental de documentación...");
  await runScraper({ force: false });
}

export async function cmdDocsUpdateFormat(options: CliOptions): Promise<void> {
  const stale = listStaleFormatDocs({ domain: options.domain, source: options.source });

  if (options.dryRun) {
    if (options.output === "json") {
      console.log(JSON.stringify({ total: stale.length, urls: stale.slice(0, options.limit ?? 50).map((d) => d.url) }, null, 2));
      return;
    }
    console.log(`\n[Docs] Dry-run: ${stale.length} documentos requieren migración al formato ${DOC_FORMAT_VERSION} (no se descargó nada).`);
    const byDomain: Record<string, number> = {};
    for (const doc of stale) {
      byDomain[doc.domain] = (byDomain[doc.domain] ?? 0) + 1;
    }
    for (const [dom, count] of Object.entries(byDomain).sort((a, b) => b[1] - a[1]).slice(0, 15)) {
      console.log(`  - ${dom.padEnd(18)} ${count}`);
    }
    return;
  }

  console.log(`[Docs] Migración de formato: ${stale.length} documentos desactualizados serán re-descargados...`);
  await runScraper({
    staleFormatOnly: true,
    domain: options.domain,
    limit: options.limit,
    source: options.source,
  });
}

export async function cmdDocsRefreshVideos(options: CliOptions): Promise<void> {
  const index = loadDocsIndex();
  let withVideos = Object.values(index.documents).filter((doc) => doc.media?.some((item) => item.role === "video"));

  if (options.domain) {
    const targetDomain = options.domain.toLowerCase();
    withVideos = withVideos.filter(
      (doc) =>
        doc.domain.toLowerCase() === targetDomain ||
        doc.url.toLowerCase().includes(targetDomain),
    );
  }

  if (options.dryRun) {
    console.log(`\n[Docs] Dry-run: ${withVideos.length} documentos con videos en la KB (no se descargó nada).`);
    for (const doc of withVideos.slice(0, options.limit ?? 20)) {
      const count = doc.media?.filter((item) => item.role === "video").length ?? 0;
      console.log(`  - [${count} video(s)] ${doc.title}`);
    }
    return;
  }

  console.log(`[Docs] Regenerando ${withVideos.length} documentos con videos (añade sección "## Videos")...`);
  await runScraper({ urls: withVideos.map((doc) => doc.url), limit: options.limit });
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
    console.error('Uso: dtx skill create "<solicitud o capacidad>" [--domain <dominio>] [--limit <n>] [--force]');
    process.exitCode = 1;
    return;
  }

  const result = await executeSkillPipeline({
    prompt,
    domain: options.domain,
    skillName: options.name,
    evidenceLimit: options.limit,
    autoDeploy: true,
    forceRecreate: options.force,
  });

  if (result.status !== "SUCCESS" && result.status !== "REUSED") {
    process.exitCode = 1;
  }
}

export function cmdSkillDraft(prompt: string, options: CliOptions): void {
  if (!prompt) {
    console.error('Uso: dtx skill draft "<capacidad>" [--domain <dominio>] [--limit <n>] [--budget <bytes>] [--name <nombre>]');
    process.exitCode = 1;
    return;
  }

  const maxDocs = options.limit ?? Number.POSITIVE_INFINITY;
  const maxBriefBytes = options.maxBytes ?? options.budget ?? Number.POSITIVE_INFINITY;
  const maxCodeChars = options.maxCodeChars ?? Number.POSITIVE_INFINITY;

  const res = buildResearchDraft({
    prompt,
    domain: options.domain,
    skillName: options.name,
    maxDocs,
    maxBriefBytes,
    maxCodeCharsPerBlock: maxCodeChars,
  });

  console.log(`\nDraft de investigación (semiautomático, paso 1):`);

  if (res.status === "NO_EVIDENCE") {
    console.error(`  [X] ${res.message}`);
    process.exitCode = 1;
    return;
  }

  const s = res.stats;
  console.log(`  - Skill objetivo:        ${s.skillName}`);
  console.log(`  - Dominio:               ${s.domain}`);
  console.log(`  - Consultas ejecutadas:  ${s.queriesRun} (multi-query)`);
  console.log(`  - Candidatos encontrados:${s.candidatesFound}`);
  console.log(`  - Docs destilados:       ${s.docsDistilled} (contenido completo leído de disco)`);
  console.log(`  - Bloques de código:     ${s.codeBlocksExtracted} extraídos completos`);
  console.log(`  - Encabezados (outline): ${s.headingsExtracted}`);
  console.log(`  - Tamaño del brief:      ${(s.briefBytes / 1024).toFixed(1)} KB (~${s.estimatedTokens.toLocaleString()} tokens)`);
  console.log(`  - Brief escrito en:      ${s.briefPath}`);
  console.log(`  - Evidencia escrita en:  ${s.evidencePath}`);

  console.log(`\n  Top fuentes:`);
  for (const src of res.topSources) {
    console.log(`    • [${src.score}] (${src.codeBlocks} bloques) ${src.title}`);
  }

  console.log(`\n  Siguiente paso (IA): leer SOLO references/research-brief.md y sintetizar SKILL.md.`);
  console.log(`  Luego validar con: dtx skill validate ${s.skillName}\n`);
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
  if (res.backedByDocsCount > 0) {
    console.log(`  - En KB local:              ${res.groundedSources ?? 0}/${res.backedByDocsCount} indexadas`);
  }
  if ((res.duplicateUrls ?? 0) > 0 || (res.nearDuplicateUrls ?? 0) > 0) {
    console.log(`  - Duplicados:               ${res.duplicateUrls ?? 0} exactas, ${res.nearDuplicateUrls ?? 0} casi-duplicadas (ver avisos ⚠)`);
  }
  console.log(`  - Estado de Verificación:   ${res.status}`);
  if (res.quality && res.quality !== "N/A") {
    console.log(`  - Calidad de contenido:     ${res.quality} (${(res.sectionCount ?? 0)} secciones H2, ${((res.contentBytes ?? 0) / 1024).toFixed(1)} KB)`);
    for (const w of res.qualityWarnings) {
      console.log(`      ⚠ ${w}`);
    }
  }

  if (res.sources.length > 0) {
    console.log(`  - Fuentes respaldadas:`);
    for (const s of res.sources) {
      console.log(`    • ${s}`);
    }
  }
  console.log("");
}

export function cmdSkillBackfill(skillName: string, options: CliOptions): void {
  if (!skillName) {
    console.error("Uso: dtx skill backfill <nombre-de-la-skill> [--domain <dominio>] [--limit <n>]");
    process.exitCode = 1;
    return;
  }

  const res = backfillSkillEvidence({
    skillName,
    domain: options.domain,
    limit: options.limit ?? Number.POSITIVE_INFINITY,
  });

  console.log(`\nBackfill de evidencia documental: Skill '${res.skillName}'`);

  if (res.status === "NOT_FOUND" || res.status === "NO_EVIDENCE") {
    console.error(`  [X] ${res.message}`);
    process.exitCode = 1;
    return;
  }

  const shortQuery = res.query.length > 90 ? `${res.query.slice(0, 87)}...` : res.query;
  console.log(`  - Consulta de búsqueda: "${shortQuery}"`);
  console.log(`  - Fuentes encontradas:  ${res.sourcesCount} páginas oficiales`);
  console.log(`  - evidence.json escrito en:`);
  for (const dir of res.writtenTo) {
    console.log(`    • ${dir}\\references\\evidence.json`);
  }
  const beforeStatus = res.before?.status ?? "?";
  const afterStatus = res.after?.status ?? "?";
  const afterDocs = res.after?.backedByDocsCount ?? 0;
  console.log(`  - Estado de validación: ${beforeStatus} -> ${afterStatus} (${afterDocs} docs)`);

  const sources = res.after?.sources ?? [];
  if (sources.length > 0) {
    console.log(`  - Fuentes respaldadas:`);
    for (const s of sources.slice(0, 5)) {
      console.log(`    • ${s}`);
    }
    if (sources.length > 5) console.log(`    • ... y ${sources.length - 5} más`);
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
    console.log(`  ${"SKILL".padEnd(32)}   ${"ESTADO".padEnd(12)}   ${"FUENTES".padEnd(8)}   ${"CALIDAD".padEnd(8)}   DETALLE`);
    console.log("  " + "-".repeat(90));

    for (const s of group) {
      const statusLabel = s.status === "VERIFIED" ? "VERIFICADA" : s.status === "PARTIAL" ? "PARCIAL   " : "LEGACY    ";
      const sourcesCount = `${s.backedByDocsCount} docs`.padEnd(8);
      const quality = (s.quality ?? "N/A").padEnd(8);
      const detail =
        s.qualityWarnings.length > 0
          ? `avisos: ${s.qualityWarnings[0]}`
          : s.status === "VERIFIED"
            ? "100% respaldada por docs"
            : s.validFrontmatter
              ? "Frontmatter OK, sin evidence.json"
              : "Incompleta o frontmatter inválido";
      console.log(`  ${s.skillName.padEnd(32)}   ${statusLabel.padEnd(12)}   ${sourcesCount}   ${quality}   ${detail}`);
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
