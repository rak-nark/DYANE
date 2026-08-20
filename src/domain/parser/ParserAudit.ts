import { ParserAuditResult, createParserAuditResult, calculateQuality } from "./ParserAuditResult";

type ParseResult = {
  title: string;
  description: string;
  canonicalUrl?: string;
  breadcrumbs: string[];
  lastModified?: string;
  headings: string[];
  sections: { heading: string; level: number; content: string }[];
  codeBlocks: string[];
  links: { text: string; href: string }[];
  content: string;
  normalizedContent: string;
};

function decodeEntities(t: string) { return t.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'"); }
function stripTags(h: string) { return decodeEntities(h.replace(/<[^>]+>/g, "")); }
function normalizeContent(c: string) { return c.replace(/[ \t]+/g, " ").replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").map((l) => l.trim()).join("\n").replace(/\n{3,}/g, "\n\n").trim(); }

function extractMain(h: string) {
  const m = h.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (m) return m[1];
  const a = h.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  if (a) return a[1];
  return h;
}

function stripNoise(h: string) {
  return h.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
}

function extractTitle(h: string) {
  const o = h.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
  if (o) return decodeEntities(o[1]);
  const t = h.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (t) return decodeEntities(t[1].trim());
  const h1 = h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return stripTags(h1[1]).trim();
  return "Untitled";
}

function extractDescription(h: string) {
  const o = h.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
  if (o) return decodeEntities(o[1]);
  const m = h.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  if (m) return decodeEntities(m[1]);
  return "";
}

function extractCanonicalUrl(h: string): string | undefined {
  const c = h.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  return c ? c[1] : undefined;
}

function extractBreadcrumbs(h: string): string[] {
  const breadcrumbs: string[] = [];
  const navMatch = h.match(/<nav[^>]*class="[^"]*breadcrumb[^"]*"[^>]*>([\s\S]*?)<\/nav>/i);
  if (navMatch) {
    const links = navMatch[1].match(/<a[^>]*>([^<]+)<\/a>/gi);
    if (links) {
      for (const link of links) {
        const text = stripTags(link).trim();
        if (text) breadcrumbs.push(text);
      }
    }
  }
  return breadcrumbs;
}

function extractLastModified(h: string): string | undefined {
  const meta = h.match(/<meta\s+property="article:modified_time"\s+content="([^"]+)"/i);
  if (meta) return meta[1];
  const date = h.match(/<time[^>]*datetime="([^"]+)"/i);
  if (date) return date[1];
  return undefined;
}

function extractHeadings(h: string) {
  const r: string[] = [];
  const rx = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let m;
  while ((m = rx.exec(h)) !== null) r.push(stripTags(m[2]).trim());
  return r;
}

function extractSections(html: string): { heading: string; level: number; content: string }[] {
  const sections: { heading: string; level: number; content: string }[] = [];
  const regex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>([\s\S]*?)(?=<h[1-6]|$)/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1]);
    const heading = stripTags(match[2]).trim();
    const content = stripTags(match[3]).trim().slice(0, 2000);
    if (heading) sections.push({ heading, level, content });
  }
  return sections;
}

function extractCodeBlocks(h: string) {
  const r: string[] = [];
  const rx = /<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi;
  let m;
  while ((m = rx.exec(h)) !== null) r.push(stripTags(m[1]).trim());
  return r;
}

function extractLinks(h: string) {
  const r: { text: string; href: string }[] = [];
  const rx = /<a\s+[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = rx.exec(h)) !== null) {
    const t = stripTags(m[2]).trim();
    if (t && m[1] && !m[1].startsWith("#") && !m[1].startsWith("javascript:")) r.push({ text: t, href: m[1] });
  }
  return r;
}

// ─── ParserAudit ─────────────────────────────────────────────────────────────

export function parseHtml(html: string): ParseResult {
  const title = extractTitle(html);
  const description = extractDescription(html);
  const canonicalUrl = extractCanonicalUrl(html);
  const breadcrumbs = extractBreadcrumbs(html);
  const lastModified = extractLastModified(html);
  const headings = extractHeadings(html);
  const sections = extractSections(html);
  const codeBlocks = extractCodeBlocks(html);
  const links = extractLinks(html);

  const mainHtml = stripNoise(extractMain(html));
  const content = stripTags(mainHtml);
  const normalizedContent = normalizeContent(content);

  return { title, description, canonicalUrl, breadcrumbs, lastModified, headings, sections, codeBlocks, links, content, normalizedContent };
}

export async function auditUrl(url: string): Promise<ParserAuditResult> {
  const result = createParserAuditResult(url);

  try {
    const res = await fetch(url);
    if (!res.ok) {
      result.errors.push(`HTTP ${res.status}`);
      return result;
    }

    const html = await res.text();
    const parsed = parseHtml(html);

    result.titleFound = parsed.title !== "Untitled" && parsed.title.length > 0;
    result.title = parsed.title;
    result.descriptionFound = parsed.description.length > 0;
    result.description = parsed.description;
    result.sectionsCount = parsed.sections.length;
    result.headingsCount = parsed.headings.length;
    result.codeBlocksCount = parsed.codeBlocks.length;
    result.linksCount = parsed.links.length;
    result.breadcrumbsFound = parsed.breadcrumbs.length > 0;
    result.canonicalUrlFound = parsed.canonicalUrl !== undefined;
    result.lastModifiedFound = parsed.lastModified !== undefined;
    result.contentLength = parsed.content.length;
    result.normalizedLength = parsed.normalizedContent.length;

    result.quality = calculateQuality(result);
    result.success = true;
  } catch (err) {
    result.errors.push(err instanceof Error ? err.message : "Unknown error");
  }

  return result;
}

export async function auditUrls(urls: string[]): Promise<ParserAuditResult[]> {
  const results: ParserAuditResult[] = [];
  for (const url of urls) {
    results.push(await auditUrl(url));
  }
  return results;
}
