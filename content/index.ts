import { products } from "./products";
import { blogPosts } from "./blog";
import type { ContentItem, ContentType } from "./types";

const ALL_CONTENT: ContentItem[] = [...products, ...blogPosts];

export interface ContentFilter {
  type?: ContentType;
  tag?: string;
  featured?: boolean;
}

/** Local-first content loader. No external CMS — swap to an API later. */
export function getContent(filter?: ContentFilter): ContentItem[] {
  let items = ALL_CONTENT;

  if (filter?.type) {
    items = items.filter((item) => item.type === filter.type);
  }
  if (filter?.tag) {
    items = items.filter((item) => item.tags?.includes(filter.tag as string));
  }
  if (filter?.featured !== undefined) {
    items = items.filter((item) => item.featured === filter.featured);
  }

  return items;
}

export function getContentBySlug(slug: string): ContentItem | undefined {
  return ALL_CONTENT.find((item) => item.slug === slug);
}

export * from "./types";