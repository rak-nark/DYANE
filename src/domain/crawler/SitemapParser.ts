export interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

export async function parseSitemap(sitemapUrl: string): Promise<SitemapEntry[]> {
  const response = await fetch(sitemapUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${response.status}`);
  }

  const xml = await response.text();
  return extractUrls(xml);
}

function extractUrls(xml: string): SitemapEntry[] {
  const entries: SitemapEntry[] = [];

  const urlRegex = /<url>([\s\S]*?)<\/url>/gi;
  let urlMatch;

  while ((urlMatch = urlRegex.exec(xml)) !== null) {
    const urlBlock = urlMatch[1];

    const locMatch = urlBlock.match(/<loc>([^<]+)<\/loc>/i);
    if (!locMatch) continue;

    const lastmodMatch = urlBlock.match(/<lastmod>([^<]+)<\/lastmod>/i);
    const changefreqMatch = urlBlock.match(/<changefreq>([^<]+)<\/changefreq>/i);
    const priorityMatch = urlBlock.match(/<priority>([^<]+)<\/priority>/i);

    entries.push({
      url: locMatch[1].trim(),
      lastmod: lastmodMatch?.[1]?.trim(),
      changefreq: changefreqMatch?.[1]?.trim(),
      priority: priorityMatch?.[1]?.trim(),
    });
  }

  return entries;
}

export function filterByPattern(
  entries: SitemapEntry[],
  patterns: string[]
): SitemapEntry[] {
  return entries.filter((entry) =>
    patterns.some((pattern) => matchPattern(entry.url, pattern))
  );
}

function matchPattern(url: string, pattern: string): boolean {
  const regex = pattern
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");
  return new RegExp(`^${regex}$`).test(url);
}
