# Pattern to Component Mapping

**Source:** Design Intelligence Pattern Library
**Last Updated:** 2026-08-07
**Status:** Complete

---

## Rule
EVERY pattern must resolve to system components.
No pattern exists without a component implementation path.

---

## Mappings

### Hero Systems
| Pattern | Components | Tokens |
|---------|-----------|--------|
| Conversion Hero | Section + Container + Button | --section-padding-lg, --button-padding-x |
| Product Hero | Section + Container + Typography | --section-padding-xl, --text-display |
| Social Proof Hero | Section + Container + Card | --section-padding-md, --card-padding |
| Minimal Hero | Section + Container + Button | --section-padding-xl |

### Product Sections
| Pattern | Components | Tokens |
|---------|-----------|--------|
| Feature Grid | Section + Container + Card (×3) | --grid-gap-md, --card-padding |
| Feature Row | Section + Card + Typography | --section-padding-lg |
| Social Proof | Section + Card | --card-padding |
| Pricing | Section + Container + Card (×3) | --grid-gap-md |
| FAQ | Section + Container + Input | --section-padding-md |
| Stats | Section + Container | --section-padding-md |

### CTA Structures
| Pattern | Components | Tokens |
|---------|-----------|--------|
| Primary CTA | Button (variant=default) | --button-padding-x |
| Secondary CTA | Button (variant=outline) | --button-padding-x |
| Ghost CTA | Button (variant=ghost) | --space-component-sm |
| CTA Group | Button + Spacing | --space-component-md (gap) |

### Navigation Patterns
| Pattern | Components | Tokens |
|---------|-----------|--------|
| Top Nav | Container + Button | --container-padding |
| Sidebar Nav | Card + Spacing | --space-component-md |
| Tab Nav | Button (variant group) | --button-padding-x |
| Breadcrumbs | Typography + Spacing | --text-body-sm |
| Mobile Nav | Button + Container | --container-padding |

### Grid Systems
| Pattern | Components | Tokens |
|---------|-----------|--------|
| 3-Column Grid | Container + Card (×3) | --grid-gap-md |
| 2-Column Grid | Container + Card (×2) | --grid-gap-md |
| Sidebar Layout | Container + Card | --grid-gap-lg |
| Dashboard Grid | Container + Card (×4-6) | --grid-gap-md |

---

## Resolution Flow

```
Pattern (patterns/[name].md)
  → Maps to Components (system/primitives/[name].tsx)
  → Uses Tokens (tokens/component.css)
  → Follows Contracts (system/contracts/component-contracts.ts)
  → Validated by ESLint (governance/eslint-rules/)
  → Scored by Evaluation (system/evaluation/scoring.ts)
```
