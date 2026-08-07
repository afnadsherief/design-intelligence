# Visual Hierarchy

**Source:** Synthesized from Stripe, Linear, Vercel, Apple analysis
**Last Updated:** 2026-08-07
**Status:** Reference document

---

## 5-Level Hierarchy

1. **Display** (48-60px, 700 weight) — Hero/primary
2. **H1** (36px, 700 weight) — Page title
3. **H2** (30px, 600 weight) — Section headers
4. **H3** (24px, 600 weight) — Sub-headers
5. **Body** (16px, 400 weight) — Content
6. **Caption** (12px, 400 weight) — Meta/supporting

## Reading Patterns
- **F-Pattern:** Content-heavy pages
- **Z-Pattern:** Landing pages
- **Layer-Cake:** Scanning headings

## Attention Direction
- Explicit: Arrows, gaze, pointing, highlight
- Implicit: White space, motion, contrast

## Application

Hierarchy is encoded in:
- **Typography tokens** (`tokens/base.css`)
- **Semantic tokens** (`tokens/semantic.css`)
- **Evaluation scoring** (`system/evaluation/scoring.ts`)
