/* ==========================================
   DESIGN INTELLIGENCE - PATCH GENERATION SYSTEM
   Deterministic, safe code transformations for
   validation issues found by openDesign().
   Every patch carries a priority + confidence;
   only exact-match, high-confidence patches are
   auto-applied (see SAFE_TRANSFORM_RULES).
   ========================================== */

import type { ValidationResult, HierarchyValidation } from "@/system";
import type { ComponentKind } from "@/system/types/component-kind";
import type { GlobalEvolutionMemory } from "@/system/evolution/types";
import { patchSuccessRate } from "@/system/evolution/memory";

export type PatchKind =
  | "token"
  | "space"
  | "accessibility"
  | "contract"
  | "hierarchy"
  | "purity"
  | "perf";

/**
 * PatchClass — risk model.
 * - deterministic: exact token substitution (style-value → CSS var). No structural change.
 * - safe:         structural attribute additions (a11y). No visual/behavioral regression.
 * - advisory:     recommendations only; apply() is a no-op, never auto-applied.
 * - critical family (critical | seo-critical | security-critical | conversion-critical):
 *                 highest-priority candidates; auto-applied like safe when
 *                 confidence >= minConfidence and the transform is exact-match.
 */
export type PatchClass =
  | "deterministic"
  | "safe"
  | "advisory"
  | "critical"
  | "seo-critical"
  | "security-critical"
  | "conversion-critical";

export interface Patch {
  id: string;
  kind: PatchKind;
  class: PatchClass;
  description: string;
  confidence: number;
  priority: number;
  /** Static impact weight (0-10) — used for prioritization. */
  impact: number;
  /** Memory-derived success rate — always stamped by generatePatches(). */
  successRate?: number;
  /** Memory-derived frequency — always stamped by generatePatches(). */
  frequency?: number;
  match: string;
  apply: (code: string) => string;
}

export const PATCH_PRIORITY: Record<PatchKind, number> = {
  token: 10,
  space: 20,
  accessibility: 30,
  contract: 40,
  hierarchy: 50,
  purity: 60,
  perf: 70,
};

/** Classes that are safe to auto-apply when confidence is high enough. */
export const AUTO_FIX_CLASSES: ReadonlySet<PatchClass> = new Set([
  "deterministic",
  "safe",
  "critical",
  "seo-critical",
  "security-critical",
  "conversion-critical",
]);

/** Kinds that are safe to auto-apply (compat — mirrors AUTO_FIX_CLASSES). */
export const AUTO_FIX_KINDS: ReadonlySet<PatchKind> = new Set([
  "token",
  "space",
  "accessibility",
]);

export const SAFE_TRANSFORM_RULES = {
  requireExactMatch: true,
  minConfidence: 0.8,
  maxPatchesPerRun: 5,
  maxPasses: 3,
  accessibilityTransformsEnabled: true,
  hierarchyIsAdvisory: true,
  softConvergence: true,
} as const;

const SPACE_TOKEN_MAP: Record<number, string> = {
  4: "--space-1",
  8: "--space-2",
  12: "--space-3",
  16: "--space-4",
  24: "--space-6",
  32: "--space-8",
  48: "--space-12",
  64: "--space-16",
  96: "--space-24",
};

const HEX_TOKEN_MAP: Record<string, string> = {
  "#ffffff": "--color-white",
  "#000000": "--color-black",
  "#f9fafb": "--color-gray-50",
  "#f3f4f6": "--color-gray-100",
  "#e5e7eb": "--color-gray-200",
  "#d1d5db": "--color-gray-300",
  "#9ca3af": "--color-gray-400",
  "#6b7280": "--color-gray-500",
  "#4b5563": "--color-gray-600",
  "#374151": "--color-gray-700",
  "#1f2937": "--color-gray-800",
  "#111827": "--color-gray-900",
  "#030712": "--color-gray-950",
  "#eff6ff": "--color-blue-50",
  "#dbeafe": "--color-blue-100",
  "#bfdbfe": "--color-blue-200",
  "#93c5fd": "--color-blue-300",
  "#60a5fa": "--color-blue-400",
  "#3b82f6": "--color-blue-500",
  "#2563eb": "--color-blue-600",
  "#1d4ed8": "--color-blue-700",
  "#1e40af": "--color-blue-800",
  "#1e3a8a": "--color-blue-900",
  "#22c55e": "--color-green-500",
  "#16a34a": "--color-green-600",
  "#ef4444": "--color-red-500",
  "#dc2626": "--color-red-600",
  "#eab308": "--color-yellow-500",
  "#ca8a04": "--color-yellow-600",
  "#a855f7": "--color-purple-500",
  "#9333ea": "--color-purple-600",
};

function expandHex(hex: string): string {
  const h = hex.replace("#", "").toLowerCase();
  if (h.length === 3) return "#" + h.split("").map((c) => c + c).join("");
  return hex.toLowerCase();
}

function hexPatch(hex: string): Patch | null {
  const token = HEX_TOKEN_MAP[expandHex(hex)];
  if (!token) return null;
  return {
    id: `hex-${expandHex(hex)}`,
    kind: "token",
    class: "deterministic",
    description: `Replace ${hex} with rgb(var(${token}))`,
    confidence: 0.95,
    impact: 6,
    priority: PATCH_PRIORITY.token,
    match: hex,
    apply: (code) => code.split(hex).join(`rgb(var(${token}))`),
  };
}

function pxPatch(pxValue: number): Patch | null {
  const token = SPACE_TOKEN_MAP[pxValue];
  if (!token) return null;
  return {
    id: `px-${pxValue}`,
    kind: "space",
    class: "deterministic",
    description: `Replace ${pxValue}px inside class brackets with var(${token})`,
    confidence: 0.9,
    impact: 5,
    priority: PATCH_PRIORITY.space,
    match: `${pxValue}px`,
    apply: (code) =>
      code.replace(
        new RegExp(`(\\[[^\\]]*?)(\\b${pxValue}px\\b)([^\\]]*\\])`, "g"),
        `$1var(${token})$3`
      ),
  };
}

export function imageAltPatch(): Patch {
  return {
    id: "a11y-img-alt",
    kind: "accessibility",
    class: "safe",
    description: "Add an empty alt attribute to <img> elements missing one",
    confidence: 0.9,
    impact: 6,
    priority: PATCH_PRIORITY.accessibility,
    match: "<img",
    apply: (code) =>
      code.replace(
        /<img\b(?![^>]*\balt=)([^>]*?)>/g,
        '<img alt=""$1>'
      ),
  };
}

export function buttonTypePatch(): Patch {
  return {
    id: "a11y-button-type",
    kind: "accessibility",
    class: "safe",
    description: "Add type=\"button\" to <button> elements without an explicit type",
    confidence: 0.95,
    impact: 4,
    priority: PATCH_PRIORITY.accessibility,
    match: "<button",
    apply: (code) =>
      code.replace(
        /<button\b(?![^>]*\btype=)([^>]*?)>/g,
        '<button type="button"$1>'
      ),
  };
}

export function ariaLabelPatch(): Patch {
  return {
    id: "a11y-input-aria-label",
    kind: "accessibility",
    class: "safe",
    description: "Derive aria-label from placeholder on labeled-less inputs",
    confidence: 0.85,
    impact: 6,
    priority: PATCH_PRIORITY.accessibility,
    match: "<input",
    apply: (code) =>
      code.replace(
        /<input\b(?![^>]*\b(?:aria-label|id)=)(?=[^>]*placeholder="([^"]+)")([^>]*?)>/g,
        (_match, placeholder: string, attrs: string) =>
          `<input aria-label="${placeholder}"${attrs}>`
      ),
  };
}

export function anchorRelPatch(): Patch {
  return {
    id: "a11y-anchor-rel",
    kind: "accessibility",
    class: "safe",
    description: "Add rel=\"noopener noreferrer\" to <a> with target=\"_blank\" missing rel",
    confidence: 0.95,
    impact: 5,
    priority: PATCH_PRIORITY.accessibility,
    match: "<a",
    apply: (code) =>
      code.replace(
        /<a\b(?![^>]*\brel=)(?=[^>]*\btarget=(?:"_blank"|'_blank'))([^>]*?)>/g,
        '<a rel="noopener noreferrer"$1>'
      ),
  };
}

/**
 * A-OS domain advisory — no-op apply; evolves via memory (frequency/success) only.
 * Never auto-applied; decisions are prioritized and surfaced as advisories.
 */
export function domainAdvisoryPatch(id: string, description: string, impact: number): Patch {
  return {
    id,
    kind: "advisory" as PatchKind,
    class: "advisory",
    description,
    confidence: 0.4,
    priority: PATCH_PRIORITY.accessibility,
    impact,
    successRate: 0.5,
    frequency: 0,
    match: "",
    apply: (code) => code,
  };
}

function advisoryPatch(
  id: string,
  kind: PatchKind,
  description: string,
  impact: number
): Patch {
  return {
    id,
    kind,
    class: "advisory",
    description,
    confidence: 0.4,
    priority: PATCH_PRIORITY[kind],
    impact,
    successRate: 0.5,
    frequency: 0,
    match: "",
    apply: (code) => code,
  };
}

export function generatePatches(
  validation: ValidationResult,
  source: string,
  options: { kind?: ComponentKind; hierarchy?: HierarchyValidation; memory?: GlobalEvolutionMemory } = {}
): Patch[] {
  const patches: Patch[] = [];
  const seen = new Set<string>();

  // ---- TOKEN / SPACE (auto-fixable) ----
  if (!validation.tokenUsage.valid) {
    for (const match of source.matchAll(/#[0-9a-fA-F]{3,8}/g)) {
      const hex = match[0];
      const key = expandHex(hex);
      if (seen.has(key)) continue;
      seen.add(key);
      const patch = hexPatch(hex);
      if (patch) patches.push(patch);
    }

    for (const match of source.matchAll(/\[([^\]]*?)(\d+)px([^\]]*)\]/g)) {
      const px = parseInt(match[2], 10);
      const key = `px-${px}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const patch = pxPatch(px);
      if (patch) patches.push(patch);
    }
  }

  // 2. ACCESSIBILITY fixes — proactive, source-scanning, auto-apply when enabled
  if (SAFE_TRANSFORM_RULES.accessibilityTransformsEnabled) {
    if (/<img\b(?![^>]*\balt=)/.test(source)) patches.push(imageAltPatch());
    if (/<button\b(?![^>]*\btype=)/.test(source)) patches.push(buttonTypePatch());
    if (/<input\b(?![^>]*\b(?:aria-label|id)=)(?=[^>]*placeholder=)/.test(source)) {
      patches.push(ariaLabelPatch());
    }
    if (/<a\b(?![^>]*\brel=)(?=[^>]*\btarget=(?:"_blank"|'_blank'))/.test(source)) {
      patches.push(anchorRelPatch());
    }
  }

  // 3. HIERARCHY — advisory only (non-destructive), for composite/product kinds
  const kind = options.kind;
  if (options.hierarchy && (kind === "composite" || kind === "product")) {
    options.hierarchy.errors.forEach((error, i) => {
      patches.push(advisoryPatch(`hierarchy-error-${i}`, "hierarchy", `Hierarchy: ${error}`, 5));
    });
    options.hierarchy.warnings.forEach((warning, i) => {
      patches.push(advisoryPatch(`hierarchy-warn-${i}`, "hierarchy", warning, 3));
    });
  }

  // 4. CONTRACT / PURITY / PERF — advisory only (no safe auto-apply)
  for (const error of validation.errors) {
    if (error.startsWith("CONTRACT:")) {
      const description = error.slice(9).trim();
      patches.push(advisoryPatch(`contract-${description}`, "contract", description, 5));
    } else if (error.startsWith("PURITY:")) {
      patches.push(advisoryPatch(`purity-${patches.length}`, "purity", "Refactor to compose from @/system primitives instead of raw Tailwind classes", 4));
    } else if (error.startsWith("PERF:")) {
      patches.push(advisoryPatch(`perf-${patches.length}`, "perf", "Extract repeated classes into a cva() variant config and reuse component tokens", 3));
    }
  }

  // Enrich with memory-derived success rate / frequency (metadata only).
  return patches.map((patch) => ({
    ...patch,
    successRate: options.memory ? patchSuccessRate(options.memory, patch.id) : 0.5,
    frequency: options.memory ? (options.memory.patches.usage[patch.id] ?? 0) : 0,
  }));
}