/* ==========================================
   DESIGN INTELLIGENCE - HIERARCHY ENGINE
   Enforces 5-level visual hierarchy system.
   Validates heading order and visual weight distribution.
   ========================================== */

export interface HierarchyValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}

export function enforceHierarchy(tree: string): HierarchyValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for primary heading
  if (!tree.includes("h1")) {
    errors.push("Missing primary heading (h1). Every page must have exactly one h1.");
  }

  // Check for font-size display (hero)
  if (tree.includes("font-size-9") || tree.includes("font-size-10")) {
    // Display size should only be used for hero
    if (!tree.includes("h1")) {
      warnings.push("Display font size should be paired with h1");
    }
  }

  // Check for proper text color usage
  if (tree.includes("text-[rgb(var(--text-primary))]")) {
    // Good
  } else if (tree.includes("text-[")) {
    warnings.push("Consider using semantic text tokens instead of arbitrary values");
  }

  // Check for weight hierarchy
  const boldCount = (tree.match(/font-bold/g) || []).length;
  const semiboldCount = (tree.match(/font-semibold/g) || []).length;

  if (boldCount > 3) {
    warnings.push("Too many bold elements — reduces hierarchy impact");
  }

  if (semiboldCount > 5) {
    warnings.push("Too many semibold elements — consider using regular weight");
  }

  const score = Math.max(0, 100 - errors.length * 20 - warnings.length * 5);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score,
  };
}

export function validateHeadingOrder(headings: string[]): HierarchyValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  let lastLevel = 0;
  for (const heading of headings) {
    const level = parseInt(heading.replace("h", ""));
    if (level - lastLevel > 1) {
      errors.push(`Heading skip: h${lastLevel} → h${level}`);
    }
    lastLevel = level;
  }

  const score = Math.max(0, 100 - errors.length * 25 - warnings.length * 5);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score,
  };
}
