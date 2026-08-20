import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { DocMetadata, DocRecord, DocsIndex } from "./types.js";

const DOCS_BASE_URL = "https://docs.dynatrace.com";
const SITEMAP_URL = "https://docs.dynatrace.com/docs/sitemap.xml";
const PROJECT_ROOT = resolve(process.cwd());
const DATA_DIR = join(PROJECT_ROOT, "docs");
const RECORDS_DIR = join(DATA_DIR, "records");
const INDEX_FILE = join(DATA_DIR, "index.json");
const DOC_FORMAT_VERSION = "2.0.0";

const DOMAIN_PATTERNS: Record<string, RegExp[]> = {
  grail: [/grail/i, /dql/i, /query/i, /analyze-explore-automate/i],
  openpipeline: [/openpipeline/i, /pipeline/i, /ingest/i],
  kubernetes: [/kubernetes/i, /k8s/i, /dynakube/i, /operator/i],
  dashboards: [/dashboard/i, /notebook/i],
  logs: [/logs/i, /log-monitoring/i],
  metrics: [/metrics/i, /metric-ingestion/i],
  events: [/events/i, /bizevents/i, /business-events/i],
  security: [/security/i, /vulnerability/i, /compliance/i, /secure/i],
  synthetics: [/synthetic/i, /http-monitor/i, /browser-monitor/i],
  rum: [/real-user-monitoring/i, /digital-experience/i, /user-session/i, /user-action/i],
  iam: [/identity/i, /access-management/i, /iam/i, /policies/i, /tokens/i, /manage/i],
  api: [/dynatrace-api/i, /environment-api/i, /rest-api/i],
};

export function classifyDomain(url: string, title?: string): string {
  const target = `${url} ${title ?? ""}`;
  for (const [domain, patterns] of Object.entries(DOMAIN_PATTERNS)) {
    if (patterns.some((p) => p.test(target))) {
      return domain;
    }
  }
  return "general";
}

export function generateDocId(url: string): string {
  return createHash("sha256").update(url.trim()).digest("hex").slice(0, 16);
}

export function hashContent(content: string): string {
  return createHash("sha256").update(content.trim()).digest("hex");
}

export function ensureDataDirs(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!existsSync(RECORDS_DIR)) {
    mkdirSync(RECORDS_DIR, { recursive: true });
  }
}

export function loadDocsIndex(): DocsIndex {
  ensureDataDirs();
  if (existsSync(INDEX_FILE)) {
    try {
      return JSON.parse(readFileSync(INDEX_FILE, "utf8")) as DocsIndex;
    } catch {
      // Fallback a nuevo índice
    }
  }
  return {
    version: "1.0.0",
    lastUpdated: new Date().toISOString(),
    totalDocuments: 0,
    domains: {},
    documents: {},
  };
}

export function saveDocsIndex(index: DocsIndex): void {
  ensureDataDirs();
  index.lastUpdated = new Date().toISOString();
  index.totalDocuments = Object.keys(index.documents).length;

  const domainCounts: Record<string, number> = {};
  for (const doc of Object.values(index.documents)) {
    domainCounts[doc.domain] = (domainCounts[doc.domain] ?? 0) + 1;
  }
  index.domains = domainCounts;

  writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2), "utf8");
}

/**
 * Convierte HTML crudo a Markdown estructurado y extrae metadatos clave.
 */
export function htmlToMarkdown(html: string): {
  title: string;
  markdown: string;
  headings: string[];
  codeBlocks: Array<{ language: string; code: string }>;
  links: Array<{ text: string; href: string }>;
} {
  // 1. Extraer título
  let title = "Dynatrace Documentation";
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i) ?? html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].replace(/<[^>]+>/g, "").replace(/\| Dynatrace Docs/i, "").trim();
  }

  // 2. Extraer bloques de código antes de limpiar HTML
  const codeBlocks: Array<{ language: string; code: string }> = [];
  const codeBlockRegex = /<pre[^>]*><code(?: class="(?:language-)?([^"]*)")?[^>]*>([\s\S]*?)<\/code><\/pre>/gi;
  let codeMatch: RegExpExecArray | null;
  while ((codeMatch = codeBlockRegex.exec(html)) !== null) {
    const rawLang = (codeMatch[1] ?? "").replace(/^language-/, "").trim() || "text";
    const rawCode = codeMatch[2]
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
    if (rawCode) {
      codeBlocks.push({ language: rawLang, code: rawCode });
    }
  }

  // 3. Extraer enlaces
  const links: Array<{ text: string; href: string }> = [];
  const linkRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/gi;
  let linkMatch: RegExpExecArray | null;
  while ((linkMatch = linkRegex.exec(html)) !== null) {
    const href = linkMatch[1];
    const text = linkMatch[2].replace(/<[^>]+>/g, "").trim();
    if (href && text && !href.startsWith("#") && !href.startsWith("javascript:")) {
      links.push({ text, href });
    }
  }

  // 4. Extraer encabezados
  const headings: string[] = [];
  const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
  let hMatch: RegExpExecArray | null;
  while ((hMatch = headingRegex.exec(html)) !== null) {
    const hText = hMatch[2].replace(/<[^>]+>/g, "").trim();
    if (hText) headings.push(hText);
  }

  // 5. Transformar contenido básico a Markdown
  let text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, "")
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, "")
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, "")
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "\n# $1\n")
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "\n## $1\n")
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "\n### $1\n")
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, "\n#### $1\n")
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, "\n##### $1\n")
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, "\n###### $1\n")
    .replace(/<p[^>]*>/gi, "\n\n")
    .replace(/<\/p>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<(?:strong|b)[^>]*>(.*?)<\/(?:strong|b)>/gi, "**$1**")
    .replace(/<(?:em|i)[^>]*>(.*?)<\/(?:em|i)>/gi, "*$1*")
    .replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`")
    .replace(/<li[^>]*>(.*?)<\/li>/gi, "\n- $1")
    .replace(/<\/(?:ul|ol)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCharCode(Number.parseInt(dec, 10)))
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();

  return { title, markdown: text, headings, codeBlocks, links };
}

function yamlEscape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function buildDocMarkdown(input: {
  id: string;
  url: string;
  title: string;
  domain: string;
  crawledAt: string;
  contentHash: string;
  headings: string[];
  codeBlocks: Array<{ language: string; code: string }>;
  markdown: string;
}): string {
  const headings = input.headings.length > 0 ? input.headings.map((h) => `- ${h}`).join("\n") : "- No headings extracted";
  const codeSummary =
    input.codeBlocks.length > 0
      ? input.codeBlocks.map((block, index) => `- ${index + 1}. ${block.language || "text"} (${block.code.length} chars)`).join("\n")
      : "- No code blocks extracted";

  return `---
formatVersion: "${DOC_FORMAT_VERSION}"
id: "${input.id}"
url: "${input.url}"
title: "${yamlEscape(input.title)}"
domain: "${input.domain}"
crawledAt: "${input.crawledAt}"
contentHash: "${input.contentHash}"
source: "docs.dynatrace.com"
---

# ${input.title}

## Source

- Official URL: [${input.url}](${input.url})
- Domain: \`${input.domain}\`
- Document ID: \`${input.id}\`
- Format version: \`${DOC_FORMAT_VERSION}\`

## Extracted Headings

${headings}

## Extracted Code Blocks

${codeSummary}

## Content

${input.markdown}
`;
}

function writeDocRecord(record: DocRecord): void {
  writeFileSync(record.recordPath ?? join(RECORDS_DIR, `${record.id}.json`), JSON.stringify(record, null, 2), "utf8");
}

/**
 * Descarga y parsea el sitemap completo (4420+ URLs) de Dynatrace Docs.
 */
export async function fetchSitemapUrls(limit?: number): Promise<Array<{ url: string; lastmod?: string }>> {
  console.log(`[Scraper] Consultando sitemap principal: ${SITEMAP_URL}`);
  const results: Array<{ url: string; lastmod?: string }> = [];

  try {
    const res = await fetch(SITEMAP_URL, {
      headers: { "User-Agent": "Dynatrace-Docs-Workbench/1.0" },
    });
    if (!res.ok) {
      console.warn(`[Scraper] Aviso: No se pudo obtener el sitemap (HTTP ${res.status}). Usando lista de semillas.`);
      return getSeedUrls();
    }

    const xml = await res.text();
    parseUrlsetXml(xml, results);
    console.log(`[Scraper] Sitemap procesado: ${results.length} URLs totales descubiertas.`);
  } catch (err) {
    console.warn(`[Scraper] Error al conectar con sitemap: ${(err as Error).message}. Usando semillas.`);
    return getSeedUrls();
  }

  if (results.length === 0) {
    return getSeedUrls();
  }

  // Asegurar que las URLs semilla estén también indexadas
  const existingSet = new Set(results.map((r) => r.url));
  for (const seed of getSeedUrls()) {
    if (!existingSet.has(seed.url)) {
      results.push(seed);
    }
  }

  return limit ? results.slice(0, limit) : results;
}

function parseUrlsetXml(xml: string, output: Array<{ url: string; lastmod?: string }>): void {
  const urlMatches = xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>(?:\s*<lastmod>([^<]+)<\/lastmod>)?/gi);
  for (const m of urlMatches) {
    const loc = m[1]?.trim();
    if (loc && loc.startsWith("http") && !loc.endsWith(".png") && !loc.endsWith(".svg")) {
      output.push({ url: loc, lastmod: m[2]?.trim() });
    }
  }
}

/**
 * URLs semilla para bootstrapping inicial de dominios clave.
 */
function getSeedUrls(): Array<{ url: string; lastmod?: string }> {
  return [
    { url: "https://docs.dynatrace.com/docs/grail" },
    { url: "https://docs.dynatrace.com/docs/grail/dynatrace-query-language" },
    { url: "https://docs.dynatrace.com/docs/platform-services/openpipeline" },
    { url: "https://docs.dynatrace.com/docs/platform-services/openpipeline/processors" },
    { url: "https://docs.dynatrace.com/docs/dynatrace-api" },
    { url: "https://docs.dynatrace.com/docs/setup-and-configuration/setup-on-cloud-platforms/kubernetes" },
    { url: "https://docs.dynatrace.com/docs/discover-dynatrace/dashboards" },
    { url: "https://docs.dynatrace.com/docs/observe-and-explore/metrics" },
    { url: "https://docs.dynatrace.com/docs/observe-and-explore/logs" },
    { url: "https://docs.dynatrace.com/docs/observe-and-explore/events" },
    { url: "https://docs.dynatrace.com/docs/observe-and-explore/business-events" },
    { url: "https://docs.dynatrace.com/docs/manage/identity-access-management" },
    { url: "https://docs.dynatrace.com/docs/synthetic-monitoring" },
    { url: "https://docs.dynatrace.com/docs/digital-experience" },
    { url: "https://docs.dynatrace.com/docs/security" },
  ];
}

/**
 * Descarga y almacena un documento individual.
 */
export async function scrapeDocument(url: string): Promise<DocMetadata | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Dynatrace-Docs-Workbench/1.0" },
    });
    if (!res.ok) {
      console.error(`[Scraper] Fallo al descargar ${url} (HTTP ${res.status})`);
      return null;
    }
    const html = await res.text();
    const parsed = htmlToMarkdown(html);
    const domain = classifyDomain(url, parsed.title);
    const id = generateDocId(url);
    const contentHash = hashContent(parsed.markdown);
    const crawledAt = new Date().toISOString();

    const slug = url.replace(/^https?:\/\/[^/]+\//, "").replace(/\//g, "-") || id;
    const localFileName = `${domain}__${slug}.md`.replace(/[^a-zA-Z0-9._-]/g, "_");
    const localPath = join(DATA_DIR, localFileName);
    const recordPath = join(RECORDS_DIR, `${id}.json`);

    const mdContent = buildDocMarkdown({
      id,
      url,
      title: parsed.title,
      domain,
      crawledAt,
      contentHash,
      headings: parsed.headings,
      codeBlocks: parsed.codeBlocks,
      markdown: parsed.markdown,
    });
    writeFileSync(localPath, mdContent, "utf8");

    writeDocRecord({
      formatVersion: DOC_FORMAT_VERSION,
      id,
      url,
      title: parsed.title,
      domain,
      slug,
      contentHash,
      crawledAt,
      localPath,
      headings: parsed.headings,
      links: parsed.links,
      codeBlocks: parsed.codeBlocks,
      textPreview: parsed.markdown.slice(0, 1500),
      recordPath,
    } as DocRecord & { recordPath: string });

    const metadata: DocMetadata = {
      id,
      url,
      title: parsed.title,
      domain,
      slug,
      formatVersion: DOC_FORMAT_VERSION,
      contentHash,
      headings: parsed.headings,
      codeBlocks: parsed.codeBlocks,
      links: parsed.links,
      crawledAt,
      localPath,
      recordPath,
    };

    return metadata;
  } catch (err) {
    console.error(`[Scraper] Error al procesar ${url}: ${(err as Error).message}`);
    return null;
  }
}

export interface ScrapeOptions {
  domain?: string;
  limit?: number;
  force?: boolean;
}

/**
 * Ejecuta el scraper completo o incremental.
 */
export async function runScraper(options: ScrapeOptions = {}): Promise<{
  totalProcessed: number;
  created: number;
  updated: number;
  unchanged: number;
  failed: number;
}> {
  ensureDataDirs();
  const index = loadDocsIndex();
  const allUrls = await fetchSitemapUrls();

  let filtered = allUrls;
  if (options.domain) {
    const targetDomain = options.domain.toLowerCase();
    filtered = allUrls.filter((item) => classifyDomain(item.url) === targetDomain);
    if (filtered.length === 0) {
      filtered = allUrls.filter((item) => item.url.toLowerCase().includes(targetDomain));
    }
  }

  if (options.limit && filtered.length > options.limit) {
    filtered = filtered.slice(0, options.limit);
  }

  console.log(`\n[Scraper] Iniciando ingestión de ${filtered.length} páginas de documentación...`);

  let created = 0;
  let updated = 0;
  let unchanged = 0;
  let failed = 0;

  for (let i = 0; i < filtered.length; i++) {
    const item = filtered[i];
    const id = generateDocId(item.url);
    const existing = index.documents[id];

    // Modo incremental: si existe y no se fuerza, y coincide lastmod, comprobar
    if (existing && !options.force && item.lastmod && existing.lastmod === item.lastmod) {
      unchanged++;
      continue;
    }

    console.log(`[${i + 1}/${filtered.length}] Descargando: ${item.url}`);
    const metadata = await scrapeDocument(item.url);
    if (metadata) {
      metadata.lastmod = item.lastmod;
      if (!existing) {
        created++;
      } else if (existing.contentHash !== metadata.contentHash) {
        updated++;
      } else {
        unchanged++;
      }
      index.documents[id] = metadata;
    } else {
      failed++;
    }

    // Pequeño delay de cortesía (150ms)
    await new Promise((r) => setTimeout(r, 150));
  }

  saveDocsIndex(index);

  console.log(`\n[Scraper] Ingestión finalizada con éxito.`);
  console.log(`  - Nuevos documentos: ${created}`);
  console.log(`  - Actualizados:       ${updated}`);
  console.log(`  - Sin cambios:        ${unchanged}`);
  console.log(`  - Fallidos:           ${failed}`);
  console.log(`  - Total en índice:    ${index.totalDocuments}\n`);

  return { totalProcessed: filtered.length, created, updated, unchanged, failed };
}
