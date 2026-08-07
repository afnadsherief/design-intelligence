/* ==========================================
   A-OS — MERLIN (CHIEF ORCHESTRATOR)
   Receives execution input → routes through
   runPipeline() → coordinates org agents → applies
   Hermes skills for decisions → enforces Obsidian
   documentation. Merlin NEVER mutates code and NEVER
   bypasses the orchestrator.
   ========================================== */

import { runPipeline, type PipelineResult } from "@/system/evolution/core";
import type { GlobalEvolutionMemory } from "@/system/evolution/types";
import { agentsForRoles } from "@/system/org/registry";
import { invokeSkill } from "@/system/hermes/index";
import { loadCompany, type CompanyConfig } from "@/system/company/loader";

export interface MerlinInput {
  component: string;
  code: string;
  props?: Record<string, unknown>;
  domain?: string;
  memory?: GlobalEvolutionMemory;
  logPasses?: boolean;
  runHermes?: boolean;
  companyId?: string;
}

export interface MerlinResult extends PipelineResult {
  orgAgents: string[];
  skills: Record<string, unknown>;
  company?: CompanyConfig;
}

/** Deterministic core-team invoked for every run. */
const CORE_ROLES = ["QA", "UX", "Performance", "Fix", "Evolution"];

export interface MerlinContext {
  company?: CompanyConfig;
}

export const merlin = {
  /**
   * Route one execution: pipeline → agents → skills → docs.
   * Deterministic; documentation is guaranteed on the result.
   * context.company carries the active company (optional).
   */
  execute(input: MerlinInput, context?: MerlinContext): MerlinResult {
    const companyFromId = input.companyId ? loadCompany(input.companyId) : undefined;
    const company = context?.company ?? companyFromId;

    const result = runPipeline(input.component, input.code, input.props ?? {}, {
      memory: input.memory,
      logPasses: input.logPasses ?? false,
      domain: input.domain ?? company?.domain,
    });

    const orgAgents = ["Merlin", ...agentsForRoles(CORE_ROLES)];
    const skills: Record<string, unknown> =
      input.runHermes === false
        ? {}
        : {
            PatternEye: invokeSkill("PatternEye", { code: result.code }),
            RankedPriorities: invokeSkill("Ranker", {
              items: result.adapt.patchPriorities.map((p) => ({
                id: p.id,
                impact: p.impact ?? 5,
                confidence: 1,
                successRate: p.successRate ?? 0.5,
                frequency: p.frequency ?? 0,
              })),
            }),
          };

    return { ...result, orgAgents, skills, company };
  },
};

/** Merlin guarantee — every execution must carry documentation. */
export function isDocumented(result: PipelineResult): boolean {
  return typeof result.documentation === "string" && result.documentation.length > 0;
}