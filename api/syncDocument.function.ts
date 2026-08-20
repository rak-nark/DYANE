import { createHash } from "crypto";

type SyncDocumentInput = {
  url: string;
};

type SyncDocumentResult = {
  success: boolean;
  document?: {
    id: string;
    title: string;
    url: string;
    source: string;
    category: string;
    content: string;
    contentHash: string;
    currentVersion: number;
    createdAt: string;
    lastSyncedAt: string;
  };
  error?: string;
};

function normalizeContent(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#\d+;/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractTitle(html: string): string {
  const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
  if (ogTitle) return ogTitle[1];

  const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleTag) return titleTag[1].trim();

  return "Untitled";
}

function extractCategory(url: string): string {
  const parts = url.replace("https://docs.dynatrace.com/", "").split("/").filter(Boolean);
  if (parts.length > 1) return parts.slice(0, -1).join("/");
  return "documentation";
}

function generateId(url: string): string {
  return url
    .replace("https://docs.dynatrace.com/", "dynatrace-")
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export default async function (payload: unknown) {
  const input = payload as SyncDocumentInput;

  if (!input?.url) {
    return { success: false, error: "URL is required" } as SyncDocumentResult;
  }

  if (!input.url.startsWith("https://docs.dynatrace.com/")) {
    return { success: false, error: "URL must be from docs.dynatrace.com" } as SyncDocumentResult;
  }

  try {
    const response = await fetch(input.url);

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` } as SyncDocumentResult;
    }

    const html = await response.text();
    const title = extractTitle(html);
    const content = normalizeContent(html);
    const contentHash = createHash("sha256").update(content).digest("hex");
    const now = new Date().toISOString();

    return {
      success: true,
      document: {
        id: generateId(input.url),
        title,
        url: input.url,
        source: "dynatrace-docs",
        category: extractCategory(input.url),
        content,
        contentHash,
        currentVersion: 1,
        createdAt: now,
        lastSyncedAt: now,
      },
    } as SyncDocumentResult;
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    } as SyncDocumentResult;
  }
}
