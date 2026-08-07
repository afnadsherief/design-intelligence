# Design Principles

**Source:** Synthesized from Stripe, Linear, Vercel, Apple analysis
**Last Updated:** 2026-08-07
**Status:** Moved to tokens/ and systems/

---

## Summary

This file has been restructured into the following locations:

- **Token values:** `tokens/base.css`, `tokens/semantic.css`, `tokens/component.css`
- **System specifications:** `systems/design-principles.md` (Phase 1)
- **Contract enforcement:** `system/contracts/component-contracts.ts`
- **Evaluation criteria:** `system/evaluation/scoring.ts`

## Quick Reference

### Visual Hierarchy
1. Display (48-60px) > H1 (36px) > H2 (30px) > H3 (24px) > Body (16px) > Caption (12px)

### Spacing Grid
- Base unit: 4px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96

### Typography Scale
- Modular ratio: 1.25
- Font families: max 2 (sans + mono)

### Color
- Semantic tokens only
- WCAG 2.1 AA minimum (4.5:1 body, 3:1 large)

### Accessibility
- Keyboard navigable
- Screen reader compatible
- Focus indicators visible
- Reduced motion support
