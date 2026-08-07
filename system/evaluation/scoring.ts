/* ==========================================
   DESIGN INTELLIGENCE - EVALUATION SYSTEM
   Scores UI components against design principles.
   Formula: (tokenUsage + accessibility + performance + consistency) / 4
   Output: 0-100 score.
   ========================================== */

export function score(metrics: {
  tokenUsage: number;
  accessibility: number;
  performance: number;
  consistency: number;
}): number {
  const { tokenUsage, accessibility, performance, consistency } = metrics;
  return Math.round((tokenUsage + accessibility + performance + consistency) / 4);
}

export type Score = {
  tokenUsage: number;
  accessibility: number;
  performance: number;
  consistency: number;
};

export type EvaluationResult = {
  component: string;
  scores: Score;
  total: number;
  grade: "A" | "B" | "C" | "D" | "F";
  issues: string[];
  recommendations: string[];
};

export function evaluate(scores: Score): EvaluationResult {
  const total = score(scores);

  const grade = total >= 90 ? "A" : total >= 80 ? "B" : total >= 70 ? "C" : total >= 60 ? "D" : "F";

  const issues: string[] = [];
  const recommendations: string[] = [];

  if (scores.tokenUsage < 70) {
    issues.push("Token usage issues — hardcoded values detected");
    recommendations.push("Replace all hardcoded values with design tokens (var(--token))");
  }
  if (scores.accessibility < 70) {
    issues.push("Accessibility issues — keyboard, screen reader, or focus problems");
    recommendations.push("Add ARIA labels, focus indicators, semantic HTML. Target WCAG 2.1 AA");
  }
  if (scores.performance < 70) {
    issues.push("Performance issues — excessive variants or class duplication");
    recommendations.push("Reduce variant count, reuse tokens, monitor bundle size");
  }
  if (scores.consistency < 70) {
    issues.push("Inconsistent patterns — similar components look different");
    recommendations.push("Use the same tokens and variants for similar patterns across the system");
  }

  return {
    component: "",
    scores,
    total,
    grade,
    issues,
    recommendations,
  };
}

export function evaluateComponent(componentName: string, scores: Score): EvaluationResult {
  const result = evaluate(scores);
  result.component = componentName;
  return result;
}

export function scoreComponent(componentName: string, scores: Score): Scorecard {
  return {
    component: componentName,
    tokenUsage: scores.tokenUsage,
    accessibility: scores.accessibility,
    performance: scores.performance,
    consistency: scores.consistency,
    overall: score(scores),
  };
}

export type Scorecard = {
  component: string;
  tokenUsage: number;
  accessibility: number;
  performance: number;
  consistency: number;
  overall: number;
};

export function passThreshold(scores: Score, threshold: number = 70): boolean {
  return (
    scores.tokenUsage >= threshold &&
    scores.accessibility >= threshold &&
    scores.performance >= threshold &&
    scores.consistency >= threshold
  );
}
