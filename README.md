# Design Intelligence

**Source:** Institutional-grade design intelligence system
**Last Updated:** 2026-08-07
**Status:** Phase 3 — Complete

---

## Overview

Global, reusable, production-grade design intelligence system.
NOT bound to any project. Pure system architecture.

---

## Architecture

```
design-intelligence/
  knowledge/           — Design principles, laws, cognition
  tokens/              — 3-layer token system (base/semantic/component)
    build/             — Token engine + JSON themes
  system/
    primitives/        — Atomic components (Button, Input, Card)
    layouts/           — Layout primitives (Section, Container)
    composites/        — Real UI systems (Hero, Navbar, Pricing, Form)
    contracts/         — Component contract enforcement
    evaluation/        — Design scoring system
    intelligence/      — UX evaluator + hierarchy engine
    types/             — TypeScript type contracts
  patterns/            — Reusable UI patterns
  governance/
    eslint-rules/      — ESLint enforcement rules
    performance-audit.md — Performance monitoring
  agents/              — AI agent execution map
  tooling/             — Shared utilities + runtime validation
```

---

## Token Architecture

### Layer 1: Base (raw primitives)
- `--space-1: 4` (raw number)
- `--color-blue-500: 59 130 246` (RGB triplet)
- No semantic meaning

### Layer 2: Semantic (meaning)
- `--color-primary: rgb(var(--color-blue-600))`
- No component binding

### Layer 3: Component (usage)
- `--button-padding-x: var(--space-component-lg)`
- ONLY layer components reference

---

## Component Hierarchy

```
Primitives (atomic)
  ↓
Compositions (systems)
  ↓
Patterns (recipes)
  ↓
Pages (applications)
```

---

## Type Safety

All components use strict TypeScript contracts:
- Missing props → compile-time error
- Invalid variants → compile-time error
- Runtime validation via `validateTokenUsage()` + `enforceContract()`

## Enforcement

| Tool | Rule | Status |
|------|------|--------|
| ESLint | no-hardcoded-values | Active |
| ESLint | enforce-token-usage | Active |
| Contracts | token validation | Active |
| Evaluation | scoring 0-100 | Active |
| Intelligence | UX + hierarchy | Active |

---

## Token Engine

```
tokens/build/generator.ts  → Reads JSON → Outputs CSS
tokens/build/themes/light.json
tokens/build/themes/dark.json
```

## Intelligence Layer

```
system/intelligence/ux-evaluator.ts    → Scores UX (hierarchy, readability, a11y, consistency)
system/intelligence/hierarchy-engine.ts → Enforces 5-level hierarchy
```
