/* ==========================================
   A-OS — CRM AGENT
   Lead-capture / marketing relationship scan.
   Deterministic. Structural form fixes reuse the
   safe a11y-input-aria-label patch (cross-domain).
   ========================================== */

import type { AgentEvaluator, Domain, Issue, Severity } from "@/system/aos/types";
import { clamp, makeIssue } from "./helpers";

export const crmAgent: AgentEvaluator = {
  id: "crm",
  domain: "crm",

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
        domain: "crm" as Domain,
        sourceAgent: "crm",
      });
      penalty += impact;
    };

    const formCount = (source.match(/<form\b/g) ?? []).length;
    if (formCount === 0) {
      push("crm-no-lead-capture", "medium", 6, 0.5, "No <form> — no structured lead-capture surface");
    } else {
      const namedForms = (source.match(/<form\b(?=[^>]*(?:name|aria-label)=)/g) ?? []).length;
      if (namedForms < formCount) {
        push("crm-form-unidentified", "high", 8, 0.7, `${formCount - namedForms} form(s) lack a name/aria-label — leads unmappable in CRM`);
      }
    }

    const inputNoLabel = (source.match(/<input\b(?![^>]*\b(?:aria-label|id)=)/g) ?? []).length;
    if (inputNoLabel > 0) {
      push(
        "crm-input-no-label",
        "high",
        7,
        0.85,
        `${inputNoLabel} input(s) without label/aria-label — unusable for consent tracking`,
        "a11y-input-aria-label"
      );
    }

    const emailInputs = (source.match(/<input\b[^>]*type=["']email["']/gi) ?? []).length;
    const emailRequired = (source.match(/<input\b[^>]*type=["']email["'][^>]*required/gi) ?? []).length;
    if (emailInputs > 0 && emailRequired < emailInputs) {
      push(
        "crm-email-not-required",
        "medium",
        5,
        0.8,
        `${emailInputs} email input(s) without required — partial sign-up rows pollute CRM`,
        "crm-email-required"
      );
    }

    return { score: clamp(100 - penalty, 0, 100), issues };
  },
};