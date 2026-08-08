# Design Intelligence

**Layer:** L3 Runtime — **ACTIVE**
**Last Updated:** 2026-08-08
**Status:** Phase 3 — Complete

---

> **Runtime Authority Statement**
>
> This repository is the **ACTIVE runtime (L3 execution layer)** as defined in
> [ADR-0002](https://github.com/afnadsherief/AI-Playbook/blob/main/adr/0002-runtime-authority.md).
>
> - It is the sole active execution target in the ecosystem. Products execute through it.
> - `AI-Runtime` is a future abstraction layer and is **not active**.
> - `AI-Orchestration` is controller-only and never executes.
> - It follows **AI-Playbook** as the governing authority (ADR-0001) and defines no standards or layer models of its own.

---

## Overview

This repository is the **A-OS execution runtime**. It runs approved work: multi-agent
orchestration, deterministic code transformation, evolution passes and multi-company
isolation.

It **also provides** a design intelligence capability — tokens, primitives, patterns,
contracts and evaluation. Per ADR-0002 §6 this is **not a second identity**: the design
system is a capability *provided by* the runtime, not a separate product. Where this
repository's role is in question, **it is the runtime**.

Global and reusable; not bound to any single project.

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
