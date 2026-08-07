/* ==========================================
   DESIGN INTELLIGENCE - GLOBAL LEARNING ENGINE
   learnFromRun(context, result) records deterministic
   metadata for ANY agent (qa | fix | ux | perf | generator).
   ========================================== */

import {
  clamp,
  getMemory,
  incrementIssue,
  patchSuccessRate,
  recordAgentOutcome,
  recordComponentRun,
  recordPatchOutcome,
  round2,
} from "./memory";
import { classifyComponent, type ComponentKind } from "@/system/types/component-kind";
import type {
  GlobalEvolutionMemory,
  LearnContext,
  LearnRunResult,
  LearnSummary,
  ValidationLike,
} from "./types";

const CATEGORY_LABELS = ["token", "space", "purity", "ux", "perf", "contract", "hierarchy"];

/** Deterministic 0-100 quality proxy from a validation-like object. */
export function qualityScore(v: ValidationLike): number {
  const token = v.tokenUsage?.valid ? 100 : 40;
  const ux = v.uxScore?.overall ?? 50;
  const perf = v.performanceScore ?? 50;
  const errors = v.errors?.length ?? 0;
  const base = token * 0.3 + ux * 0.4 + perf * 0.3;
  return clamp(Math.round(base - errors * 5), 0, 100);
}

/** Deterministic issue keys from source + validation errors. */
export function detectIssueKeys(source: string, errors?: string[]): string[] {
  const keys = new Set<string>();
  for (const error of errors ?? []) {
    const label = error.split(":")[0].trim().toLowerCase();
    if (CATEGORY_LABELS.includes(label)) keys.add(label);
  }
  if (/<img\b(?![^>]*\balt=)/.test(source)) keys.add("a11y-img-alt");
  if (/<button\b(?![^>]*\btype=)/.test(source)) keys.add("a11y-button-type");
  if (/<a\b(?![^>]*\brel=)(?=[^>]*\btarget=(?:"_blank"|'_blank'))/.test(source)) {
    keys.add("a11y-anchor-rel");
  }
  if (/\bh1\b/.test(source) === false) keys.add("hierarchy");
  if ((source.match(/font-bold/g) || []).length > 3) keys.add("hierarchy");
  return [...keys];
}

/**
 * PART 2 — UNIVERSAL LEARNING ENGINE
 * context carries agentType / component / patches / passes;
 * result carries scores. Records deterministic metadata:
 *   - patch usage + success/failure
 *   - agent accuracy (score improved?) + performance EMA
 *   - convergence efficiency (component avgPasses)
 *   - heuristic weight drift + issue frequency
 */
export function learnFromRun(
  context: LearnContext,
  result: LearnRunResult = {},
  memory: GlobalEvolutionMemory = getMemory()
): LearnSummary {
  const scoreAfter = result.scoreAfter ?? result.score ?? 0;
  const scoreBefore = result.scoreBefore ?? 0;
  const improved = scoreAfter > scoreBefore;
  const outcome: "success" | "failure" | "neutral" =
    scoreBefore === 0 && scoreAfter === 0
      ? "neutral"
      : improved
        ? "success"
        : "failure";

  // 1) Patch outcomes + usage
  for (const patch of context.patchesApplied ?? []) {
    memory.patches.usage[patch.id] = (memory.patches.usage[patch.id] ?? 0) + 1;
    if (outcome !== "neutral") {
      recordPatchOutcome(memory, patch.id, outcome === "success" ? "success" : "failure");
    }
  }

  // 2) Issue frequency
  let recordedIssues = 0;
  for (const key of context.issues ?? []) {
    incrementIssue(memory, key);
    recordedIssues++;
  }

  // 3) Agent accuracy + performance
  recordAgentOutcome(memory, context.agentType, scoreAfter, improved);

  // 4) Convergence efficiency + component avg score
  recordComponentRun(memory, context.componentName, context.passes ?? 1, scoreAfter);

  // 5) Heuristic weight drift (clamped, deterministic)
  const weights = memory.heuristics;
  if (context.agentType === "ux") {
    weights.uxWeight = clamp(round2(weights.uxWeight + (improved ? 0.01 : -0.01)), 0.5, 1.5);
  }
  if (context.agentType === "perf") {
    weights.performanceWeight = clamp(round2(weights.performanceWeight + (improved ? 0.01 : -0.01)), 0.5, 1.5);
  }
  const a11yApplied = (context.patchesApplied ?? []).some((p) => /^a11y-/.test(p.id));
  if (a11yApplied) {
    weights.accessibilityWeight = clamp(
      round2(weights.accessibilityWeight + (improved ? 0.01 : -0.01)),
      0.5,
      1.5
    );
  }

  return {
    agentType: context.agentType,
    componentName: context.componentName,
    outcome,
    recordedIssues,
    agentAccuracy: memory.agents.accuracy[context.agentType],
    agentPerformance: memory.agents.performance[context.agentType],
  };
}

/** PART 3.1 — Adaptive patch confidence (base + success-rate adjustment, clamped [0.3, 1]). */
export function adjustConfidence(
  patch: { id: string; confidence: number },
  memory: GlobalEvolutionMemory = getMemory()
): number {
  const rate = patchSuccessRate(memory, patch.id);
  const adjustment = (rate - 0.5) * 0.2;
  return round2(clamp(patch.confidence + adjustment, 0.3, 1));
}

/** PART 3.2 — Patch prioritization: impact x successRate x frequency. */
export function prioritizePatches(
  patches: ReadonlyArray<{ id: string; impact: number }>,
  memory: GlobalEvolutionMemory = getMemory()
): Array<{ id: string; score: number }> {
  return patches
    .map((p, index) => {
      const rate = patchSuccessRate(memory, p.id);
      const frequency = memory.patches.usage[p.id] ?? 0;
      return {
        id: p.id,
        score: round2(p.impact * rate * Math.max(1, frequency)),
        _index: index,
      };
    })
    .sort((a, b) => b.score - a.score || a._index - b._index)
    .map(({ id, score }) => ({ id, score }));
}

/** Aggregate avgPasses per component kind (from memory.components). */
export function kindRunStats(
  memory: GlobalEvolutionMemory,
  kind: ComponentKind
): { avg: number; runs: number } {
  let sum = 0;
  let count = 0;
  for (const [name, stats] of Object.entries(memory.components)) {
    if (classifyComponent(name, "") === kind) {
      sum += stats.avgPasses;
      count++;
    }
  }
  return { avg: count ? sum / count : 0, runs: count };
}

/**
 * PART 3.4 — AUTO-TUNED maxPasses.
 * Prefers the component's own history; otherwise its kind's average;
 * always leaves +1 headroom above the observed average (clamped [1,5]).
 */
export function effectiveMaxPasses(
  componentName: string,
  defaultMax: number,
  memory: GlobalEvolutionMemory = getMemory(),
  kind: ComponentKind = classifyComponent(componentName, "")
): number {
  const own = memory.components[componentName];
  const group = kindRunStats(memory, kind);
  const runs = own ? own.runs : group.runs;
  if (runs === 0) return defaultMax;
  const avg = own ? own.avgPasses : group.avg;
  return clamp(Math.ceil(avg) + 1, 1, 5);
}