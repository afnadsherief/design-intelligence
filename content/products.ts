import type { ContentItem } from "./types";

export const products: ContentItem[] = [
  {
    id: "prod-001",
    type: "product",
    title: "Drop 01 — Mono Black Sneaker",
    slug: "mono-black-sneaker",
    description: "Limited first-drop canvas sneaker. 500 units worldwide.",
    body: "Drop 01 of the Mono series. Heavyweight organic canvas, rubber sole, tonal branding.",
    tags: ["sneaker", "drop", "limited"],
    featured: true,
    publishedAt: "2026-08-01",
    meta: { price: 189, currency: "USD" },
  },
  {
    id: "prod-002",
    type: "product",
    title: "Drop 02 — Archive Tee",
    slug: "archive-tee",
    description: "Boxy-fit garment-dyed tee from the archive capsule.",
    body: "Garment-dyed 220gsm cotton. Fade-safe construction. Available in 3 washes.",
    tags: ["apparel", "drop", "archive"],
    publishedAt: "2026-08-05",
    meta: { price: 89, currency: "USD" },
  },
  {
    id: "prod-003",
    type: "product",
    title: "Drop 03 — Utility Tote",
    slug: "utility-tote",
    description: "Water-resistant carry bag with a modular inner system.",
    body: "Water-resistant 600D exterior with internal modular organizers.",
    tags: ["accessory", "carry"],
    publishedAt: "2026-08-06",
    meta: { price: 149, currency: "USD" },
  },
];