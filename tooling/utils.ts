/* ==========================================
   DESIGN INTELLIGENCE - TOOLING UTILITIES
   Reusable utilities + runtime validation +
   contract enforcement + composite purity.
   ========================================== */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { classifyComponent, type ComponentKind } from "@/system/types/component-kind";

/**
 * Merge class names with Tailwind CSS deduplication.
 * Use this for ALL className composition.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * @deprecated Use ESLint rules from governance instead
 * Validates that a component uses only design tokens.
 * Detects: raw Tailwind values, hardcoded numbers, missing var(--token), inline styles.
 */
export function validateTokenUsage(className: string): { valid: boolean; violations: string[] } {
  const violations: string[] = [];

  if (/\d+px/.test(className)) violations.push("Hardcoded px value detected");
  if (/\d+rem/.test(className)) violations.push("Hardcoded rem value detected");
  if (/\d+em/.test(className)) violations.push("Hardcoded em value detected");
  if (/#[0-9a-fA-F]{3,8}/.test(className)) violations.push("Hardcoded hex color detected");
  if (/rgb\(\d/.test(className) && !/rgb\(var\(/.test(className)) violations.push("Hardcoded RGB color detected");

  const hasTokenRef = /var\(--/.test(className) || /rgb\(var\(/.test(className);
  const hasArbitrary = /\[.*\]/.test(className);

  if (!hasTokenRef && hasArbitrary) {
    violations.push("No design token usage detected — use var(--token) or rgb(var(--token))");
  }

  if (/style\s*=/.test(className)) violations.push("Inline styles detected — use className with tokens");

  return { valid: violations.length === 0, violations };
}

/**
 * Enforce a component contract at runtime.
 * Validates requiredProps, blocks forbidden patterns, enforces token usage.
 */
export function enforceContract(
  props: Record<string, unknown>,
  contract: { requiredProps: string[]; forbidden: string[] }
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];

  // Validate required props
  contract.requiredProps.forEach((prop) => {
    if (!(prop in props)) {
      violations.push(`Missing required prop: "${prop}"`);
    }
  });

  // Check for forbidden patterns in props
  const propsStr = JSON.stringify(props);
  contract.forbidden.forEach((pattern) => {
    if (propsStr.includes(pattern)) {
      violations.push(`Forbidden pattern detected: "${pattern}"`);
    }
  });

  return { valid: violations.length === 0, violations };
}

/**
 * Validate composite component purity.
 * Composites/products MUST use ONLY primitives, layouts, and tokens.
 * Kind-aware: primitives and layouts skip the primitive-import check,
 * and @/system imports count as valid primitive access.
 */
export function validateCompositePurity(
  code: string,
  kind?: ComponentKind
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];
  const actualKind = kind ?? classifyComponent("", code);

  // Check for direct styling (not via primitives)
  const forbiddenStyles = [
    "bg-blue-", "bg-red-", "bg-green-", "bg-gray-",
    "text-blue-", "text-red-", "text-green-", "text-gray-",
    "border-blue-", "border-red-", "border-green-",
    "p-", "px-", "py-", "m-", "mx-", "my-",
    "rounded-", "shadow-", "w-", "h-",
  ];

  for (const style of forbiddenStyles) {
    if (code.includes(style) && !code.includes("rgb(var(") && !code.includes("var(--")) {
      violations.push(`Direct Tailwind class detected: "${style}" — use primitives only`);
    }
  }

  // Check for hardcoded values
  if (/#[0-9a-fA-F]{3,8}/.test(code)) violations.push("Hardcoded hex color in composite");
  if (/\d+px/.test(code)) violations.push("Hardcoded px value in composite");

  // Check for new styling patterns (should inherit from primitives).
  // Only composites/products must import primitives — primitives and
  // layouts themselves are exempt.
  const isComposite = actualKind === "composite" || actualKind === "product";
  if (isComposite) {
    const hasPrimitiveImport =
      /from\s+["']\.\.\/primitives\//.test(code) ||
      /from\s+["']\.\.\/layouts\//.test(code) ||
      /from\s+["']@\/system["']/.test(code);
    if (!hasPrimitiveImport && code.includes("className")) {
      violations.push("Composite does not import from primitives — use primitives only");
    }
  }

  return { valid: violations.length === 0, violations };
}

/**
 * Check if a value is a valid design token reference.
 */
export function isTokenReference(value: string): boolean {
  return /^var\(--[a-z0-9-]+\)$/.test(value);
}

/**
 * Extract token name from a var() reference.
 */
export function extractTokenName(value: string): string | null {
  const match = value.match(/^var\((--[a-z0-9-]+)\)$/);
  return match ? match[1] : null;
}
