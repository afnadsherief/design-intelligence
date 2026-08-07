/* ==========================================
   DESIGN INTELLIGENCE - GLOBAL EXECUTION PIPELINE
   input → QA → Fix (multi-pass) → Learn → Adapt → Output
   Works for any component; memory drives later runs.
   ========================================== */

import { designQAAgent } from "@/agents/design-qa/design-qa-agent";
import { applyFixes } from "@/agents/design-qa/fix-agent";
import { qualityScore, learnFromRun, detectIssueKeys } from "./learn";
import { adaptSystem } from "./adapt";
import { getMemory } from "./memory";
import { coreAgents } from "@/system/org/registry";
import { buildExecutionDoc, writeExecutionDoc } from "@/system/docs/obsidian";
import type { GlobalEvolutionMemory, SystemAdaptation } from "./types";

export interface PipelineOptions {
  memory?: GlobalEvolutionMemory;
  logPasses?: boolean;
  /** Per-execution domain tag used in the Obsidian log. */
  domain?: string;
}

export interface PipelineResult {
  component: string;
  code: string;
  valid: boolean;
  score: number;
  passCount: number;
  applies: { appliedPatches: Array<{ id: string; class: string }> };
  adapt: SystemAdaptation;
  advisories: Array<{ type: string; severity: string; message: string }>;
  /** Obsidian markdown execution log (enforced — Merlin guarantee). */
  documentation: string;
  documentationPath: string;
}

/**
 * PART 8 — GLOBAL PIPELINE
 * QA agent → Fix agent (memory-aware) → Learn (persist) → Adapt (tune).
 */
export function runPipeline(
  componentName: string,
  source: string,
  props?: Record<string, unknown>,
  options: PipelineOptions = {}
): PipelineResult {
  const memory = options.memory ?? getMemory();
  const logPasses = options.logPasses ?? false;

  // 1) QA
  const qa = designQAAgent(componentName, source, props, memory);

  // 2) Fix (multi-pass, memory-aware, loggable)
  const fix = applyFixes(componentName, source, props, { memory, logPasses });

  // 3) Learn
  learnFromRun(
    {
      agentType: "fix",
      componentName,
      componentKind: fix.kind,
      passes: fix.passCount,
      patchesApplied: fix.appliedPatches.map((p) => ({ id: p.id, class: p.class as "advisory" | "safe" | "deterministic" })),
      issues: detectIssueKeys(source, fix.validationBefore.errors),
    },
    { scoreBefore: qualityScore(fix.validationBefore), scoreAfter: qualityScore(fix.validationAfter) },
    memory
  );

  // 4) Adapt (with the real catalog of applied patch impacts)
  const adapt = adaptSystem(memory, fix.appliedPatches.map((p) => ({ id: p.id, impact: p.impact ?? 5 })));

  const result: PipelineResult = {
    component: componentName,
    code: fix.code ?? source,
    valid: fix.validationAfter.valid,
    score: qualityScore(fix.validationAfter),
    passCount: fix.passCount,
    applies: { appliedPatches: fix.appliedPatches.map((p) => ({ id: p.id, class: p.class })) },
    adapt,
    advisories: fix.advisories,
    documentation: "",
    documentationPath: "",
  };

  // 5) Obsidian documentation (enforced on every execution).
  const docContext = {
    domain: options.domain,
    memory,
    agents: coreAgents().map((a) => a.name),
  };
  result.documentation = buildExecutionDoc(result, docContext);
  result.documentationPath = writeExecutionDoc(result, docContext);

  return result;
}