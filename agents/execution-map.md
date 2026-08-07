# Agent Execution Map

**Source:** Design Intelligence Agent System
**Last Updated:** 2026-08-07
**Status:** Complete

---

## Agent Registry

| Agent | Responsibility | Trigger | Input | Output |
|-------|---------------|---------|-------|--------|
| Token Agent | Enforces token usage | Token file change | tokens/*.css | Validation report |
| Component Agent | Validates structure | New component | Contract + tokens | Component code |
| Audit Agent | Runs scoring system | PR / lint | Source code | Violation report + score |
| Performance Agent | Tracks render + bundle | Build | Bundle stats | Performance score |
| UX Agent | Applies UX laws | Component render | Rendered HTML | UX score |

---

## Agent Workflows

### Token Agent
```
TRIGGER: Token file change (base.css, semantic.css, component.css)
INPUT:   Token file diff
PROCESS:
  1. Verify 3-layer architecture (base → semantic → component)
  2. Check no hardcoded values in base.css
  3. Check no component binding in semantic.css
  4. Verify all component tokens reference semantic tokens
  5. Validate no circular dependencies
OUTPUT:  Token validation report with violations
EXPECTED: 0 violations, all references resolved
```

### Component Agent
```
TRIGGER: New component creation or modification
INPUT:   Component contract + required tokens
PROCESS:
  1. Read contract for requiredProps and forbidden patterns
  2. Generate CVA variants from contract
  3. Implement with 100% token usage (rgb(var()) pattern)
  4. Add accessibility attributes (ARIA, roles, labels)
  5. Run validateCompositePurity() check
OUTPUT:  Component code (.tsx) + test file
EXPECTED: Passes all contract checks, 0 hardcoded values
```

### Audit Agent
```
TRIGGER: Pull request or lint command
INPUT:   All source files (.tsx, .css)
PROCESS:
  1. Run no-hardcoded-values rule
  2. Run enforce-token-usage rule
  3. Check contract compliance for each component
  4. Run scoring system (tokenUsage, accessibility, performance, consistency)
  5. Generate violation report
OUTPUT:  Violation report + score (0-100)
EXPECTED: Score >= 80, 0 critical violations
```

### Performance Agent
```
TRIGGER: Build complete
INPUT:   Bundle stats, CSS output
PROCESS:
  1. Measure CSS output size per component
  2. Count unique class names (deduplication)
  3. Monitor variant count (explosion check)
  4. Calculate token efficiency ratio
  5. Compare against performance budget
OUTPUT:  Performance score (0-100) + optimization suggestions
EXPECTED: Score >= 80, bundle < 50KB
```

### UX Agent
```
TRIGGER: Component rendered
INPUT:   Rendered HTML + interaction specs
PROCESS:
  1. Check contrast ratios (WCAG 2.1 AA)
  2. Verify keyboard navigation
  3. Validate ARIA attributes
  4. Check focus management
  5. Validate visual hierarchy (5-level system)
  6. Evaluate layout balance
OUTPUT:  UX score (0-100) + accessibility issues
EXPECTED: Score >= 80, 0 critical accessibility issues
```

---

## Integration Points

| Tool | Agent | Hook | Frequency |
|------|-------|------|-----------|
| ESLint | Audit Agent | pre-commit | Every commit |
| Build System | Performance Agent | post-build | Every build |
| GitHub Actions | Token Agent | push | Every push |
| Storybook | UX Agent | component-render | Every render |
| CI/CD | Component Agent | PR review | Every PR |
