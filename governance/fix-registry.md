# Fix Registry

**Source:** Design Intelligence Governance
**Last Updated:** 2026-08-07
**Status:** Complete

---

## F-001 — Component Contract System
- **Category:** Architecture
- **Status:** COMPLETE
- **Location:** `system/contracts/component-contracts.ts`
- **Description:** Enforces token-only usage in components via contracts

## F-002 — Pattern → Component Mapping
- **Category:** Architecture
- **Status:** COMPLETE
- **Location:** `patterns/mapping.md`
- **Description:** Every pattern resolves to system components

## F-003 — Design Evaluation System
- **Category:** Quality
- **Status:** COMPLETE
- **Location:** `system/evaluation/scoring.ts`
- **Description:** Scores components 0-100 across 4 dimensions

## F-004 — CVA Standardization
- **Category:** Architecture
- **Status:** COMPLETE
- **Description:** All components use class-variance-authority exclusively

## F-005 — ESLint Governance Layer
- **Category:** Enforcement
- **Status:** COMPLETE
- **Location:** `governance/eslint-rules/`
- **Description:** Blocks hardcoded values, enforces token usage

## F-006 — Agent System
- **Category:** Automation
- **Status:** COMPLETE
- **Location:** `agents/execution-map.md`
- **Description:** 5 agents with triggers, execution flow, and outputs

## F-007 — Contract Enforcement
- **Category:** Enforcement
- **Status:** COMPLETE
- **Location:** `system/contracts/component-contracts.ts`
- **Description:** Runtime and build-time contract validation

## F-008 — Performance Control
- **Category:** Performance
- **Status:** COMPLETE
- **Location:** `governance/performance-audit.md`
- **Description:** Performance monitoring with render time, bundle size, reusability

## F-009 — Token Layer Restructure
- **Category:** Architecture
- **Status:** COMPLETE
- **Location:** `tokens/` (3 layers)
- **Description:** Separated raw primitives, semantic mappings, and component-specific tokens

## F-010 — System Mapping
- **Category:** Documentation
- **Status:** COMPLETE
- **Location:** `knowledge/system-mapping.md`
- **Description:** Complete system mapping with flow diagrams

## F-011 — Token Engine Completeness
- **Category:** Architecture
- **Status:** COMPLETE
- **Location:** `tokens/build/generator.ts`
- **Description:** Auto-layer mapping, theme switching, circular dependency validation

## F-012 — Strict Type System
- **Category:** Architecture
- **Status:** COMPLETE
- **Location:** `system/types/component-types.ts`
- **Description:** Compile-time prop and variant enforcement

## F-013 — Composite Purity Enforcement
- **Category:** Enforcement
- **Status:** COMPLETE
- **Location:** `tooling/utils.ts` → `validateCompositePurity()`
- **Description:** Validates composites use ONLY primitives and tokens

## F-014 — UX Intelligence Hardening
- **Category:** Intelligence
- **Status:** COMPLETE
- **Location:** `system/intelligence/ux-evaluator.ts`
- **Description:** Hierarchy, readability, accessibility, layout balance scoring

## F-015 — Token Usage Detector
- **Category:** Enforcement
- **Status:** COMPLETE
- **Location:** `tooling/utils.ts` → `validateTokenUsage()`
- **Description:** Detects raw Tailwind, hardcoded numbers, missing var(--token), inline styles

## F-016 — Contract Auto-Enforcement
- **Category:** Enforcement
- **Status:** COMPLETE
- **Location:** `tooling/utils.ts` → `enforceContract()`
- **Description:** Validates requiredProps, blocks forbidden patterns, enforces tokens

## F-017 — Performance Intelligence
- **Category:** Performance
- **Status:** COMPLETE
- **Location:** `governance/performance-audit.md`
- **Description:** Render time, bundle impact, reusability score, token efficiency ratio

## F-018 — Agent Execution Logic
- **Category:** Automation
- **Status:** COMPLETE
- **Location:** `agents/execution-map.md`
- **Description:** Each agent has trigger conditions, execution flow, and output expectations
