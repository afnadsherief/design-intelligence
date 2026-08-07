# UX Laws & Principles

**Source:** Nielsen Norman Group, Laws of UX, Don Norman, Steve Krug
**Last Updated:** 2026-08-07
**Status:** Reference document

---

## Foundational Laws

### Fitts's Law
Time to reach a target = function of distance and size.
- Make primary actions large and close
- Minimum touch target: 48x48px

### Hick's Law
Decision time increases with number of choices.
- Reduce choices per screen
- Use progressive disclosure
- Default to most common option

### Miller's Law
Working memory holds 7plus or minus 2 items.
- Navigation items: max 7 primary
- Group related items into chunks

### Jakob's Law
Users spend time on other sites.
- Follow established patterns
- Don't reinounce patterns users know

---

## Application

These laws are encoded in:
- **Component contracts** (`system/contracts/component-contracts.ts`)
- **Evaluation criteria** (`system/evaluation/scoring.ts`)
- **ESLint rules** (`governance/eslint-rules/`)
