/* ==========================================
   DESIGN INTELLIGENCE - GLOBAL ADAPTIVE SYSTEM
   adaptSystem(memory) recomputes tuning signals and
   advisory intelligence from accumulated memory.
   Fully deterministic — no randomness.
   ========================================== */

import { getMemory, patchSuccessRate } from "./memory";
import { kindRunStats } from "./learn";
import { classifyComponent, type ComponentKind } from "@/system/types/component-kind";
import type {
  Advisory,
  AdvisorySeverity,
  GlobalEvolutionMemory,
  PatchLike,
  SystemAdaptation,
} from "./types";

const DEFAULT_IMPACT = 5;
const KINDS: ComponentKind[] = ["primitive", "layout", "composite", "product"];

function severityRank(severity: AdvisorySeverity): number {
  return severity === "high" ? 3 : severity === "medium" ? 2 : 1;
}

function severityFromImpact(impact: number, frequency: number): AdvisorySeverity {
  let level: AdvisorySeverity = impact >= 6 ? "high" : impact >= 4 ? "medium" : "low";
  if (frequency >= 3) {
    level = level === "low" ? "medium" : level === "medium" ? "high" : level;
  }
  return level;
}

/**
 * PART 3 — ADAPT SYSTEM.
 *   1. Patch confidence   : exposed via adjustConfidence(); here we surface
 *                           per-patch successRate/frequency/score.
 *   2. Patch prioritization: impact × successRate × frequency.
 *   3. Agent weights       : scaled heuristic weights + per-agent accuracy/perf.
 *   4. Convergence         : auto-tuned maxPasses per component kind.
 */
export function adaptSystem(
  memory: GlobalEvolutionMemory = getMemory(),
  catalog?: ReadonlyArray<{ id: string; impact: number }>
): SystemAdaptation {
  const impactById: Record<string, number> = {};
  for (const entry of catalog ?? []) impactById[entry.id] = entry.impact;

  // 4) tuned maxPasses per component kind
  const tunedMaxPasses: Record<string, number> = {};
  for (const kind of KINDS) {
    const group = kindRunStats(memory, kind);
    tunedMaxPasses[kind] = group.runs === 0 ? 0 : Math.min(5, Math.max(1, Math.ceil(group.avg) + 1));
  }

  // 3) agent weights
  const agentWeights = {
    qa: { performance: memory.agents.performance.qa, accuracy: memory.agents.accuracy.qa },
    fix: { performance: memory.agents.performance.fix, accuracy: memory.agents.accuracy.fix },
    ux: { performance: memory.agents.performance.ux, accuracy: memory.agents.accuracy.ux },
    perf: { performance: memory.agents.performance.perf, accuracy: memory.agents.accuracy.perf },
    generator: { performance: memory.agents.performance.generator, accuracy: memory.agents.accuracy.generator },
    seo: { performance: memory.agents.performance.seo, accuracy: memory.agents.accuracy.seo },
    smm: { performance: memory.agents.performance.smm, accuracy: memory.agents.accuracy.smm },
    crm: { performance: memory.agents.performance.crm, accuracy: memory.agents.accuracy.crm },
    security: { performance: memory.agents.performance.security, accuracy: memory.agents.accuracy.security },
    conversion: { performance: memory.agents.performance.conversion, accuracy: memory.agents.accuracy.conversion },
    pricing: { performance: memory.agents.performance.pricing, accuracy: memory.agents.accuracy.pricing },
  };

  // 1) + 2) patch priorities over all known patch ids
  const known = new Set<string>();
  for (const bucket of [memory.patches.success, memory.patches.failure, memory.patches.usage]) {
    for (const id of Object.keys(bucket)) known.add(id);
  }
  const patchPriorities = [...known]
    .map((id) => {
      const impact = impactById[id] ?? DEFAULT_IMPACT;
      const rate = patchSuccessRate(memory, id);
      const frequency = memory.patches.usage[id] ?? 0;
      return {
        id,
        impact,
        successRate: Math.round(rate * 100) / 100,
        frequency,
        score: Math.round(impact * rate * Math.max(1, frequency) * 100) / 100,
      };
    })
    .sort(
      (a, b) => b.score - a.score || b.impact - a.impact || a.id.localeCompare(b.id)
    );

  return {
    tunedMaxPasses,
    agentWeights,
    heuristicWeights: { ...memory.heuristics },
    patchPriorities,
  };
}

/**
 * PART 6 — ADVISORY INTELLIGENCE.
 * Converts advisory-class patches into typed, severity-tagged,
 * frequency-ranked Advisory objects. Non-advisory classes and
 * applied advisories are excluded. Sorting: severity → frequency → impact.
 */
export function buildAdvisories(
  patches: ReadonlyArray<PatchLike>,
  memory: GlobalEvolutionMemory = getMemory()
): Advisory[] {
  return patches
    .filter((p) => p.class === "advisory")
    .map((p) => {
      const frequency = memory.patches.usage[p.id] ?? 0;
      const impact = p.impact;
      return {
        type: typeFromKind(p.kind),
        severity: severityFromImpact(impact, frequency),
        message: p.description,
        _frequency: frequency,
        _impact: impact,
        _index: advisoryOrder(p.kind),
      };
    })
    .sort((a, b) => {
      const bySeverity = severityRank(b.severity) - severityRank(a.severity);
      if (bySeverity !== 0) return bySeverity;
      const byFrequency = b._frequency - a._frequency;
      if (byFrequency !== 0) return byFrequency;
      return b._impact - a._impact || a._index - b._index;
    })
    .map(({ type, severity, message }) => ({ type, severity, message }));
}

/** Advisory kinds outside the fixed union map to "contract" (system compliance). */
function typeFromKind(kind: string): Advisory["type"] {
  if (kind === "hierarchy") return "hierarchy";
  if (kind === "perf") return "performance";
  return "contract";
}

function advisoryOrder(kind: string): number {
  if (kind === "hierarchy") return 0;
  if (kind === "contract") return 1;
  if (kind === "perf") return 2;
  return 3;
}

/** Maps a recommendation string to its issue key + severity for ranking. */
const RECOMMENDATION_META: Array<{ key: string; severity: number; pattern: RegExp }> = [
  { key: "a11y-img-alt", severity: 5, pattern: /img|<img|alt/i },
  { key: "a11y-button-type", severity: 4, pattern: /button|type/i },
  { key: "a11y-anchor-rel", severity: 4, pattern: /noopener|noreferrer|_blank|target/i },
  { key: "ux", severity: 4, pattern: /UX|aria-l|accessib/i },
  { key: "token", severity: 3, pattern: /TOKEN|var\(--|hex|hardcoded/i },
  { key: "purity", severity: 3, pattern: /PURITY|primitives|Tailwind/i },
  { key: "perf", severity: 2, pattern: /PERF|cva|duplic/i },
  { key: "hierarchy", severity: 3, pattern: /hierarch|h1/i },
  { key: "contract", severity: 4, pattern: /contract/i },
];

/**
 * Rank recommendations by memory: frequency (issues), impact (severity),
 * success rate. Deterministic; ties keep original order.
 */
export function prioritizeRecommendations(
  recommendations: ReadonlyArray<string>,
  memory: GlobalEvolutionMemory = getMemory()
): Array<{ recommendation: string; priority: number; reason: string }> {
  return recommendations
    .map((recommendation, index) => {
      const meta = RECOMMENDATION_META.find((m) => m.pattern.test(recommendation));
      const key = meta?.key ?? "other";
      const frequency = memory.issues[key] ?? 0;
      const rate = patchSuccessRate(memory, key);
      const priority = Math.round((frequency + 1) * (meta?.severity ?? 1) * (0.5 + rate) * 100) / 100;
      return { recommendation, priority, reason: `${key} freq=${frequency} rate=${rate.toFixed(2)}`, _index: index };
    })
    .sort((a, b) => b.priority - a.priority || a._index - b._index)
    .map(({ recommendation, priority, reason }) => ({ recommendation, priority, reason }));
}