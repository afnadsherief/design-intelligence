/* ==========================================
   A-OS — CONVERSION AGENT
   Conversion-path scan: CTA presence, button semantics,
   form friction. Reuses safe a11y patches (cross-domain).
   ========================================== */

import type { AgentEvaluator, Domain, Issue, Severity } from "@/system/aos/types";
import { clamp, makeIssue } from "./helpers";

export const conversionAgent: AgentEvaluator = {
  id: "conversion",
  domain: "conversion",

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
        domain: "conversion" as Domain,
        sourceAgent: "conversion",
      });
      penalty += impact;
    };

    const ctaCount =
      (source.match(/<button\b/g) ?? []).length +
      (source.match(/<a\b(?=[^>]*\bhref=)/g) ?? []).length;
    if (ctaCount === 0) {
      push("conversion-no-cta", "high", 20, 0.6, "No button or linked anchor — visitor has no next step");
    }

    const formCount = (source.match(/<form\b/g) ?? []).length;
    const untaggedButtons = (source.match(/<button\b(?![^>]*\btype=)/g) ?? []).length;
    if (untaggedButtons > 0) {
      push(
        "conversion-button-default-type",
        "high",
        7,
        0.95,
        `${untaggedButtons} button(s) default to type="submit" inside forms — accidental submits abort conversions`,
        "a11y-button-type"
      );
    }

    if (formCount > 0) {
      const inputNoLabel = (source.match(/<input\b(?![^>]*\b(?:aria-label|id)=)/g) ?? []).length;
      if (inputNoLabel > 0) {
        push(
          "conversion-field-unlabeled",
          "medium",
          6,
          0.85,
          `${inputNoLabel} unlabeled field(s) in form — assistive-tech users cannot complete the flow`,
          "a11y-input-aria-label"
        );
      }
      const submitCount = (source.match(/type=["']submit["']/gi) ?? []).length;
      if (submitCount === 0) {
        push("conversion-no-submit", "medium", 6, 0.7, "Form without submit control — flow cannot complete");
      }
    }

    return { score: clamp(100 - penalty, 0, 100), issues };
  },
};