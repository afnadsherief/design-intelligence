/* ==========================================
   A-OS — SOCIAL MEDIA (SMM) AGENT
   Social-sharing metadata scan. Deterministic.
   ========================================== */

import type { AgentEvaluator, Domain, Issue, Severity } from "@/system/aos/types";
import { clamp, makeIssue } from "./helpers";

export const smmAgent: AgentEvaluator = {
  id: "smm",
  domain: "smm",

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
        domain: "smm" as Domain,
        sourceAgent: "smm",
      });
      penalty += impact;
    };

    if (!/<meta\b[^>]*property=["']og:title["']/i.test(source)) {
      push("smm-missing-og-title", "medium", 12, 0.7, "No og:title — shared links render without a headline");
    }
    if (!/<meta\b[^>]*property=["']og:image["']/i.test(source)) {
      push("smm-missing-og-image", "medium", 10, 0.7, "No og:image — social cards lack preview artwork");
    }
    if (!/<meta\b[^>]*property=["']og:description["']/i.test(source)) {
      push("smm-missing-og-description", "medium", 6, 0.6, "No og:description — social shares have no summary text");
    }
    if (!/<meta\b[^>]*name=["']twitter:card["']/i.test(source)) {
      push("smm-missing-twitter-card", "low", 3, 0.6, "No twitter:card — X/Twitter previews are unstyled");
    }

    return { score: clamp(100 - penalty, 0, 100), issues };
  },
};