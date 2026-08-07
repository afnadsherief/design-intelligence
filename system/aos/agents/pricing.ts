/* ==========================================
   A-OS — PRICING AGENT
   Pricing-surface scan: anchors, tier consistency,
   price metadata. Mostly advisory (pricing changes
   need product judgment); memory via productOutcomes.
   ========================================== */

import type { AgentEvaluator, Domain, Issue, Severity } from "@/system/aos/types";
import { clamp, makeIssue } from "./helpers";

export const pricingAgent: AgentEvaluator = {
  id: "pricing",
  domain: "pricing",

  evaluate(source: string): { score: number; issues: Issue[] } {
    const issues: Issue[] = [];
    let penalty = 0;

    const push = (
      type: string,
      severity: Severity,
      impact: number,
      confidence: number,
      detail: string
    ) => {
      issues.push({
        ...makeIssue(type, detail, { severity, impact, confidence }),
        domain: "pricing" as Domain,
        sourceAgent: "pricing",
      });
      penalty += impact;
    };

    const hasPriceText = /\$\s?\d+|\bprice\b|\d+\s*\/\s*(mo|month|year)/i.test(source);
    const hasStrikethrough = /<del\b|line-through|\bdata-price-was=/i.test(source);
    const tierCount = (source.match(/\btier\b|\bplan\b|\bdata-price-/gi) ?? []).length;

    if (hasPriceText && !hasStrikethrough) {
      push(
        "pricing-no-anchor",
        "low",
        3,
        0.5,
        "Priced element without anchor (<del> or line-through) — anchoring boosts perceived value"
      );
    }
    if (tierCount > 1) {
      const priceAttrs = (source.match(/\bdata-price(?:-|"|=)/gi) ?? []).length;
      if (priceAttrs === 0) {
        push(
          "pricing-tiers-untagged",
          "medium",
        5,
        0.6,
          `${tierCount} tier/plan markers without data-price attributes — pricing is not machine-queryable`
        );
      }
      const sharedPrefix = [...new Set((source.match(/\bdata-price-[a-z]+/gi) ?? []).map((m) => m.toLowerCase()))];
      if (sharedPrefix.length > 1) {
        push(
          "pricing-prefix-mismatch",
          "medium",
          5,
          0.7,
          `Inconsistent data-price prefixes (${sharedPrefix.join(", ")}) — analytics lose one schema`
        );
      }
    } else if (tierCount === 0 && !hasPriceText) {
      push("pricing-surface-absent", "low", 2, 0.4, "No pricing surface detected in this component");
    }

    return { score: clamp(100 - penalty, 0, 100), issues };
  },
};