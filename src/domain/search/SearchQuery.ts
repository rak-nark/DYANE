export interface SearchQuery {
  text: string;
  source?: string;
  category?: string;
  limit?: number;
}

export type MatchedField =
  | "title"
  | "description"
  | "heading"
  | "content"
  | "code"
  | "link";

export interface SearchResult {
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
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  filters: {
    source?: string;
    category?: string;
  };
}
