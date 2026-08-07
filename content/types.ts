export type ContentType = "product" | "blog" | "page";

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  slug: string;
  description?: string;
  body?: string;
  tags?: string[];
  featured?: boolean;
  publishedAt?: string;
  meta?: Record<string, unknown>;
}