/* ==========================================
   DESIGN INTELLIGENCE - openDesign() VALIDATOR
   Master validation function for ALL components.
   Checks: token usage, contract, purity, UX, performance.
   FAIL = INVALID OUTPUT
   ========================================== */

import { validateTokenUsage, validateCompositePurity } from "@/tooling/utils";
import { getContract } from "../contracts/component-contracts";
import { score } from "../evaluation/scoring";
import { evaluateUX } from "../intelligence/ux-evaluator";
import { enforceHierarchy } from "../intelligence/hierarchy-engine";
import { scorePerformance } from "./performance";
import { classifyComponent } from "../types/component-kind";

export interface ValidationResult {
  component: string;
  valid: boolean;
  tokenUsage: { valid: boolean; violations: string[] };
  contract: { valid: boolean; violations: string[] };
  compositePurity: { valid: boolean; violations: string[] };
  uxScore: { overall: number; grade: string };
  performanceScore: number;
  errors: string[];
}

export function openDesign(componentName: string, code: string, props?: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  // 1. Token usage validation
  const tokenResult = validateTokenUsage(code);
  if (!tokenResult.valid) {
    errors.push(...tokenResult.violations.map((v) => `TOKEN: ${v}`));
  }

  // 2. Contract validation
  const contract = getContract(componentName);
  let contractResult: { valid: boolean; violations: string[] } = { valid: true, violations: [] };
  if (contract && props) {
    contractResult = { valid: true, violations: [] };
    contract.requiredProps.forEach((prop) => {
      if (!(prop in props)) contractResult.violations.push(`Missing: ${prop}`);
    });
  }
  if (!contractResult.valid) {
    errors.push(...contractResult.violations.map((v) => `CONTRACT: ${v}`));
  }

  // 3. Composite purity validation (kind-aware)
  const purityResult = validateCompositePurity(code, classifyComponent(componentName, code));
  if (!purityResult.valid) {
    errors.push(...purityResult.violations.map((v) => `PURITY: ${v}`));
  }

  // 4. UX score
  const ux = evaluateUX(code);
  if (ux.overall < 60) {
    errors.push(`UX: Score ${ux.overall} below threshold (60)`);
  }

  // 5. Performance score (shared heuristic)
  const performanceScore = scorePerformance(code).score;
  if (performanceScore < 50) {
    errors.push(`PERF: Score ${performanceScore} below threshold (50)`);
  }

  const valid = errors.length === 0;

  return {
    component: componentName,
    valid,
    tokenUsage: tokenResult,
    contract: contractResult,
    compositePurity: purityResult,
    uxScore: { overall: ux.overall, grade: ux.overall >= 80 ? "A" : ux.overall >= 60 ? "B" : "C" },
    performanceScore: Math.round(performanceScore),
    errors,
  };
}
