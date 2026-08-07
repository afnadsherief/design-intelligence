import {
  openDesign,
  evaluateUX,
  enforceHierarchy,
  scoreComponent,
  type ValidationResult,
  type HierarchyValidation,
  type UXScore,
} from "@/system";
import {
  learnFromRun,
  qualityScore,
  buildAdvisories,
  type EvolutionMemory,
  type Advisory,
} from "@/system/evolution";
import { buildUserPrompt, DESIGN_SYSTEM_PROMPT } from "./prompts";

export interface DesignQAAgentResult {
  component: string;
  valid: boolean;
  issues: string[];
  score: {
    tokenUsage: number;
    accessibility: number;
    performance: number;
    consistency: number;
    overall: number;
  };
  ux: UXScore;
  hierarchy: HierarchyValidation;
  recommendations: string[];
  advisories: Advisory[];
  promptContext: { systemPrompt: string; userPrompt: string };
}

const ACCESSIBILITY_SCORE_MAP: Record<string, number> = {
  default: 85,
  destructive: 80,
  outline: 82,
  secondary: 82,
  ghost: 80,
  link: 75,
};

function metricScores(
  componentName: string,
  validation: ValidationResult,
  ux: UXScore,
  memory?: EvolutionMemory
) {
  const metrics = {
    tokenUsage: validation.tokenUsage.valid ? 95 : 40,
    accessibility: Math.round(
      (ux.accessibility +
        (ACCESSIBILITY_SCORE_MAP[componentName] ??
          ACCESSIBILITY_SCORE_MAP["default"])) /
        2
    ),
    performance: validation.performanceScore,
    consistency: ux.consistency,
  };

  if (!memory) return metrics;

  // PART 7 — dynamic scoring importance from learned heuristic weights.
  const d = (v: number, w: number) => Math.round(v * (0.5 + w / 2));
  return {
    tokenUsage: metrics.tokenUsage,
    accessibility: Math.min(100, d(metrics.accessibility, memory.heuristics.accessibilityWeight)),
    performance: Math.min(100, d(metrics.performance, memory.heuristics.performanceWeight)),
    consistency: Math.min(100, d(metrics.consistency, memory.heuristics.uxWeight)),
  };
}

function buildRecommendations(
  validation: ValidationResult,
  hierarchy: HierarchyValidation
): string[] {
  const recommendations: string[] = [];

  for (const error of validation.errors) {
    if (error.startsWith("TOKEN:")) {
      recommendations.push(
        "Replace the hardcoded value with a token — use var(--space-*), var(--font-size-*), or rgb(var(--color-*))."
      );
    } else if (error.startsWith("CONTRACT:")) {
      recommendations.push(
        `Contract violation: ${error.slice(9)}. Validate this component against system/contracts/component-contracts.`
      );
    } else if (error.startsWith("PURITY:")) {
      recommendations.push(
        "Avoid styling directly — compose from @/system primitives (Button, Input, Card) instead of raw Tailwind classes."
      );
    } else if (error.startsWith("UX:")) {
      recommendations.push(
        "UX score too low — add semantic HTML, focus-visible rings, and ARIA where interactions exist."
      );
    } else if (error.startsWith("PERF:")) {
      recommendations.push(
        "Reduce class duplication — extract variant classes into a cva() config and reuse existing component tokens."
      );
    }
  }

  for (const warning of hierarchy.warnings) {
    recommendations.push(warning);
  }

  return recommendations;
}

export function designQAAgent(
  componentName: string,
  source: string,
  props?: Record<string, unknown>,
  memory?: EvolutionMemory
): DesignQAAgentResult {
  const validation: ValidationResult = openDesign(componentName, source, props);
  const ux = evaluateUX(source);
  const hierarchy = enforceHierarchy(source);

  const metrics = metricScores(componentName, validation, ux, memory);
  const scorecard = scoreComponent(componentName, metrics);
  const recommendations = buildRecommendations(validation, hierarchy);

  // PART 6 — structured advisories for QA findings.
  const advisoryPatches = [
    ...hierarchy.errors.map((e) => ({
      id: `hier-err-${e.length}`,
      kind: "hierarchy",
      class: "advisory" as const,
      description: `Hierarchy: ${e}`,
      impact: 5,
    })),
    ...hierarchy.warnings.map((w) => ({
      id: `hier-warn-${w.length}`,
      kind: "hierarchy",
      class: "advisory" as const,
      description: w,
      impact: 3,
    })),
    ...validation.errors.map((e) => {
      const t = e.split(":")[0].trim();
      return {
        id: `qa-${e.length}`,
        kind: t === "PERF" ? "perf" : t === "CONTRACT" ? "contract" : t === "PURITY" ? "contract" : "contract",
        class: "advisory" as const,
        description: e,
        impact: t === "CONTRACT" ? 5 : t === "PERF" ? 3 : 4,
      };
    }),
  ];
  const advisories = memory ? buildAdvisories(advisoryPatches, memory) : buildAdvisories(advisoryPatches);

  // PART 7 — remember QA findings when memory is supplied.
  if (memory) {
    learnFromRun(
      {
        agentType: "qa",
        componentName,
        issues: [
          ...new Set([
            ...validation.errors.map((e) => e.split(":")[0].trim().toLowerCase()),
            ...(hierarchy.errors.length ? ["hierarchy"] : []),
          ]),
        ],
      },
      { scoreBefore: 0, scoreAfter: qualityScore(validation) },
      memory
    );
  }

  return {
    component: componentName,
    valid: validation.valid,
    issues: validation.errors,
    score: {
      tokenUsage: scorecard.tokenUsage,
      accessibility: scorecard.accessibility,
      performance: scorecard.performance,
      consistency: scorecard.consistency,
      overall: scorecard.overall,
    },
    ux,
    hierarchy,
    recommendations,
    advisories,
    promptContext: {
      systemPrompt: DESIGN_SYSTEM_PROMPT,
      userPrompt: buildUserPrompt(componentName, source, validation),
    },
  };
}