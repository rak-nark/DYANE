import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import type { DocMediaItem, DocMetadata, DocRecord, DocsIndex, MediaRole } from "./types.js";

const DOCS_BASE_URL = "https://docs.dynatrace.com";
const SITEMAP_URL = "https://docs.dynatrace.com/docs/sitemap.xml";
const DEVELOPER_BASE_URL = "https://developer.dynatrace.com";
const DEVELOPER_SITEMAP_URL = "https://developer.dynatrace.com/sitemap.xml";
const PROJECT_ROOT = resolve(process.cwd());
const DATA_DIR = join(PROJECT_ROOT, "docs");
const RECORDS_DIR = join(DATA_DIR, "records");
const INDEX_FILE = join(DATA_DIR, "index.json");
export const DOC_FORMAT_VERSION = "3.0.0";

const FETCH_TIMEOUT_MS = 20_000;
const DOWNLOAD_CONCURRENCY = 4;
const REQUEST_DELAY_MS = 100;

/**
 * Clases/ids de componentes de UI del sitio web (migas de pan, sidebars, TOC,
 * banners de cookies, feedback, paginación...) sin valor documental: cuando un
 * elemento los lleva en su class/id se descarta completo.
 */
const CHROME_ELEMENT_PATTERN =
  /\b(?:breadcrumbs?|sidebar|side-?nav|table-of-contents|on-this-page|cookie(?:banner|consent)?|gdpr|feedback|pagination|pager|skip-?link|announcement|newsletter|social-?share|share-?buttons?|rating)/i;

/**
 * Escritura atómica: escribe a un archivo temporal y renombra, para que un
 * crash a mitad de escritura nunca corrompa el archivo destino.
 */
function atomicWriteFileSync(filePath: string, data: string): void {
  const tmpPath = `${filePath}.tmp`;
  writeFileSync(tmpPath, data, "utf8");
  renameSync(tmpPath, filePath);
}

const DOMAIN_PATTERNS: Record<string, RegExp[]> = {
  strato: [
    /developer\.dynatrace\.com\/design/i,
    /strato/i,
    /design-tokens/i,
    /release-notes\/design-system/i,
  ],
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

export function formatBytes(bytes: number, decimals = 2): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export interface DocsStorageStats {
  totalBytes: number;
  totalFormatted: string;
  markdownBytes: number;
  markdownFormatted: string;
  recordsBytes: number;
  recordsFormatted: string;
  indexBytes: number;
  indexFormatted: string;
  averageDocBytes: number;
  averageDocFormatted: string;
  domainStorage: Record<
    string,
    {
      bytes: number;
      formatted: string;
      percentage: string;
      count: number;
    }
  >;
}

export function calculateDocsStorage(): DocsStorageStats {
  ensureDataDirs();
  const index = loadDocsIndex();

  let markdownBytes = 0;
  let recordsBytes = 0;
  let indexBytes = 0;
  const domainBytes: Record<string, { bytes: number; count: number }> = {};

  for (const doc of Object.values(index.documents)) {
    if (!domainBytes[doc.domain]) {
      domainBytes[doc.domain] = { bytes: 0, count: 0 };
    }
    domainBytes[doc.domain].count++;
  }

  if (existsSync(DATA_DIR)) {
    const files = readdirSync(DATA_DIR);
    for (const file of files) {
      const fullPath = join(DATA_DIR, file);
      if (file.endsWith(".md")) {
        try {
          const stats = statSync(fullPath);
          markdownBytes += stats.size;
          const domainPrefix = file.split("__")[0];
          if (domainPrefix) {
            if (!domainBytes[domainPrefix]) {
              domainBytes[domainPrefix] = { bytes: 0, count: 0 };
            }
            domainBytes[domainPrefix].bytes += stats.size;
          }
        } catch {
          // ignore
        }
      }
    }
  }

  if (existsSync(RECORDS_DIR)) {
    const files = readdirSync(RECORDS_DIR);
    for (const file of files) {
      if (file.endsWith(".json")) {
        try {
          const stats = statSync(join(RECORDS_DIR, file));
          recordsBytes += stats.size;
        } catch {
          // ignore
        }
      }
    }
  }

  if (existsSync(INDEX_FILE)) {
    try {
      indexBytes = statSync(INDEX_FILE).size;
    } catch {
      // ignore
    }
  }

  const totalBytes = markdownBytes + recordsBytes + indexBytes;
  const docCount = Object.keys(index.documents).length;
  const avgBytes = docCount > 0 ? Math.round(markdownBytes / docCount) : 0;

  const domainStorage: Record<
    string,
    { bytes: number; formatted: string; percentage: string; count: number }
  > = {};

  for (const [dom, data] of Object.entries(domainBytes)) {
    const pct = markdownBytes > 0 ? ((data.bytes / markdownBytes) * 100).toFixed(1) : "0.0";
    domainStorage[dom] = {
      bytes: data.bytes,
      formatted: formatBytes(data.bytes),
      percentage: `${pct}%`,
      count: data.count,
    };
  }

  return {
    totalBytes,
    totalFormatted: formatBytes(totalBytes),
    markdownBytes,
    markdownFormatted: formatBytes(markdownBytes),
    recordsBytes,
    recordsFormatted: formatBytes(recordsBytes),
    indexBytes,
    indexFormatted: formatBytes(indexBytes),
    averageDocBytes: avgBytes,
    averageDocFormatted: formatBytes(avgBytes),
    domainStorage,
  };
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

  atomicWriteFileSync(INDEX_FILE, JSON.stringify(index, null, 2));
}

function decodeEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCharCode(Number.parseInt(hex, 10) <= 0x10ffff ? Number.parseInt(hex, 16) : 63))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCharCode(Number.parseInt(dec, 10)))
    .replace(/&amp;/g, "&");
}

function extractAttr(tag: string, attrName: string): string {
  const match = tag.match(new RegExp(`\\b${attrName}\\s*=\\s*"([^"]*)"`, "i"))
    ?? tag.match(new RegExp(`\\b${attrName}\\s*=\\s*'([^']*)'`, "i"));
  return match?.[1]?.trim() ?? "";
}

const VIDEO_PROVIDER_PATTERN =
  /youtube\.com\/embed\/|youtu\.be\/|player\.vimeo\.com\/|wistia\.(?:net|com)\/|loom\.com\/embed\//i;
const VIDEO_FILE_PATTERN = /\.(?:mp4|webm|mov)(?:[?#].*)?$/i;

function isVideoUrl(url: string): boolean {
  return VIDEO_FILE_PATTERN.test(url) || VIDEO_PROVIDER_PATTERN.test(url);
}

/**
 * Clasifica el rol de una imagen por convención de nombres del CDN
 * (sin descargar el binario):
 *  - "diagram":    filenames `diagram-*` (esquemas/arquitectura)
 *  - "screenshot": capturas de UI (ancho >= 1250 o nombre explícito)
 *  - "icon":       logos, assets corporativos y arte de tarjetas (se descartan)
 */
export function classifyMediaRole(url: string, alt = ""): MediaRole {
  const file = decodeURIComponent(url.split("/").pop() ?? "");
  if (/^diagram[-_]/i.test(file)) return "diagram";
  if (/screen-?shot|capture/i.test(file) || /screenshot/i.test(alt)) return "screenshot";
  if (/\/logos?\//i.test(url) || /dam\/misc\//i.test(url) || /(^|[-_])icon([-_.]|$)/i.test(file)) return "icon";
  const widthMatch = file.match(/-(\d{3,4})-[0-9a-f]{6,}\.(?:png|jpe?g|webp|gif|svg)$/i);
  if (widthMatch) {
    return Number.parseInt(widthMatch[1], 10) >= 1250 ? "screenshot" : "icon";
  }
  return "other";
}

/**
 * Extrae la media referenciada en el HTML: solo URL + alt + rol, sin descargar
 * nada. Deduplica por URL dentro de la página. Los iconos/logos se descartan
 * (sin valor informativo); los videos se capturan desde <video>/<source>,
 * URLs .mp4/.webm/.mov e iframes de proveedores conocidos.
 */
export function extractMedia(html: string): DocMediaItem[] {
  const seen = new Set<string>();
  const media: DocMediaItem[] = [];
  const push = (rawUrl: string, alt: string): void => {
    const url = decodeEntities(rawUrl).trim();
    if (!url || !/^https?:\/\//i.test(url) || seen.has(url)) return;
    seen.add(url);
    media.push({ url, alt, role: isVideoUrl(url) ? "video" : classifyMediaRole(url, alt) });
  };

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    const role = classifyMediaRole(extractAttr(tag, "src"), extractAttr(tag, "alt"));
    if (role === "icon") continue;
    push(extractAttr(tag, "src"), decodeEntities(extractAttr(tag, "alt") || extractAttr(tag, "title") || "image"));
  }

  for (const match of html.matchAll(/<(?:video|source)\b[^>]*>/gi)) {
    const tag = match[0];
    push(extractAttr(tag, "src") || extractAttr(tag, "data-src"), decodeEntities(extractAttr(tag, "title") || "video"));
  }

  for (const match of html.matchAll(/<iframe\b[^>]*>/gi)) {
    const src = extractAttr(match[0], "src");
    if (VIDEO_PROVIDER_PATTERN.test(src)) {
      push(src, decodeEntities(extractAttr(match[0], "title") || "video embed"));
    }
  }

  return media;
}

/**
 * Marcado inline común: bold/italic/code/imagenes/links a Markdown.
 */
function inlineRich(html: string): string {
  return html
    .replace(/<(?:strong|b)\b[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, "**$1**")
    .replace(/<(?:em|i)\b[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, "*$1*")
    .replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, "`$1`")
    .replace(/<img\b[^>]*>/gi, (tag) => {
      const src = extractAttr(tag, "src");
      if (!src) return "";
      // Los iconos/logos no aportan valor documental: fuera también del inline
      if (classifyMediaRole(src, extractAttr(tag, "alt")) === "icon") return "";
      return `![${extractAttr(tag, "alt") || extractAttr(tag, "title") || "image"}](${src})`;
    })
    .replace(/<a\b[^>]*\bhref="([^"]*)"[^>]*>([\s\S]*?)<\/a\s*>/gi, (_m, href: string, inner: string) => {
      const label = inner.replace(/<[^>]+>/g, "").trim();
      return /^https?:\/\//i.test(href) && label ? `[${label}](${href})` : label;
    });
}

/**
 * Limpieza inline: convierte un fragmento HTML en una única línea de Markdown
 * plano (bold/italic/code/img/links) sin saltos. Usada por celdas de tabla,
 * términos de listas de definición y elementos de lista.
 */
function cleanInline(html: string): string {
  return decodeEntities(
    inlineRich(html)
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/(?:p|div|li|h[1-6]|tr|td|th)>/gi, " ")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

const VOID_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr",
]);

/**
 * Devuelve el índice justo después del cierre balanceado del elemento que
 * abre en openTagStart, o -1 si no se encuentra (HTML malformado).
 */
function findBalancedClose(html: string, openTagStart: number): number {
  const name = /^<([a-zA-Z][\w-]*)/.exec(html.slice(openTagStart))?.[1];
  if (!name) return -1;
  const tokenRe = new RegExp(`<(/?)${name}(?=[\\s/>])[^>]*>`, "gi");
  tokenRe.lastIndex = openTagStart + 1;
  let depth = 1;
  let m: RegExpExecArray | null;
  while ((m = tokenRe.exec(html)) !== null) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return m.index + m[0].length;
  }
  return -1;
}

/**
 * Elimina elementos cuyo class/id delata chrome de la web (migas de pan,
 * sidebars, TOC, banners de cookies, feedback...), estén anidados donde estén.
 * Escaneo lineal con cierres balanceados: al descartar un elemento junk se
 * salta completo (incluido su contenido), y el resto se copia intacto.
 */
function stripPageChrome(html: string): string {
  const openRe = /<([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
  let result = "";
  let copyFrom = 0;
  let steps = 0;
  let m: RegExpExecArray | null;
  while ((m = openRe.exec(html)) !== null && steps++ < 100_000) {
    if (VOID_TAGS.has(m[1].toLowerCase()) || m[0].endsWith("/>")) continue;
    if (CHROME_ELEMENT_PATTERN.test(m[2])) {
      const closeEnd = findBalancedClose(html, m.index);
      if (closeEnd === -1) continue;
      result += html.slice(copyFrom, m.index);
      copyFrom = closeEnd;
      openRe.lastIndex = closeEnd;
    }
  }
  result += html.slice(copyFrom);
  return result;
}

/**
 * Convierte UNA tabla HTML (la más interna, sin tablas anidadas) en una tabla
 * pipe de Markdown. La primera fila hace de cabecera (Markdown lo exige) y el
 * caption se conserva como línea en cursiva sobre la tabla.
 */
function htmlTableToMarkdown(tableHtml: string): string {
  const rows: string[][] = [];
  for (const trMatch of tableHtml.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr\s*>/gi)) {
    const cells: string[] = [];
    for (const cellMatch of trMatch[1].matchAll(/<(t[hd])\b[^>]*>([\s\S]*?)<\/\1\s*>/gi)) {
      cells.push(cleanInline(cellMatch[2]).replace(/\|/g, "\\|"));
    }
    if (cells.length > 0) rows.push(cells);
  }
  if (rows.length === 0) return "";

  const width = Math.max(...rows.map((row) => row.length));
  const pad = (row: string[]): string[] => {
    while (row.length < width) row.push("");
    return row;
  };

  const [header, ...body] = rows.map(pad);
  const table = [
    `| ${header.join(" | ")} |`,
    `| ${Array.from({ length: width }, () => "---").join(" | ")} |`,
    ...body.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");

  const caption = tableHtml.match(/<caption\b[^>]*>([\s\S]*?)<\/caption\s*>/i)?.[1];
  const captionLine = caption ? `\n*${cleanInline(caption)}*\n` : "";
  return `\n${captionLine}${table}\n`;
}

/**
 * Limpieza de contenido de un <li>: como las sublistas ya fueron convertidas
 * a Markdown en pases anteriores, aquí se conservan sus saltos de línea para
 * poder indentarlas bajo el elemento padre.
 */
function cleanListContent(html: string): string {
  return decodeEntities(
    inlineRich(html)
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(?:p|div|h[1-6])>/gi, "\n")
      .replace(/<[^>]+>/g, ""),
  )
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

/**
 * Convierte la lista más interna (sin sublistas anidadas) a líneas Markdown,
 * numerando las ordenadas (respetando @start) y usando guiones en las simples.
 */
function convertLeafList(text: string): string {
  return text.replace(
    /<(ol|ul)\b([^>]*)>((?:(?!<[ou]l[\s>])[\s\S])*)<\/\1\s*>/gi,
    (_m, kind: string, attrs: string, inner: string) => {
      const ordered = kind.toLowerCase() === "ol";
      const parsedStart = Number.parseInt(extractAttr(`<${kind} ${attrs}>`, "start"), 10);
      let counter = Number.isFinite(parsedStart) && parsedStart > 0 ? parsedStart : 1;
      const lines: string[] = [];
      for (const li of inner.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li\s*>/gi)) {
        const content = cleanListContent(li[1]);
        if (!content) continue;
        lines.push(ordered ? `${counter++}. ${content.replace(/\n/g, "\n   ")}` : `- ${content.replace(/\n/g, "\n  ")}`);
      }
      return lines.length > 0 ? `\n${lines.join("\n")}\n` : "";
    },
  );
}

/**
 * Heurística ligera de detección de lenguaje para <pre> sin clase language-*.
 */
function guessCodeLanguage(code: string): string {
  const shebang = code.match(/^#!\s*([\w/.-]+)/)?.[1]?.toLowerCase() ?? "";
  if (shebang.includes("groovy")) return "groovy";
  if (shebang.includes("sh") || shebang.includes("bash")) return "bash";
  if (shebang) return shebang.split("/").pop() ?? "text";
  if (/^\s*(?:metadata|workflow|tasks|inputs|dependencies)\s*:\s*$/m.test(code) || /^\s{2,}[\w.-]+\s*:\s/m.test(code)) {
    return "yaml";
  }
  if (/^\s*(?:fetch|timeseries|measure|browse|expand|summarize)\b/m.test(code)) return "dql";
  if (/\bdef\s+call\s*\(|sh\(script:/.test(code)) return "groovy";
  if (/\b(?:import\s*\{|export\s+default|await\s+\w+\s*\(|=>)/.test(code)) return "javascript";
  if (/\b(?:SELECT|INSERT|UPDATE)\b/i.test(code) && /\bFROM\b/i.test(code)) return "sql";
  if (/^[\s\S]{0,200}?\{\s*"[\w.-]+"\s*:/.test(code)) return "json";
  return "text";
}

/**
 * Convierte HTML crudo a Markdown estructurado y extrae metadatos clave.
 *
 * Filosofía: conservar SOLO el contenido único del apartado documental
 * (texto, encabezados, tablas, listas, citas, bloques de código y URLs de
 * imágenes/videos) descartando todo lo que es chrome del navegador o de la web
 * (nav, breadcrumbs, sidebars, TOC, banners, iconos/logos, formularios).
 */
export function htmlToMarkdown(html: string): {
  title: string;
  markdown: string;
  headings: string[];
  codeBlocks: Array<{ language: string; code: string }>;
  links: Array<{ text: string; href: string }>;
  media: DocMediaItem[];
} {
  // 1. Extraer título
  let title = "Dynatrace Documentation";
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) ?? html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (titleMatch && titleMatch[1]) {
    title = decodeEntities(titleMatch[1].replace(/<[^>]+>/g, "")).replace(/\| Dynatrace Docs/i, "").trim();
  }

  // 2. Blindar bloques de código: cada <pre> se extrae y se sustituye por un
  //    placeholder para que las transformaciones posteriores nunca corrompan su
  //    contenido. Al final se restauran como bloques cercados ```lang```.
  const codeBlocks: Array<{ language: string; code: string }> = [];
  let text = html.replace(/<pre\b[^>]*>([\s\S]*?)<\/pre>/gi, (fullMatch, inner: string) => {
    const langClass = fullMatch.match(/\bclass="[^"]*\b(?:language-|lang-)([\w+#.-]+)[" ]/i)?.[1] ?? "";
    const code = decodeEntities(
      inner
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/(?:div|p|li|h[1-6])>/gi, "\n")
        .replace(/<[^>]+>/g, ""),
    ).replace(/^\n+/, "").replace(/\s+$/, "");
    if (!code.trim()) return "\n";
    const language = langClass.toLowerCase() || guessCodeLanguage(code);
    const index = codeBlocks.push({ language, code }) - 1;
    return `\n\x00DTXCODE${index}\x00\n`;
  });

  // 3. Chrome fuera: head completo (title/meta leaks incluidos), script/style/
  //    svg/formularios, nav/header/footer/aside y cualquier elemento cuyo
  //    class/id delate UI del sitio web.
  text = text
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<head\b[^>]*>[\s\S]*?<\/head\s*>/gi, "")
    .replace(/<(script|style|noscript|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg\s*>/gi, "")
    .replace(/<(nav|header|footer|aside|form)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<\/?(?:html|body)\b[^>]*>/gi, "\n");
  text = stripPageChrome(text);

  // 4. Extraer media (URL + alt + rol, sin descargar) ya sin el chrome de la web
  const media = extractMedia(text);

  // 5. Tablas HTML -> tablas pipe de Markdown, blindadas con placeholder
  //    (interior primero para soportar tablas anidadas)
  const tableBlocks: string[] = [];
  {
    let previous: string;
    let passes = 0;
    do {
      previous = text;
      text = text.replace(
        /<table\b[^>]*>((?:(?!<table[\s>])[\s\S])*)<\/table\s*>/gi,
        (tableHtml: string) => {
          const mdTable = htmlTableToMarkdown(tableHtml);
          if (!mdTable.trim()) return "";
          const slot = tableBlocks.push(mdTable) - 1;
          return `\n\x00DTXTABLE${slot}\x00\n`;
        },
      );
    } while (text !== previous && /<table[\s>]/i.test(text) && ++passes < 5);
  }

  // 6. Extraer enlaces (deduplicados) del contenido ya limpio
  const seenLinks = new Set<string>();
  const links: Array<{ text: string; href: string }> = [];
  for (const match of text.matchAll(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>([\s\S]*?)<\/a\s*>/gi)) {
    const href = decodeEntities(match[1]).trim();
    const label = decodeEntities(match[2].replace(/<[^>]+>/g, "")).trim();
    const key = `${href}::${label}`;
    if (
      href &&
      label &&
      !href.startsWith("#") &&
      !href.startsWith("javascript:") &&
      !/^mailto:/i.test(href) &&
      !seenLinks.has(key)
    ) {
      seenLinks.add(key);
      links.push({ text: label, href });
    }
  }

  // 7. Extraer encabezados
  const headings: string[] = [];
  for (const match of text.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1\s*>/gi)) {
    const headingText = decodeEntities(match[2].replace(/<[^>]+>/g, "")).trim();
    if (headingText) headings.push(headingText);
  }

  // 8. Transformación principal a Markdown.
  // Las imágenes se preservan inline como ![alt](src); los videos como enlaces.
  text = text
    .replace(/<iframe\b[^>]*>/gi, (tag) => {
      const src = extractAttr(tag, "src");
      return src && isVideoUrl(src)
        ? `\n[${decodeEntities(extractAttr(tag, "title")) || "Video"}](${src})\n`
        : "";
    })
    .replace(/<\/iframe\s*>/gi, "")
    .replace(/<hr\s*\/?>/gi, "\n---\n")
    .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1\s*>/gi,
      (_m, level: string, inner: string) =>
        `\n${"#".repeat(Number.parseInt(level, 10))} ${inner.replace(/<[^>]+>/g, "").trim()}\n`)
    .replace(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption\s*>/gi, "\n*$1*\n")
    .replace(/<p\b[^>]*>/gi, "\n\n")
    .replace(/<\/p\s*>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<video\b[^>]*>([\s\S]*?)<\/video\s*>/gi, (block) => {
      const openTag = block.match(/<video\b[^>]*>/i)?.[0] ?? "";
      const src = extractAttr(openTag, "src") || extractAttr(openTag, "data-src")
        || block.match(/<source\b[^>]*\bsrc="([^"]*)"/i)?.[1]
        || block.match(/<source\b[^>]*\bdata-src="([^"]*)"/i)?.[1]
        || "";
      return src ? `\n[Video](${src})\n` : "";
    })
    .replace(/<(?:source|track)\b[^>]*>/gi, "")
    .replace(/<\/video\s*>/gi, "");
  text = inlineRich(text);

  // 9. Listas: conversión iterativa desde las más internas hacia fuera,
  //    numerando las ordenadas; después, listas de definición.
  let previous: string;
  let passes = 0;
  do {
    previous = text;
    text = convertLeafList(text);
  } while (text !== previous && /<[ou]l\b/i.test(text) && ++passes < 8);
  text = text
    .replace(/<dt\b[^>]*>([\s\S]*?)<\/dt\s*>/gi, (_m, term: string) => `\n**${cleanInline(term)}**\n`)
    .replace(/<dd\b[^>]*>([\s\S]*?)<\/dd\s*>/gi, (_m, definition: string) => `\n: ${cleanInline(definition)}\n`);

  // 10. Citas/callouts: cada línea se prefija con '> '
  text = text.replace(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote\s*>/gi, (_m, inner: string) => {
    const lines = decodeEntities(
      inner
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/(?:p|div|li|h[1-6])>/gi, "\n")
        .replace(/<[^>]+>/g, ""),
    )
      .split("\n")
      .map((line) => line.replace(/\s+/g, " ").trim())
      .filter(Boolean);
    return lines.length > 0 ? `\n${lines.map((line) => `> ${line}`).join("\n")}\n` : "";
  });

  // 11. Cierre: contenedores residuales, etiquetas sueltas y espacios.
  //     NOTA: no se des-indentan líneas (los sub-niveles de listas usan
  //     sangría como marcado semántico).
  text = text
    .replace(/<(?:ul|ol|dl|table|thead|tbody|tfoot|tr|figure|main|article|section|details|summary)\b[^>]*>/gi, "\n")
    .replace(/<\/(?:ul|ol|dl|table|thead|tbody|tfoot|figure|main|article|section|details|summary)\s*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/([^\n])[ \t]+/g, "$1 ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();

  // Decodificar entidades al final (&amp; al último para no doble-decodificar)
  text = decodeEntities(text);

  // Restaurar primero las tablas y después los bloques de código blindados
  text = text.replace(/\x00DTXTABLE(\d+)\x00/g, (_m, index: string) =>
    tableBlocks[Number.parseInt(index, 10)] ?? "");
  text = text.replace(/\x00DTXCODE(\d+)\x00/g, (_m, index: string) => {
    const block = codeBlocks[Number.parseInt(index, 10)];
    if (!block) return "";
    return `\n\`\`\`${block.language}\n${block.code}\n\`\`\`\n`;
  });

  return { title, markdown: text, headings, codeBlocks, links, media };
}

function yamlEscape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * Convierte URLs de embed (youtube.com/embed/ID?params) a formato watch?v=ID,
 * más amigable para previsualizar/compartir. Otras URLs se devuelven intactas.
 */
export function normalizeVideoUrl(url: string): string {
  const yt = url.match(/youtube\.com\/embed\/([\w-]+)/i);
  return yt ? `https://www.youtube.com/watch?v=${yt[1]}` : url;
}

function buildDocMarkdown(input: {
  id: string;
  url: string;
  title: string;
  domain: string;
  crawledAt: string;
  contentHash: string;
  codeBlocks: Array<{ language: string; code: string }>;
  markdown: string;
  videos?: DocMediaItem[];
}): string {
  const codeSummary =
    input.codeBlocks.length > 0
      ? input.codeBlocks.map((block, index) => `- ${index + 1}. ${block.language || "text"} (${block.code.length} chars)`).join("\n")
      : "- No code blocks extracted";

  const seenVideos = new Set<string>();
  const videoLines: string[] = [];
  for (const video of input.videos ?? []) {
    const normalized = normalizeVideoUrl(video.url);
    if (seenVideos.has(normalized)) continue;
    seenVideos.add(normalized);
    videoLines.push(`- [${video.alt || "Video"}](${normalized})`);
  }
  const videosSection =
    videoLines.length > 0 ? `\n## Videos\n\n${videoLines.join("\n")}\n` : "";

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

## Extracted Code Blocks

${codeSummary}

## Content

${input.markdown}${videosSection}`;
}

function writeDocRecord(record: DocRecord): void {
  atomicWriteFileSync(record.recordPath ?? join(RECORDS_DIR, `${record.id}.json`), JSON.stringify(record, null, 2));
}

/**
 * Descarga y parsea el sitemap completo (4420+ URLs) de Dynatrace Docs,
 * junto con el sitemap del sitio de Dynatrace Developer (Strato/AppEngine).
 */
export async function fetchSitemapUrls(limit?: number): Promise<Array<{ url: string; lastmod?: string }>> {
  console.log(`[Scraper] Consultando sitemap principal: ${SITEMAP_URL}`);
  const results = await fetchSitemapFrom(SITEMAP_URL, "Dynatrace Docs");

  let devResults: Array<{ url: string; lastmod?: string }> = [];
  try {
    console.log(`[Scraper] Consultando sitemap de Dynatrace Developer: ${DEVELOPER_SITEMAP_URL}`);
    devResults = await fetchSitemapFrom(DEVELOPER_SITEMAP_URL, "Dynatrace Developer");
    console.log(`[Scraper] Sitemap Developer procesado: ${devResults.length} URLs adicionales.`);
  } catch (err) {
    console.warn(`[Scraper] Aviso: sitemap de Developer no disponible: ${(err as Error).message}.`);
  }

  const seen = new Set(results.map((r) => r.url));
  for (const item of devResults) {
    if (!seen.has(item.url)) {
      seen.add(item.url);
      results.push(item);
    }
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

async function fetchSitemapFrom(sitemapUrl: string, label: string): Promise<Array<{ url: string; lastmod?: string }>> {
  const results: Array<{ url: string; lastmod?: string }> = [];
  try {
    const res = await fetch(sitemapUrl, {
      headers: { "User-Agent": "Dynatrace-Docs-Workbench/1.0" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const xml = await res.text();
    parseUrlsetXml(xml, results);
    if (results.length === 0) {
      throw new Error("sitemap vacío o no compatible");
    }
    return results;
  } catch (err) {
    if (sitemapUrl === SITEMAP_URL) {
      console.warn(`[Scraper] Aviso: No se pudo obtener el sitemap de ${label} (${(err as Error).message}). Usando lista de semillas.`);
      return getSeedUrls();
    }
    throw err;
  }
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
    { url: "https://docs.dynatrace.com/docs" },
    { url: "https://docs.dynatrace.com/docs/platform/grail" },
    { url: "https://docs.dynatrace.com/docs/platform/openpipeline" },
    { url: "https://docs.dynatrace.com/docs/dynatrace-api" },
    { url: "https://developer.dynatrace.com/design/about-strato-design-system/" },
    { url: "https://developer.dynatrace.com/design/components/" },
  ];
}

/**
 * Descarga y almacena un documento individual.
 */
export async function scrapeDocument(url: string): Promise<DocMetadata | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Dynatrace-Docs-Workbench/1.0" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
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
      codeBlocks: parsed.codeBlocks,
      markdown: parsed.markdown,
      videos: parsed.media.filter((item) => item.role === "video"),
    });
    atomicWriteFileSync(localPath, mdContent);

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
      media: parsed.media,
      textPreview: parsed.markdown.slice(0, 1500),
      recordPath,
    });

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
      media: parsed.media,
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
  /** Filtra por sitio: "docs" (docs.dynatrace.com) o "developer" (developer.dynatrace.com). */
  source?: string;
  /** Solo re-descarga documentos cuyo formatVersion no es el vigente, sin consultar el sitemap. */
  staleFormatOnly?: boolean;
  /** Lista explícita de URLs a re-descargar (ignora sitemap, lastmod y filtros). */
  urls?: string[];
}

/**
 * Documentos del índice local con formatVersion distinto al vigente (o sin él).
 * Es la cola de migración de formato: se construye sin red, solo con index.json.
 */
export function listStaleFormatDocs(
  filter: Pick<ScrapeOptions, "domain" | "source"> = {},
): DocMetadata[] {
  const index = loadDocsIndex();
  let docs = Object.values(index.documents).filter((doc) => doc.formatVersion !== DOC_FORMAT_VERSION);

  if (filter.source) {
    const host = /^(dev|strato|appengine)/.test(filter.source.toLowerCase())
      ? "developer.dynatrace.com"
      : "docs.dynatrace.com";
    docs = docs.filter((doc) => doc.url.includes(host));
  }

  if (filter.domain) {
    const targetDomain = filter.domain.toLowerCase();
    docs = docs.filter(
      (doc) =>
        doc.domain.toLowerCase() === targetDomain ||
        classifyDomain(doc.url, doc.title) === targetDomain ||
        doc.url.toLowerCase().includes(targetDomain),
    );
  }

  return docs.sort((a, b) => a.url.localeCompare(b.url));
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

  let candidateUrls: Array<{ url: string; lastmod?: string }>;

  if (options.urls && options.urls.length > 0) {
    candidateUrls = options.urls.map((url) => ({ url }));
  } else if (options.staleFormatOnly) {
    candidateUrls = listStaleFormatDocs({ domain: options.domain, source: options.source }).map((doc) => ({
      url: doc.url,
      lastmod: doc.lastmod,
    }));
  } else {
    const allUrls = await fetchSitemapUrls();

    candidateUrls = allUrls;

    // Filtro por sitio web de origen
    if (options.source) {
      const s = options.source.toLowerCase();
      const host = /^(dev|strato|appengine)/.test(s)
        ? "developer.dynatrace.com"
        : "docs.dynatrace.com";
      candidateUrls = candidateUrls.filter((item) => item.url.includes(host));
    }

    if (options.domain) {
      const targetDomain = options.domain.toLowerCase();
      candidateUrls = allUrls.filter((item) => classifyDomain(item.url) === targetDomain);
      if (candidateUrls.length === 0) {
        candidateUrls = allUrls.filter((item) => item.url.toLowerCase().includes(targetDomain));
      }
    }
  }

  // Clasificar URLs entre las que realmente necesitan descargarse y las que ya están al día
  const toDownload: Array<{ url: string; lastmod?: string; isNew: boolean }> = [];
  let unchanged = 0;

  for (const item of candidateUrls) {
    const id = generateDocId(item.url);
    const existing = index.documents[id];

    // En migración de formato o lista explícita el documento se re-descarga
    // siempre, aunque lastmod no haya cambiado.
    if (!options.force && !options.staleFormatOnly && !(options.urls && options.urls.length > 0) && existing) {
      const fileExists = existing.localPath && existsSync(existing.localPath);
      // Si el archivo existe en disco y lastmod no ha cambiado (o no tiene lastmod), no re-descargar
      if (fileExists && (!item.lastmod || existing.lastmod === item.lastmod)) {
        unchanged++;
        continue;
      }
      toDownload.push({ ...item, isNew: false });
    } else {
      toDownload.push({ ...item, isNew: !existing });
    }
  }

  // Orden alfabético por URL: ingesta determinista y predecible (con --limit se
  // procesan siempre los primeros N en orden alfabético).
  toDownload.sort((a, b) => a.url.localeCompare(b.url));

  // Aplicar el límite a la cola de descarga efectiva (nuevos / pendientes).
  // En modo force con límite, dentro del orden alfabético se prioriza primero el
  // formato desactualizado para que lotes sucesivos migren todo el catálogo.
  let queue = toDownload;
  if (options.limit && toDownload.length > options.limit) {
    if (options.force) {
      const isStale = (item: { url: string }): boolean => {
        const existing = index.documents[generateDocId(item.url)];
        return !existing || existing.formatVersion !== DOC_FORMAT_VERSION;
      };
      const stale = toDownload.filter(isStale);
      const fresh = toDownload.filter((item) => !isStale(item));
      queue = [...stale, ...fresh].slice(0, options.limit);
    } else {
      queue = toDownload.slice(0, options.limit);
    }
  }

  console.log(
    `\n[Scraper] Estado del catálogo${
      options.urls && options.urls.length > 0
        ? " (lista explícita de URLs)"
        : options.staleFormatOnly
          ? ` (migración de formato ${DOC_FORMAT_VERSION})`
          : ""
    }:`,
  );
  console.log(`  - Total URLs candidatas:  ${candidateUrls.length}`);
  console.log(`  - Ya descargadas al día: ${unchanged}`);
  console.log(`  - Por descargar en cola: ${queue.length}${options.limit ? ` (límite: ${options.limit})` : ""}`);

  if (queue.length === 0) {
    console.log(
      options.staleFormatOnly
        ? `\n[Scraper] Todos los documentos ya están en formato ${DOC_FORMAT_VERSION}. Nada que migrar.`
        : `\n[Scraper] Toda la documentación ya se encuentra actualizada y al día.`,
    );
    return { totalProcessed: candidateUrls.length, created: 0, updated: 0, unchanged, failed: 0 };
  }

  console.log(`\n[Scraper] Iniciando descarga de ${queue.length} documentos (${DOWNLOAD_CONCURRENCY} hilos)...\n`);

  let created = 0;
  let updated = 0;
  let failed = 0;
  let completed = 0;
  let cursor = 0;

  const downloadNext = async (): Promise<void> => {
    while (cursor < queue.length) {
      const position = cursor++;
      const item = queue[position];
      const id = generateDocId(item.url);
      const existing = index.documents[id];

      console.log(`[${position + 1}/${queue.length}] Descargando: ${item.url}`);
      const metadata = await scrapeDocument(item.url);
      completed++;
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

        // Auto-guardado periódico cada 15 documentos para no perder progreso ante interrupciones
        if (completed % 15 === 0) {
          saveDocsIndex(index);
        }
      } else {
        failed++;
      }

      // Pequeño delay de cortesía entre peticiones de cada hilo
      await new Promise((r) => setTimeout(r, REQUEST_DELAY_MS));
    }
  };

  // Pool de descargas concurrente: el índice solo se muta en el event loop,
  // por lo que no hay condiciones de carrera entre hilos.
  await Promise.all(Array.from({ length: Math.min(DOWNLOAD_CONCURRENCY, queue.length) }, () => downloadNext()));

  // Guardado final del índice
  saveDocsIndex(index);

  console.log(`\n[Scraper] Ingestión finalizada con éxito.`);
  console.log(`  - Nuevos documentos: ${created}`);
  console.log(`  - Actualizados:       ${updated}`);
  console.log(`  - Ya al día:          ${unchanged}`);
  console.log(`  - Fallidos:           ${failed}`);
  if (options.staleFormatOnly) {
    console.log(`  - Pendientes de migrar a formato ${DOC_FORMAT_VERSION}: ${listStaleFormatDocs().length}`);
  }
  console.log(`  - Total en índice:    ${index.totalDocuments}\n`);

  return { totalProcessed: candidateUrls.length, created, updated, unchanged, failed };
}
