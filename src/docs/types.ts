export type MediaRole = "icon" | "diagram" | "screenshot" | "video" | "other";

export interface DocMediaItem {
  url: string;
  alt: string;
  role: MediaRole;
}

export interface DocMetadata {
  id: string;
  url: string;
  title: string;
  description?: string;
  domain: string;
  category?: string;
  slug: string;
  formatVersion?: string;
  lastmod?: string;
  contentHash: string;
  headings: string[];
  codeBlocks: Array<{ language: string; code: string }>;
  links: Array<{ text: string; href: string }>;
  media: DocMediaItem[];
  crawledAt: string;
  localPath: string;
  recordPath?: string;
}

export interface DocsIndex {
  version: string;
  lastUpdated: string;
  totalDocuments: number;
  domains: Record<string, number>;
  documents: Record<string, DocMetadata>;
}

export interface DocRecord {
  formatVersion: string;
  id: string;
  url: string;
  title: string;
  domain: string;
  slug: string;
  contentHash: string;
  crawledAt: string;
  lastmod?: string;
  localPath: string;
  recordPath?: string;
  headings: string[];
  links: Array<{ text: string; href: string }>;
  codeBlocks: Array<{ language: string; code: string }>;
  media: DocMediaItem[];
  textPreview: string;
}

export interface SearchResult {
  doc: DocMetadata;
  score: number;
  matchedTerms: string[];
  snippet: string;
  contentSnippet: string;
}

export interface EvidenceItem {
  url: string;
  title: string;
  domain: string;
  heading?: string;
  excerpt: string;
  codeSnippet?: string;
  relevanceScore: number;
}

export interface SkillEvidenceReport {
  skillName: string;
  targetDomain: string;
  requestedCapability: string;
  classification: {
    skillType: string;
    domain: string;
    objective: string;
    applicableDocCategories: string[];
  };
  sufficiency: {
    isSufficient: boolean;
    confidence: number;
    reasoning: string;
    missingTopics?: string[];
  };
  sources: Array<{
    url: string;
    title: string;
    domain: string;
    contentHash: string;
    crawledAt: string;
    relevance: string;
    extractedConcepts: string[];
  }>;
  groundingChecks: Array<{
    claimOrInstruction: string;
    backedByUrl: string;
    evidenceExcerpt: string;
    status: "VERIFIED" | "INFERRED" | "UNVERIFIED";
  }>;
  createdAt: string;
  version: string;
}
