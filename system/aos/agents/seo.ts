/* ==========================================
   A-OS — SEO AGENT
   Rule-based technical SEO scan of component source.
   Deterministic. Content creation stays advisory.
   ========================================== */

import type { AgentEvaluator, Domain, Issue, Severity } from "@/system/aos/types";
import { clamp, makeIssue } from "./helpers";

export const seoAgent: AgentEvaluator = {
  id: "seo",
  domain: "seo",

  evaluate(source: string): { score: number; issues: Issue[] } {
    const issues: Issue[] = [];
    let penalty = 0;

    const push = (
      type: string,
      severity: Severity,
      impact: number,
      confidence: number,
      detail: string,
      patchId?: string
    ) => {
      issues.push({
        ...makeIssue(type, detail, { severity, impact, confidence, patchId }),
        domain: "seo" as Domain,
        sourceAgent: "seo",
      });
      penalty += impact;
    };

    if (!/<title>[\s\S]*<\/title>/.test(source)) {
      push("seo-missing-title", "high", 25, 0.7, "No <title> — pages have no search-engine headline");
    }
    if (!/<meta\b[^>]*name=["']description["']/i.test(source)) {
      push("seo-missing-meta-description", "high", 15, 0.7, "No meta description — search snippets fall back to raw text");
    }
    if (!/\bh1\b/.test(source)) {
      push("seo-missing-h1", "high", 12, 0.7, "No h1 — primary keyword heading missing");
    } else if ((source.match(/\bh1\b/g) ?? []).length > 1) {
      push("seo-multiple-h1", "medium", 8, 0.8, "Multiple h1 tags dilute the primary keyword signal");
    }
    const missingAlt = (source.match(/<img\b(?![^>]*\balt=)/g) ?? []).length;
    if (missingAlt > 0) {
      push(
        "seo-img-missing-alt",
        "medium",
        6,
        0.9,
        `${missingAlt} <img> element(s) lack alt text — images are invisible to search engines`,
        "a11y-img-alt"
      );
    }
    const anchorNoHref = (source.match(/<a\b(?![^>]*\bhref=)/g) ?? []).length;
    if (anchorNoHref > 0) {
      push("seo-anchor-no-href", "medium", 5, 0.8, `${anchorNoHref} anchor(s) without href are not crawlable links`);
    }
    if (/\bh2\b/.test(source) && !/\bh3\b/.test(source)) {
      push("seo-heading-gap", "low", 3, 0.5, "h2 present but no h3 — consider deeper section headings");
    }

    return { score: clamp(100 - penalty, 0, 100), issues };
  },
};
