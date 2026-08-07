/* ==========================================
   DESIGN INTELLIGENCE - UX EVALUATOR
   Evaluates components against UX laws + hierarchy.
   Includes: visual hierarchy scoring, readability,
   accessibility, layout balance detection.
   ========================================== */

export interface UXScore {
  hierarchy: number;
  readability: number;
  accessibility: number;
  consistency: number;
  layoutBalance: number;
  overall: number;
}

export function evaluateUX(component: string): UXScore {
  const hierarchy = evaluateHierarchy(component);
  const readability = evaluateReadability(component);
  const accessibility = evaluateAccessibility(component);
  const consistency = evaluateConsistency(component);
  const layoutBalance = evaluateLayoutBalance(component);

  const overall = Math.round((hierarchy + readability + accessibility + consistency + layoutBalance) / 5);

  return { hierarchy, readability, accessibility, consistency, layoutBalance, overall };
}

function evaluateHierarchy(component: string): number {
  let score = 50;

  // 5-level heading hierarchy
  if (component.includes("h1")) score += 15;
  if (component.includes("h2")) score += 10;
  if (component.includes("h3")) score += 5;
  if (component.includes("h4")) score += 5;

  // Visual weight
  if (component.includes("font-bold")) score += 5;
  if (component.includes("font-semibold")) score += 5;
  if (component.includes("tracking-tight")) score += 5;
  if (component.includes("text-[var(--font-size-9)]")) score += 5;

  return Math.min(score, 100);
}

function evaluateReadability(component: string): number {
  let score = 60;

  // Proper text colors
  if (component.includes("text-[rgb(var(--text-primary))]")) score += 10;
  if (component.includes("text-[rgb(var(--text-secondary))]")) score += 5;

  // Line length constraints
  if (component.includes("max-w-[600px]") || component.includes("max-w-[700px]")) score += 10;

  // Line height
  if (component.includes("leading-")) score += 5;

  // Component size (smaller = more readable)
  if (component.length < 500) score += 5;

  return Math.min(score, 100);
}

function evaluateAccessibility(component: string): number {
  let score = 40;

  // ARIA attributes
  if (component.includes("aria-")) score += 15;
  if (component.includes("role=")) score += 10;
  if (component.includes("aria-label")) score += 10;

  // Structural safety (aligned with Fix Agent auto-fixes):
  // a11y patches must move the accessibility score.
  if (/\balt=/.test(component)) score += 5;
  if (/\btype="button"/.test(component)) score += 5;
  if (/rel="noopener/.test(component)) score += 5;

  // Focus management
  if (component.includes("focus-visible:")) score += 10;
  if (component.includes("focus:")) score += 5;

  // Disabled states
  if (component.includes("disabled:")) score += 5;

  // Semantic HTML
  if (component.includes("<nav")) score += 5;
  if (component.includes("<form")) score += 5;

  return Math.min(score, 100);
}

function evaluateConsistency(component: string): number {
  let score = 50;

  // Token usage
  if (component.includes("var(--")) score += 20;
  if (component.includes("rgb(var(")) score += 10;

  // No hardcoded values
  if (!component.includes("#")) score += 5;
  if (!component.match(/\d+px/)) score += 5;
  if (!component.match(/bg-(blue|red|green|gray)-/)) score += 5;

  return Math.min(score, 100);
}

function evaluateLayoutBalance(component: string): number {
  let score = 60;

  // Flexbox/Grid usage
  if (component.includes("flex")) score += 10;
  if (component.includes("grid")) score += 10;

  // Spacing consistency
  if (component.includes("gap-[var(--")) score += 10;
  if (component.includes("space-y-")) score += 5;

  // Centering
  if (component.includes("items-center")) score += 5;
  if (component.includes("justify-between")) score += 5;

  return Math.min(score, 100);
}
