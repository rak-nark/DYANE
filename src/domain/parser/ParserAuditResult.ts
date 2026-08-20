export type ParserAuditResult = {
  url: string;
  success: boolean;

  titleFound: boolean;
  title: string;
  descriptionFound: boolean;
  description: string;

  sectionsCount: number;
  headingsCount: number;
  codeBlocksCount: number;
  linksCount: number;

  breadcrumbsFound: boolean;
  canonicalUrlFound: boolean;
  lastModifiedFound: boolean;

  contentLength: number;
  normalizedLength: number;

  warnings: string[];
  errors: string[];

  quality: ContentQuality;
};

export type ContentQuality = {
  score: number;
  contentLength: number;
  sections: number;
  codeBlocks: number;
  links: number;
  warnings: string[];
};

export function createParserAuditResult(url: string): ParserAuditResult {
  return {
    url,
    success: false,
    titleFound: false,
    title: "",
    descriptionFound: false,
    description: "",
    sectionsCount: 0,
    headingsCount: 0,
    codeBlocksCount: 0,
    linksCount: 0,
    breadcrumbsFound: false,
    canonicalUrlFound: false,
    lastModifiedFound: false,
    contentLength: 0,
    normalizedLength: 0,
    warnings: [],
    errors: [],
    quality: { score: 0, contentLength: 0, sections: 0, codeBlocks: 0, links: 0, warnings: [] },
  };
}

export function calculateQuality(result: ParserAuditResult): ContentQuality {
  const warnings: string[] = [];
  let score = 100;

  // Content length checks
  if (result.contentLength < 500) {
    score -= 30;
    warnings.push("content shorter than expected");
  } else if (result.contentLength < 2000) {
    score -= 10;
    warnings.push("content may be incomplete");
  }

  // Sections check
  if (result.sectionsCount === 0) {
    score -= 25;
    warnings.push("no sections detected");
  } else if (result.sectionsCount < 2) {
    score -= 10;
    warnings.push("very few sections");
  }

  // Code blocks check (for API/CLI pages)
  if (result.codeBlocksCount === 0 && result.contentLength > 5000) {
    score -= 5;
    warnings.push("long content without code examples");
  }

  // Links check
  if (result.linksCount === 0 && result.contentLength > 1000) {
    score -= 10;
    warnings.push("no internal links");
  }

  // Metadata checks
  if (!result.canonicalUrlFound) {
    score -= 5;
    warnings.push("canonical URL missing");
  }

  if (!result.lastModifiedFound) {
    score -= 3;
    warnings.push("last modified date missing");
  }

  if (!result.descriptionFound) {
    score -= 5;
    warnings.push("description missing");
  }

  if (!result.breadcrumbsFound) {
    score -= 2;
    warnings.push("breadcrumbs not found");
  }

  return {
    score: Math.max(0, score),
    contentLength: result.contentLength,
    sections: result.sectionsCount,
    codeBlocks: result.codeBlocksCount,
    links: result.linksCount,
    warnings,
  };
}
