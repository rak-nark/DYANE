import { existsSync, readFileSync } from "node:fs";
import { loadDocsIndex } from "./scraper.js";
import type { DocMetadata, SearchResult, EvidenceItem } from "./types.js";

export interface SearchOptions {
  domain?: string;
  limit?: number;
  minScore?: number;
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúüñ_-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

export function searchDocs(query: string, options: SearchOptions = {}): SearchResult[] {
  const index = loadDocsIndex();
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const limit = options.limit ?? 10;
  const targetDomain = options.domain?.toLowerCase();
  const results: SearchResult[] = [];

  for (const doc of Object.values(index.documents)) {
    if (targetDomain && doc.domain.toLowerCase() !== targetDomain) {
      continue;
    }

    let score = 0;
    const matchedTerms = new Set<string>();

    const lowerTitle = doc.title.toLowerCase();
    const lowerSlug = doc.slug.toLowerCase();

    // 1. Coincidencia en título
    for (const token of tokens) {
      if (lowerTitle.includes(token)) {
        score += 8;
        matchedTerms.add(token);
      }
      if (lowerSlug.includes(token)) {
        score += 4;
        matchedTerms.add(token);
      }
    }

    // 2. Coincidencia en encabezados
    for (const h of doc.headings) {
      const lowerH = h.toLowerCase();
      for (const token of tokens) {
        if (lowerH.includes(token)) {
          score += 3;
          matchedTerms.add(token);
        }
      }
    }

    // 3. Coincidencia en bloques de código
    for (const block of doc.codeBlocks) {
      const lowerCode = block.code.toLowerCase();
      for (const token of tokens) {
        if (lowerCode.includes(token)) {
          score += 2;
          matchedTerms.add(token);
        }
      }
    }

    // 4. Coincidencia en contenido completo si existe el archivo local
    let fileContent = "";
    if (existsSync(doc.localPath)) {
      try {
        fileContent = readFileSync(doc.localPath, "utf8");
        const lowerBody = fileContent.toLowerCase();
        for (const token of tokens) {
          const occurrences = (lowerBody.match(new RegExp(`\\b${token}`, "g")) ?? []).length;
          if (occurrences > 0) {
            score += Math.min(occurrences, 10);
            matchedTerms.add(token);
          }
        }
      } catch {
        // Ignorar fallo de lectura local
      }
    }

    if (score > (options.minScore ?? 2)) {
      const snippet = extractSnippet(fileContent || doc.title, Array.from(matchedTerms));
      results.push({
        doc,
        score,
        matchedTerms: Array.from(matchedTerms),
        snippet,
        contentSnippet: snippet,
      });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

function extractSnippet(text: string, terms: string[]): string {
  if (!text || terms.length === 0) return text.slice(0, 200);

  const clean = text.replace(/^---[\s\S]*?---/, "").trim();
  const lower = clean.toLowerCase();

  let firstIndex = -1;
  for (const t of terms) {
    const idx = lower.indexOf(t);
    if (idx !== -1 && (firstIndex === -1 || idx < firstIndex)) {
      firstIndex = idx;
    }
  }

  if (firstIndex === -1) return clean.slice(0, 250);

  const start = Math.max(0, firstIndex - 60);
  const end = Math.min(clean.length, firstIndex + 200);
  let snippet = clean.slice(start, end).replace(/\s+/g, " ").trim();

  if (start > 0) snippet = `... ${snippet}`;
  if (end < clean.length) snippet = `${snippet} ...`;

  return snippet;
}

/**
 * Extrae evidencia técnica oficial estructurada para alimentar la generación de skills.
 */
export function extractEvidence(query: string, domain?: string, limit = 5): EvidenceItem[] {
  const searchResults = searchDocs(query, { domain, limit });
  const evidence: EvidenceItem[] = [];

  for (const res of searchResults) {
    let bestCode: string | undefined;
    if (res.doc.codeBlocks && res.doc.codeBlocks.length > 0) {
      bestCode = res.doc.codeBlocks[0].code.slice(0, 350);
    }

    evidence.push({
      url: res.doc.url,
      title: res.doc.title,
      domain: res.doc.domain,
      heading: res.doc.headings[0],
      excerpt: res.snippet,
      codeSnippet: bestCode,
      relevanceScore: res.score,
    });
  }

  return evidence;
}
