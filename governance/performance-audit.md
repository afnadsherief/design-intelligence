# Performance Audit

**Source:** Design Intelligence Governance
**Last Updated:** 2026-08-07
**Status:** Complete

---

## Audit Criteria

### Render Time Per Component
| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Mount time | <5ms | 5-15ms | >15ms |
| Re-render | <2ms | 2-5ms | >5ms |
| DOM nodes | <20 | 20-50 | >50 |

### Bundle Size Impact
| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| CSS per component | <2KB | 2-5KB | >5KB |
| Total design system | <50KB | 50-100KB | >100KB |
| Gzipped | <15KB | 15-30KB | >30KB |

### Reusability Score
| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Variant reuse | >80% | 60-80% | <60% |
| Token coverage | >95% | 80-95% | <80% |
| Primitive usage | 100% | >90% | <90% |

### Token Efficiency Ratio
| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Tokens per component | <15 | 15-25 | >25 |
| Unique token references | >70% | 50-70% | <50% |
| Unused tokens | <10% | 10-20% | >20% |

---

## Monitoring

### Pre-commit
- Run ESLint token rules
- Check for hardcoded values
- Validate contract compliance

### Build
- Measure CSS output size
- Count unique class names
- Check for duplication
- Calculate token efficiency ratio

### PR
- Full performance audit
- Bundle size comparison
- Variant count review
- Render time benchmark

---

## Optimization Rules

1. **Use tokens consistently** — same values = same classes = deduplication
2. **Limit variants** — prefer composition over configuration
3. **Avoid nested selectors** — increases specificity and size
4. **Use CSS custom properties** — reduces repeated values
5. **Tree-shake unused styles** — remove unused variants
6. **Monitor variant explosion** — max 8 variants per component
7. **Prefer layouts over custom CSS** — use Section/Container
