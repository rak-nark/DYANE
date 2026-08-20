export interface NormalizedDocument {
  url: string;
  title: string;
  content: string;
  normalizedAt: string;
}

export interface DocumentNormalizer {
  normalize(raw: string): string;
  normalizeDocument(doc: { url: string; title: string; rawContent: string }): NormalizedDocument;
}
