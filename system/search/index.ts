import { getContent } from "@/content";
import type { ContentItem } from "@/content";

export interface SearchResult {
  item: ContentItem;
  score: number;
  matchedFields: string[];
}

function normalize(value: string): string[] {
  return value.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function fieldScore(queryTokens: string[], haystack: string | undefined): number {
  if (!haystack) return 0;
  const tokens = normalize(haystack);
  let score = 0;
  for (const qt of queryTokens) {
    if (tokens.includes(qt)) score += 10;
    else if (haystack.toLowerCase().includes(qt)) score += 3;
  }
  return score;
}

/**
 * Lightweight in-memory search over local content.
 * scores title > tags > description > body, then ranks descending.
 */
export function search(query: string, limit = 10): SearchResult[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const tokens = normalize(trimmed);
  if (tokens.length === 0) return [];

  const results: SearchResult[] = [];

  for (const item of getContent()) {
    const matchedFields: string[] = [];

    const title = fieldScore(tokens, item.title);
    if (title > 0) matchedFields.push("title");

    const description = fieldScore(tokens, item.description);
    if (description > 0) matchedFields.push("description");

    const body = fieldScore(tokens, item.body);
    if (body > 0) matchedFields.push("body");

    const tags = fieldScore(tokens, item.tags?.join(" "));
    if (tags > 0) matchedFields.push("tags");

    const total = title * 3 + description * 2 + body * 1 + tags * 1.5;

    if (total > 0) {
      results.push({ item, score: Math.round(total), matchedFields });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}