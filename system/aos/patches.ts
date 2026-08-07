/* ==========================================
   A-OS — DOMAIN PATCH REGISTRY
   Maps agent issue types to the patch that resolves
   them. Safe a11y factories are reused cross-domain
   (imported from design-qa); domain-level fixes are
   advisory only (no-op apply, memory-driven).
   ========================================== */

import {
  imageAltPatch,
  buttonTypePatch,
  ariaLabelPatch,
  anchorRelPatch,
  domainAdvisoryPatch,
  type Patch,
} from "@/agents/design-qa/patches";

const SAFE: Patch[] = [
  imageAltPatch(),
  buttonTypePatch(),
  ariaLabelPatch(),
  anchorRelPatch(),
];

/** Issue type → advisory (no-op apply; evolves via memory only). */
const ADVISORIES: Array<{ type: string; description: string; impact: number }> = [
  { type: "seo-missing-title", description: "Add an on-page <title> that names the primary keyword", impact: 25 },
  { type: "seo-missing-meta-description", description: "Add a meta description of 140-160 chars", impact: 15 },
  { type: "seo-missing-h1", description: "Add a single h1 containing the primary keyword", impact: 12 },
  { type: "seo-multiple-h1", description: "Collapse multiple h1 tags to one; use h2/h3 beneath", impact: 8 },
  { type: "seo-anchor-no-href", description: "Give anchors a real href target", impact: 5 },
  { type: "seo-heading-gap", description: "Add h3 sections under existing h2 groups", impact: 3 },
  { type: "smm-missing-og-title", description: "Add og:title for controlled link previews", impact: 6 },
  { type: "smm-missing-og-image", description: "Add og:image with a 1200x630 share graphic", impact: 10 },
  { type: "smm-missing-og-description", description: "Add og:description for share summaries", impact: 6 },
  { type: "smm-missing-twitter-card", description: "Add twitter:card meta for X previews", impact: 3 },
  { type: "crm-no-lead-capture", description: "Add a <form> lead-capture surface", impact: 6 },
  { type: "crm-form-unidentified", description: "Name every form with name or aria-label for CRM mapping", impact: 8 },
  { type: "crm-email-not-required", description: "Mark email inputs required so partial rows never reach the CRM", impact: 5 },
  { type: "security-dangerous-html", description: "Remove dangerouslySetInnerHTML or route through a sanitizer", impact: 30 },
  { type: "security-eval", description: "Replace eval() with a typed parser", impact: 25 },
  { type: "security-innerhtml-assign", description: "Assign via textContent / trusted sanitized sinks", impact: 15 },
  { type: "security-javascript-href", description: "Replace href=\"javascript:\" with a real route handler", impact: 20 },
  { type: "security-form-no-method", description: "Add an explicit method attribute to the form", impact: 3 },
  { type: "conversion-no-cta", description: "Add one primary CTA with a clear label", impact: 20 },
  { type: "conversion-no-submit", description: "Add type=\"submit\" to complete the form flow", impact: 6 },
  { type: "pricing-no-anchor", description: "Expose an anchor price with <del> or line-through", impact: 3 },
  { type: "pricing-tiers-untagged", description: "Tag tiers with data-price attributes for pricing analytics", impact: 5 },
  { type: "pricing-prefix-mismatch", description: "Unify data-price attribute suffixes across tiers", impact: 5 },
  { type: "pricing-surface-absent", description: "Consider surfacing pricing in this component", impact: 2 },
];

const SAFE_ISSUE_TO_PATCH: Record<string, string> = {
  "seo-img-missing-alt": "a11y-img-alt",
  "crm-input-no-label": "a11y-input-aria-label",
  "conversion-button-default-type": "a11y-button-type",
  "conversion-field-unlabeled": "a11y-input-aria-label",
  "security-blank-no-rel": "a11y-anchor-rel",
};

const ADVISORY_IMPACT: Record<string, number> = Object.fromEntries(
  ADVISORIES.map((a) => [a.type, a.impact])
);
const ADVISORY_DESCRIPTION: Record<string, string> = Object.fromEntries(
  ADVISORIES.map((a) => [a.type, a.description])
);

/** Deterministic lookup: issue type -> resolving patch (if any). */
export function patchForIssueType(type: string): Patch | undefined {
  const safeId = SAFE_ISSUE_TO_PATCH[type];
  if (safeId) {
    const safe = SAFE.find((p) => p.id === safeId);
    if (safe) return safe;
  }
  if (type in ADVISORY_IMPACT) {
    return domainAdvisoryPatch(type, ADVISORY_DESCRIPTION[type], ADVISORY_IMPACT[type]);
  }
  return undefined;
}

/** Issue types that carry a resolvable patch (safe or advisory). */
export const AOS_PATCHABLE_TYPES: ReadonlySet<string> = new Set([
  ...Object.keys(SAFE_ISSUE_TO_PATCH),
  ...Object.keys(ADVISORY_IMPACT),
]);

/** Ids of true executable (safe-class) patches reused across domains. */
export const SAFE_PATCH_IDS: ReadonlyArray<string> = SAFE.map((p) => p.id);