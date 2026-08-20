import React, { useState, useCallback } from "react";

import { useAppFunction } from "@dynatrace-sdk/react-hooks";
import { Flex } from "@dynatrace/strato-components/layouts";
import { Heading, Text } from "@dynatrace/strato-components/typography";
import { Surface } from "@dynatrace/strato-components/layouts";
import { ProgressBar, Chip } from "@dynatrace/strato-components/content";
import { SearchInput } from "@dynatrace/strato-components/forms";
import { Button } from "@dynatrace/strato-components/buttons";

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

const fieldLabels: Record<MatchedField, string> = {
  title: "Title",
  description: "Description",
  heading: "Heading",
  content: "Content",
  code: "Code",
  link: "Link",
};

const fieldColors: Record<MatchedField, "success" | "primary" | "warning" | "critical" | "neutral"> = {
  title: "success",
  heading: "primary",
  description: "warning",
  content: "neutral",
  code: "critical",
  link: "primary",
};

const ResultCard = ({ result }: { result: SearchResult }) => {
  return (
    <Surface elevation="raised" padding={16}>
      <Flex flexDirection="column" gap={8}>
        <Flex justifyContent="space-between" alignItems="flex-start">
          <Flex flexDirection="column" gap={4}>
            <Heading level={4}>
              <a href={result.url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                {result.title}
              </a>
            </Heading>
            <Flex gap={8} alignItems="center">
              <Text textStyle="small">{result.category}</Text>
              <Text textStyle="small">·</Text>
              <Text textStyle="small">v{result.version}</Text>
            </Flex>
          </Flex>
        </Flex>

        <Surface elevation="flat" padding={8}>
          <Text textStyle="small" fontStyle="code">
            {result.snippet}
          </Text>
        </Surface>

        <Flex gap={6} flexWrap="wrap">
          {result.matchedFields.map((field) => (
            <Chip key={field} color={fieldColors[field]} variant="emphasized">
              {fieldLabels[field]}
            </Chip>
          ))}
        </Flex>

        <Flex justifyContent="space-between" alignItems="center">
          <Text textStyle="small">
            {result.lastSyncedAt
              ? `Synced ${new Date(result.lastSyncedAt).toLocaleDateString()}`
              : "Not synced"}
          </Text>
          <a href={result.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <Button variant="default" size="condensed">
              Open document
            </Button>
          </a>
        </Flex>
      </Flex>
    </Surface>
  );
};

export const Search = () => {
  const [query, setQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchParams, setSearchParams] = useState<{ query: string; source?: string; category?: string } | null>(null);

  const { data, isLoading } = useAppFunction<SearchResponse>({
    name: "searchDocuments",
    data: searchParams || { query: "__none__" },
  });

  const response = data;

  const handleSearch = useCallback(() => {
    if (query.trim().length === 0) return;
    setSearchParams({
      query: query.trim(),
      source: sourceFilter || undefined,
      category: categoryFilter || undefined,
    });
  }, [query, sourceFilter, categoryFilter]);

  return (
    <Flex flexDirection="column" padding={32} gap={24}>
      <Heading level={2}>Search Dynatrace Knowledge</Heading>

      <Surface elevation="raised" padding={16}>
        <Flex flexDirection="column" gap={12}>
          <Flex gap={8} alignItems="center">
            <SearchInput
              placeholder="Search documentation..."
              value={query}
              onChange={(value) => setQuery(value)}
            />
            <Button onClick={handleSearch} variant="emphasized">
              Search
            </Button>
          </Flex>

          <Flex gap={16} alignItems="center">
            <Text textStyle="small">Source:</Text>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid #ccc" }}
            >
              <option value="">All sources</option>
              <option value="dynatrace-docs">Dynatrace Docs</option>
            </select>

            <Text textStyle="small">Category:</Text>
            <SearchInput
              placeholder="Filter..."
              value={categoryFilter}
              onChange={(value) => setCategoryFilter(value)}
            />
          </Flex>
        </Flex>
      </Surface>

      {isLoading && (
        <Flex flexDirection="column" gap={8}>
          <ProgressBar />
          <Text textStyle="small">Searching...</Text>
        </Flex>
      )}

      {response && !isLoading && (
        <Flex flexDirection="column" gap={16}>
          <Text textStyle="small-emphasized">
            {response.total} result{response.total !== 1 ? "s" : ""} for &ldquo;{response.query}&rdquo;
          </Text>

          {response.results.length === 0 ? (
            <Surface elevation="flat" padding={32}>
              <Flex flexDirection="column" gap={8} alignItems="center">
                <Heading level={3}>No results found</Heading>
                <Text textStyle="small">
                  Try different keywords or remove filters.
                </Text>
              </Flex>
            </Surface>
          ) : (
            <Flex flexDirection="column" gap={12}>
              {response.results.map((result) => (
                <ResultCard key={result.documentId} result={result} />
              ))}
            </Flex>
          )}
        </Flex>
      )}

      {!searchParams && !isLoading && (
        <Surface elevation="flat" padding={32}>
          <Flex flexDirection="column" gap={8} alignItems="center">
            <Text textStyle="small">
              Enter a search query to find documentation.
            </Text>
          </Flex>
        </Surface>
      )}
    </Flex>
  );
};
