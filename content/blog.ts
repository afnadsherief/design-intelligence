import type { ContentItem } from "./types";

export const blogPosts: ContentItem[] = [
  {
    id: "blog-001",
    type: "blog",
    title: "Why design tokens beat hardcoded values",
    slug: "design-tokens-over-hardcoded",
    description:
      "Keep your UI consistent by moving every color, space, and radius into tokens.",
    body: "Hardcoded hex values drift. Tokens give a single source of truth across products.",
    tags: ["design-system", "tokens"],
    featured: true,
    publishedAt: "2026-07-20",
  },
  {
    id: "blog-002",
    type: "blog",
    title: "A three-layer token architecture",
    slug: "three-layer-token-architecture",
    description:
      "Base → semantic → component. Each layer maps the one below it to more meaning.",
    body: "The base layer holds raw primitives. Semantic adds intent. Components bind usage.",
    tags: ["architecture", "tokens"],
    publishedAt: "2026-07-28",
  },
];