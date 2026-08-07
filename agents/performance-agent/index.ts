import { scorePerformance } from "@/system/evaluation/performance";
import { learnFromRun, type EvolutionMemory } from "@/system/evolution";

export interface PerformanceAnalysis {
  score: number;
  bottlenecks: string[];
  suggestions: string[];
  metrics: {
    sourceLength: number;
    classNameCount: number;
    variantCount: number;
    perfPenalty: number;
  };
}

/**
 * Uses the shared scorePerformance() heuristic (semantic + performance.ts)
 * and adds bottleneck hints. When memory is passed, the reported score is
 * refined by the learned performance weight (deterministic, part 7).
 */
export function analyzePerformance(
  componentCode: string,
  memory?: EvolutionMemory
): PerformanceAnalysis {
  const classNameCount = (componentCode.match(/className/g) || []).length;
  const variantCount = (componentCode.match(/variant["']?\s*[:=]/g) || []).length;
  const { score } = scorePerformance(componentCode);
  const perfPenalty = 100 - score;

  // PART 7 — dynamically refine score using the learned performance weight.
  const refined = memory
    ? Math.max(0, Math.min(100, Math.round(score * (0.5 + memory.heuristics.performanceWeight / 2))))
    : score;

  const bottlenecks: string[] = [];
  const suggestions: string[] = [];

  if (componentCode.length > 1500) {
    bottlenecks.push(`Large source (${componentCode.length} chars) — heavy for SSR/server components.`);
    suggestions.push("Split the component; extract sub-sections into smaller primitives.");
  }
  if (classNameCount > 4) {
    bottlenecks.push(`${classNameCount} className occurrences — repeated class strings are re-merged at runtime.`);
    suggestions.push("Move repeated classes into cva() variant config; rely on cn() merging.");
  }
  if (variantCount > 4) {
    bottlenecks.push(`${variantCount} variant branches — more branches mean more class permutations.`);
    suggestions.push("Trim the variant map to the used variants; add variants only when a product needs them.");
  }
  if (score < 50) {
    bottlenecks.push(`Performance heuristic score ${score} is below the 50 threshold used by openDesign().`);
  }
  if (bottlenecks.length === 0) {
    suggestions.push("No major bottlenecks detected — consider prefetching adjacent route data.");
  }

  // PART 7 — learn from performance runs when memory is supplied.
  if (memory) {
    learnFromRun(
      { agentType: "perf", componentName: "perf-eval" },
      { scoreBefore: 0, scoreAfter: refined },
      memory
    );
  }

  return {
    score: refined,
    bottlenecks,
    suggestions,
    metrics: {
      sourceLength: componentCode.length,
      classNameCount,
      variantCount,
      perfPenalty,
    },
  };
}