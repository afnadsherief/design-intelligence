/* ==========================================
   DESIGN INTELLIGENCE - FIX AGENT
   Safe, deterministic multi-pass autofix layer on
   top of the same openDesign() validation pipeline.

   Patch model (see ./patches):
   - deterministic / safe classes -> auto-applied after
     confidence >= minConfidence and exact-match
     (idempotent ids, re-validated every pass).
     advisory never touches code (recommendation only).

   Selection rule (Part 4):
   all deterministic patches are ALWAYS included;
   remaining slots (maxPatchesPerRun) are filled by the
   highest (impact x confidence) among the rest.

   Convergence (soft): a pass stops as soon as NO new
   patch changes the source, or when already valid.
   ========================================================== */

import { openDesign, enforceHierarchy, type ValidationResult } from "@/system";
import { classifyComponent, type ComponentKind } from "@/system/types/component-kind";
import {
  adjustConfidence,
  effectiveMaxPasses,
  qualityScore,
  type EvolutionMemory,
  type Advisory,
  buildAdvisories,
} from "@/system/evolution";
import {
  AUTO_FIX_CLASSES,
  generatePatches,
  SAFE_TRANSFORM_RULES,
  type Patch,
} from "./patches";

export interface FixPassLog {
  pass: number;
  beforeErrors: number;
  beforeUx: number;
  beforePerf: number;
  candidateCount: number;
  appliedCount: number;
  appliedIds: string[];
  afterErrors: number;
  afterUx: number;
  afterPerf: number;
  converged: boolean;
}

/** Compact, evolution-consumable per-pass record. */
export interface FixRunPass {
  pass: number;
  scoreBefore: number;
  scoreAfter: number;
  patchesApplied: string[];
}

export interface FixResult {
  component: string;
  fixed: boolean;
  code: string | null;
  kind: ComponentKind;
  passCount: number;
  passes: FixRunPass[];
  appliedPatches: Patch[];
  pendingRecommendations: string[];
  advisories: Advisory[];
  validationBefore: ValidationResult;
  validationAfter: ValidationResult;
  logs: FixPassLog[];
}

export interface ApplyFixesOptions {
  /** Print a per-pass before/after log to stdout. Default false. */
  logPasses?: boolean;
  /** Evolution memory: adaptive confidence + dynamic maxPasses + metadata. */
  memory?: EvolutionMemory;
}

function metrics(v: ValidationResult) {
  return { errors: v.errors.length, ux: v.uxScore.overall, perf: v.performanceScore };
}

function formatMetrics(m: ReturnType<typeof metrics>): string {
  return `errors=${m.errors} ux=${m.ux} perf=${m.perf}`;
}

export function applyFixes(
  componentName: string,
  source: string,
  props?: Record<string, unknown>,
  options: ApplyFixesOptions = {}
): FixResult {
  const kind = classifyComponent(componentName, source);
  const validationBefore = openDesign(componentName, source, props);
  const logPasses = options.logPasses ?? false;
  const memory = options.memory;

  // Dynamic pass ceiling from componentStats.avgPasses (per-kind).
  const maxPasses = memory
    ? effectiveMaxPasses(componentName, SAFE_TRANSFORM_RULES.maxPasses, memory, kind)
    : SAFE_TRANSFORM_RULES.maxPasses;

  let code = source;
  const appliedPatches: Patch[] = [];
  const appliedIds = new Set<string>();
  const logs: FixPassLog[] = [];
  const passes: FixRunPass[] = [];
  let passCount = 0;
  let converged = false;

  if (logPasses) {
    console.log(`[FIX] ${componentName} (${kind}) — start ${formatMetrics(metrics(validationBefore))} [maxPasses=${maxPasses}]`);
  }

  for (let pass = 0; pass < maxPasses && !converged; pass++) {
    passCount = pass + 1;
    const validation = openDesign(componentName, code, props);
    const before = metrics(validation);

    // Adaptive confidence for every candidate when memory is present.
    const generated = generatePatches(validation, code, {
      kind: classifyComponent(componentName, code),
      hierarchy: enforceHierarchy(code),
      memory,
    });
    const candidates = memory
      ? generated.map((patch) => ({ ...patch, confidence: adjustConfidence(patch, memory) }))
      : generated;

    const eligible = candidates.filter(
      (patch) =>
        AUTO_FIX_CLASSES.has(patch.class) &&
        (patch.confidence ?? 0) >= SAFE_TRANSFORM_RULES.minConfidence &&
        !appliedIds.has(patch.id)
    );

    // PART 4 — ALWAYS include all deterministic; fill rest by impact x confidence.
    const deterministic = eligible.filter((patch) => patch.class === "deterministic");
    const fillable = eligible
      .filter((patch) => patch.class !== "deterministic")
      .sort((a, b) => (b.impact ?? 0) * (b.confidence ?? 0) - (a.impact ?? 0) * (a.confidence ?? 0));
    const capacity = Math.max(0, SAFE_TRANSFORM_RULES.maxPatchesPerRun - deterministic.length);
    const selected = [...deterministic, ...fillable.slice(0, capacity)];

    let appliedInPass: Patch[] = [];
    for (const patch of selected) {
      const next = patch.apply(code);
      if (next !== code) {
        code = next;
        appliedPatches.push(patch);
        appliedIds.add(patch.id);
        appliedInPass.push(patch);
      }
    }

    const after = metrics(openDesign(componentName, code, props));

    // Soft convergence: no new patches applied this pass.
    converged = appliedInPass.length === 0 || after.errors === 0;

    logs.push({
      pass,
      beforeErrors: before.errors,
      beforeUx: before.ux,
      beforePerf: before.perf,
      candidateCount: candidates.length,
      appliedCount: appliedInPass.length,
      appliedIds: appliedInPass.map((p) => p.id),
      afterErrors: after.errors,
      afterUx: after.ux,
      afterPerf: after.perf,
      converged,
    });

    passes.push({
      pass: pass + 1,
      scoreBefore: qualityScore(validation),
      scoreAfter: qualityScore(openDesign(componentName, code, props)),
      patchesApplied: appliedInPass.map((p) => p.id),
    });

    if (logPasses) {
      console.log(
        `  pass ${pass + 1}: ${formatMetrics(before)} -> ${formatMetrics(after)}` +
          `  [candidates=${candidates.length} applied=${appliedInPass.length}` +
          (appliedInPass.length ? ` ${appliedInPass.map((p) => p.id).join(", ")}` : "") +
          `] ${converged ? "converged" : "continue"}`
      );
    }
  }

  const validationAfter = openDesign(componentName, code, props);
  const fixed = code !== source;

  const finalPatches = generatePatches(validationAfter, code, {
    kind: classifyComponent(componentName, code),
    hierarchy: enforceHierarchy(code),
    memory,
  });

  const pendingPatches = finalPatches.filter((patch) => !appliedIds.has(patch.id));
  const pendingRecommendations = [...new Set(pendingPatches.map((patch) => patch.description))];

  // PART 6 — structured, sorted advisories.
  const advisories = memory ? buildAdvisories(pendingPatches, memory) : buildAdvisories(pendingPatches);

  return {
    component: componentName,
    fixed,
    code: fixed ? code : null,
    kind: classifyComponent(componentName, code),
    passCount,
    passes,
    appliedPatches,
    pendingRecommendations,
    advisories,
    validationBefore,
    validationAfter,
    logs,
  };
}