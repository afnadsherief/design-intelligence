/* ==========================================
   A-OS — SECURITY AGENT
   Static scan for injection / exposure risks.
   Deterministic. Reuses a11y-anchor-rel for the
   target="_blank" window-opener risk (cross-domain).
   ========================================== */

import type { AgentEvaluator, Domain, Issue, Severity } from "@/system/aos/types";
import { clamp, makeIssue } from "./helpers";

export const securityAgent: AgentEvaluator = {
  id: "security",
  domain: "security",

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
        domain: "security" as Domain,
        sourceAgent: "security",
      });
      penalty += impact;
    };

    if (/dangerouslySetInnerHTML/.test(source)) {
      push("security-dangerous-html", "critical", 30, 0.95, "dangerouslySetInnerHTML — unescaped user content can inject scripts");
    }
    if (/\beval\s*\(/.test(source)) {
      push("security-eval", "critical", 25, 0.95, "eval() executes arbitrary strings — gate it behind trusted input only");
    }
    if (/(?:\.\s*)?innerHTML\s*=/.test(source)) {
      push("security-innerhtml-assign", "high", 15, 0.85, "innerHTML assignment re-parses markup — prefer textContent or sanitized sinks");
    }
    if (/\bhref=["']javascript:/i.test(source)) {
      push("security-javascript-href", "critical", 20, 0.95, "href=\"javascript:\" executes on click and breaks CSP");
    }
    const blankAnchors = (source.match(/<a\b(?![^>]*\brel=)(?=[^>]*\btarget=(?:"_blank"|'_blank'))/g) ?? []).length;
    if (blankAnchors > 0) {
      push(
        "security-blank-no-rel",
        "high",
        7,
        0.95,
        `${blankAnchors} target="_blank" anchor(s) lack rel="noopener noreferrer" (reverse-tabnabbing)`,
        "a11y-anchor-rel"
      );
    }
    if ((source.match(/<form\b(?![\s\S]*?\bmethod=)/g) ?? []).length > 0) {
      push("security-form-no-method", "low", 3, 0.6, "Form without explicit method defaults to GET — submission includes query exposure");
    }

    return { score: clamp(100 - penalty, 0, 100), issues };
  },
};