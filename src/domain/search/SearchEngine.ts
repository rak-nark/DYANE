import { SearchQuery, SearchResult, SearchResponse, MatchedField } from "./SearchQuery";

interface DocumentData {
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
}

interface ScoredMatch {
  field: MatchedField;
  score: number;
  text: string;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function calculateFieldScore(
  field: MatchedField,
  queryTokens: string[],
  fieldText: string
): ScoredMatch | null {
  const lower = fieldText.toLowerCase();
  const fieldTokens = tokenize(fieldText);

  let matchCount = 0;
  for (const qt of queryTokens) {
    if (lower.includes(qt)) matchCount++;
  }

  if (matchCount === 0) return null;

  const matchRatio = matchCount / queryTokens.length;

  const weights: Record<MatchedField, number> = {
    title: 10,
    heading: 8,
    description: 6,
    content: 3,
    code: 4,
    link: 2,
  };

  const score = matchRatio * weights[field];

  // Extract snippet around first match
  const firstQueryToken = queryTokens.find((qt) => lower.includes(qt)) || queryTokens[0];
  const matchIndex = lower.indexOf(firstQueryToken);
  const snippetRadius = 80;
  const start = Math.max(0, matchIndex - snippetRadius);
  const end = Math.min(fieldText.length, matchIndex + firstQueryToken.length + snippetRadius);
  let snippet = fieldText.slice(start, end).trim();
  if (start > 0) snippet = "..." + snippet;
  if (end < fieldText.length) snippet = snippet + "...";

  return { field, score, text: snippet };
}

function extractSnippet(
  queryTokens: string[],
  content: string
): string {
  const lower = content.toLowerCase();

  for (const qt of queryTokens) {
    const idx = lower.indexOf(qt);
    if (idx !== -1) {
      const radius = 100;
      const start = Math.max(0, idx - radius);
      const end = Math.min(content.length, idx + qt.length + radius);
      let snippet = content.slice(start, end).trim();
      if (start > 0) snippet = "..." + snippet;
      if (end < content.length) snippet = snippet + "...";
      return snippet;
    }
  }

  // Fallback: first 150 chars
  return content.slice(0, 150).trim() + (content.length > 150 ? "..." : "");
}

export function searchDocuments(
  documents: DocumentData[],
  query: SearchQuery
): SearchResponse {
  const queryTokens = tokenize(query.text);
  if (queryTokens.length === 0) {
    return { results: [], total: 0, query: query.text, filters: { source: query.source, category: query.category } };
  }

  let filtered = documents;

  if (query.source) {
    filtered = filtered.filter((d) => d.document.source === query.source);
  }

  if (query.category) {
    filtered = filtered.filter((d) => d.document.category === query.category);
  }

  const results: SearchResult[] = [];

  for (const doc of filtered) {
    const latestVersion = doc.versions[doc.versions.length - 1];
    if (!latestVersion) continue;

    const allMatches: ScoredMatch[] = [];

    // Search title
    const titleMatch = calculateFieldScore("title", queryTokens, doc.document.title);
    if (titleMatch) allMatches.push(titleMatch);

    // Search description
    if (doc.document.description) {
      const descMatch = calculateFieldScore("description", queryTokens, doc.document.description);
      if (descMatch) allMatches.push(descMatch);
    }

    // Search headings
    for (const heading of latestVersion.headings) {
      const hMatch = calculateFieldScore("heading", queryTokens, heading);
      if (hMatch) allMatches.push(hMatch);
    }

    // Search content
    const contentMatch = calculateFieldScore("content", queryTokens, latestVersion.normalizedContent);
    if (contentMatch) allMatches.push(contentMatch);

    // Search code blocks
    for (const block of latestVersion.codeBlocks) {
      const cMatch = calculateFieldScore("code", queryTokens, block);
      if (cMatch) allMatches.push(cMatch);
    }

    // Search links
    for (const link of latestVersion.links) {
      const lMatch = calculateFieldScore("link", queryTokens, link.text + " " + link.href);
      if (lMatch) allMatches.push(lMatch);
    }

    if (allMatches.length === 0) continue;

    // Total score
    const totalScore = allMatches.reduce((sum, m) => sum + m.score, 0);

    // Unique matched fields
    const matchedFields = [...new Set(allMatches.map((m) => m.field))];

    // Best snippet (from highest scoring match)
    const bestMatch = allMatches.sort((a, b) => b.score - a.score)[0];
    let snippet = bestMatch.text;

    // If snippet is too short, try content
    if (snippet.length < 50 && latestVersion.normalizedContent) {
      snippet = extractSnippet(queryTokens, latestVersion.normalizedContent);
    }

    results.push({
      documentId: doc.document.id,
      version: latestVersion.version,
      title: doc.document.title,
      url: doc.document.url,
      source: doc.document.source,
      category: doc.document.category,
      score: totalScore,
      snippet,
      matchedFields,
      lastSyncedAt: doc.document.lastSyncedAt,
    });
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  const limit = query.limit ?? 20;
  const limited = results.slice(0, limit);

  return {
    results: limited,
    total: results.length,
    query: query.text,
    filters: { source: query.source, category: query.category },
  };
}
