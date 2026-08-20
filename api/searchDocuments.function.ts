// ─── Types ───────────────────────────────────────────────────────────────────

type MatchedField = "title" | "description" | "heading" | "content" | "code" | "link";

type SearchResult = {
  documentId: string;
  version: number;
  title: string;
  url: string;
  source: string;
  category: string;
  score: number;
  snippet: string;
  matchedFields: MatchedField[];
  lastSyncedAt: string | null;
};

type SearchResponse = {
  results: SearchResult[];
  total: number;
  query: string;
  filters: { source?: string; category?: string };
  sources: string[];
  categories: string[];
};

type SearchInput = {
  query: string;
  source?: string;
  category?: string;
  limit?: number;
};

type DocumentData = {
  document: {
    id: string;
    title: string;
    description: string;
    url: string;
    source: string;
    category: string;
    currentVersion: number;
    lastSyncedAt: string | null;
  };
  versions: {
    version: number;
    headings: string[];
    codeBlocks: string[];
    links: { text: string; href: string }[];
    normalizedContent: string;
  }[];
};

const DYANE_TYPE = "dyane-document";
const memoryStore = new Map<string, DocumentData>();

// ─── Document Loading ────────────────────────────────────────────────────────

async function loadAllDocuments(): Promise<DocumentData[]> {
  try {
    const { documentsClient } = await import("@dynatrace-sdk/client-document");
    const result = await documentsClient.listDocuments({
      filter: `type == '${DYANE_TYPE}'`,
      pageSize: 1000,
    });

    const docs: DocumentData[] = [];
    for (const meta of result.documents) {
      try {
        const docResult = await documentsClient.getDocument({ id: meta.id });
        const content = docResult.content;
        let text: string;
        if (typeof content === "string") text = content;
        else if (content instanceof Blob) text = await content.text();
        else if (content instanceof ArrayBuffer) text = new TextDecoder().decode(content);
        else text = String(content);
        docs.push(JSON.parse(text) as DocumentData);
      } catch { /* skip */ }
    }

    if (docs.length > 0) return docs;
  } catch { /* fall through */ }

  return Array.from(memoryStore.values());
}

// ─── Search Engine ───────────────────────────────────────────────────────────

const FIELD_WEIGHTS: Record<MatchedField, number> = {
  title: 10,
  heading: 8,
  description: 6,
  content: 3,
  code: 4,
  link: 2,
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function matchField(field: MatchedField, queryTokens: string[], text: string): { score: number; snippet: string } | null {
  const lower = text.toLowerCase();
  let matchCount = 0;
  for (const qt of queryTokens) {
    if (lower.includes(qt)) matchCount++;
  }

  if (matchCount === 0) return null;

  const matchRatio = matchCount / queryTokens.length;
  const score = matchRatio * FIELD_WEIGHTS[field];

  // Snippet
  const firstMatch = queryTokens.find((qt) => lower.includes(qt)) || queryTokens[0];
  const idx = lower.indexOf(firstMatch);
  const radius = 80;
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + firstMatch.length + radius);
  let snippet = text.slice(start, end).trim();
  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";

  return { score, snippet };
}

function searchEngine(documents: DocumentData[], query: SearchInput): SearchResponse {
  const queryTokens = tokenize(query.query);
  if (queryTokens.length === 0) {
    return { results: [], total: 0, query: query.query, filters: {}, sources: [], categories: [] };
  }

  let filtered = documents;
  if (query.source) filtered = filtered.filter((d) => d.document.source === query.source);
  if (query.category) filtered = filtered.filter((d) => d.document.category === query.category);

  const sources = [...new Set(documents.map((d) => d.document.source))];
  const categories = [...new Set(documents.map((d) => d.document.category))];

  type ScoredResult = SearchResult & { totalScore: number };
  const scored: ScoredResult[] = [];

  for (const doc of filtered) {
    const latest = doc.versions[doc.versions.length - 1];
    if (!latest) continue;

    const matches: { field: MatchedField; score: number; snippet: string }[] = [];

    const titleM = matchField("title", queryTokens, doc.document.title);
    if (titleM) matches.push({ field: "title", ...titleM });

    if (doc.document.description) {
      const descM = matchField("description", queryTokens, doc.document.description);
      if (descM) matches.push({ field: "description", ...descM });
    }

    for (const h of latest.headings) {
      const hM = matchField("heading", queryTokens, h);
      if (hM) matches.push({ field: "heading", ...hM });
    }

    const contentM = matchField("content", queryTokens, latest.normalizedContent);
    if (contentM) matches.push({ field: "content", ...contentM });

    for (const block of latest.codeBlocks) {
      const cM = matchField("code", queryTokens, block);
      if (cM) matches.push({ field: "code", ...cM });
    }

    for (const link of latest.links) {
      const lM = matchField("link", queryTokens, link.text + " " + link.href);
      if (lM) matches.push({ field: "link", ...lM });
    }

    if (matches.length === 0) continue;

    const totalScore = matches.reduce((s, m) => s + m.score, 0);
    const matchedFields = [...new Set(matches.map((m) => m.field))];
    const best = matches.sort((a, b) => b.score - a.score)[0];

    scored.push({
      documentId: doc.document.id,
      version: latest.version,
      title: doc.document.title,
      url: doc.document.url,
      source: doc.document.source,
      category: doc.document.category,
      score: totalScore,
      snippet: best.snippet,
      matchedFields,
      lastSyncedAt: doc.document.lastSyncedAt,
      totalScore,
    });
  }

  scored.sort((a, b) => b.totalScore - a.totalScore);

  const limit = query.limit ?? 20;
  const results: SearchResult[] = scored.slice(0, limit).map(({ totalScore, ...rest }) => rest);

  return { results, total: scored.length, query: query.query, filters: { source: query.source, category: query.category }, sources, categories };
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default async function (payload: unknown) {
  const input = (payload as SearchInput) || { query: "" };

  if (!input.query || input.query.trim().length === 0) {
    return { results: [], total: 0, query: "", filters: {}, sources: [], categories: [] } as SearchResponse;
  }

  const documents = await loadAllDocuments();
  return searchEngine(documents, input);
}
