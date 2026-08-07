# System Mapping: Token -> Component -> Layout

**Source:** Design Intelligence Architecture
**Last Updated:** 2026-08-07
**Status:** Complete

---

## Layer Architecture

```
BASE (tokens/base.css)
  Raw primitives: --space-4, --color-blue-500
        |
        v
SEMANTIC (tokens/semantic.css)
  Meaning: --color-primary, --surface-background
        |
        v
COMPONENT (tokens/component.css)
  Component-specific: --button-padding-x, --card-radius
        |
        v
CONTRACTS (system/contracts/)
  Enforcement: allowedTokens, forbiddenPatterns
        |
        v
COMPONENTS (system/primitives/)
  Implementation: Button, Input, Card
        |
        v
PATTERNS (patterns/)
  Composition: Hero, Product Section, CTA
        |
        v
EVALUATION (system/evaluation/)
  Scoring: 0-100 per dimension
```

---

## Spacing Flow

```
BASE: --space-1 (4px) ... --space-24 (96px)
  |
  v
SEMANTIC: --space-component-md (--space-3)
  |            --space-layout-md (--space-12)
  v
COMPONENT: --button-padding-x (--space-component-lg)
  |          --card-padding (--space-component-xl)
  |          --section-padding-lg (--space-layout-lg)
  v
USAGE: padding: var(--button-padding-x) var(--button-padding-y);
```

---

## Color Flow

```
BASE: --color-blue-500 (#3b82f6)
  |
  v
SEMANTIC: --color-primary (--color-blue-600)
  |          --color-primary-hover (--color-blue-700)
  |          --surface-background (--color-white)
  v
COMPONENT: (no additional color tokens — uses semantic directly)
  |
  v
USAGE: background: var(--color-primary);
```

---

## Typography Flow

```
BASE: --font-size-3 (1rem), --font-weight-semibold (600)
  |
  v
SEMANTIC: --text-body (--font-size-3)
  |         --text-h1 (--font-size-8)
  |         --text-display (--font-size-10)
  v
COMPONENT: --button-font-size (--font-size-2)
  |
  v
USAGE: font-size: var(--button-font-size);
```

---

## Shadow Flow

```
BASE: --shadow-md (0 4px 6px...)
  |
  v
SEMANTIC: --elevation-md (--shadow-md)
  v
COMPONENT: --card-shadow (--elevation-sm)
  |          --card-shadow-hover (--elevation-md)
  v
USAGE: box-shadow: var(--card-shadow);
```

---

## Radius Flow

```
BASE: --radius-md (8px)
  |
  v
SEMANTIC: (no additional radius tokens)
  v
COMPONENT: --button-radius (--radius-md)
  |          --card-radius (--radius-lg)
  |          --input-radius (--radius-md)
  v
USAGE: border-radius: var(--button-radius);
```
