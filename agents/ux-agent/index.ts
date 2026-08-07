import { evaluateUX, enforceHierarchy, type UXScore } from "@/system";
import { prioritizeRecommendations, learnFromRun, type EvolutionMemory } from "@/system/evolution";

export interface OptimizeLayoutResult {
  uxScores: UXScore;
  suggestions: string[];
  hierarchyFixes: string[];
  hierarchyValid: boolean;
}

const UX_FIX_MAP: Array<{ key: keyof UXScore; fix: string }> = [
  {
    key: "hierarchy",
    fix: "Add an h1 for the page and order headings h1 → h2 → h3; pair display sizes (font-size-9/10) with the h1 only.",
  },
  {
    key: "readability",
    fix: "Constrain text width (max-w-[600px]/[700px]), prefer text-[rgb(var(--text-primary))] / text-secondary, and add leading-* for body copy.",
  },
  {
    key: "accessibility",
    fix: "Add aria-label / role to interactive elements, keep focus-visible:ring-2 with ring-[var(--focus-ring-color)] and a disabled: state.",
  },
  {
    key: "consistency",
    fix: "Reference tokens only — replace hardcoded hex/px with var(--space-*), var(--font-size-*), rgb(var(--color-*)).",
  },
  {
    key: "layoutBalance",
    fix: "Use flex/grid, spacing with the space token family instead of manual margins; align with items-center / justify-between.",
  },
];

export function optimizeLayout(
  componentCode: string,
  memory?: EvolutionMemory
): OptimizeLayoutResult {
  const uxScores = evaluateUX(componentCode);
  const hierarchy = enforceHierarchy(componentCode);

  const suggestions: string[] = [];
  for (const { key, fix } of UX_FIX_MAP) {
    const value = uxScores[key];
    if (value < 70) {
      suggestions.push(`${key} (${value}/100): ${fix}`);
    }
  }
  if (suggestions.length === 0) {
    suggestions.push("Layout scores are healthy — no structural changes required.");
  }

  // PART 7 — prioritize recurring UX issues from memory.
  const ranked = memory ? prioritizeRecommendations(suggestions, memory) : null;
  if (ranked) {
    suggestions.splice(0, suggestions.length, ...ranked.map((r) => r.recommendation));
  }

  // PART 7 — learn from UX runs when memory is supplied.
  if (memory) {
    learnFromRun(
      {
        agentType: "ux",
        componentName: "ux-eval",
        issues: suggestions.map((s) => s.split(" ")[0] ?? "ux"),
      },
      { scoreBefore: 0, scoreAfter: uxScores.overall },
      memory
    );
  }

  return {
    uxScores,
    suggestions,
    hierarchyFixes: [...hierarchy.errors, ...hierarchy.warnings],
    hierarchyValid: hierarchy.valid,
  };
}