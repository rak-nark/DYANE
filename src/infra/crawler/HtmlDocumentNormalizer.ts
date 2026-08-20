import type {
  DocumentNormalizer,
  NormalizedDocument,
} from "../../domain/crawler/DocumentNormalizer";

export class HtmlDocumentNormalizer implements DocumentNormalizer {
  normalize(raw: string): string {
    return raw
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#\d+;/g, "")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  normalizeDocument(doc: {
    url: string;
    title: string;
    rawContent: string;
  }): NormalizedDocument {
    return {
      url: doc.url,
      title: doc.title,
      content: this.normalize(doc.rawContent),
      normalizedAt: new Date().toISOString(),
    };
  }
}
