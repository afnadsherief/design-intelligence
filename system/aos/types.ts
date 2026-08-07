/* ==========================================
   A-OS v1 — GLOBAL SELF-EVOLVING COMPANY OS
   Core contracts for the multi-agent orchestrator.
   Deterministic only. Metadata only. No randomness.
   ========================================== */

import type { AgentType, SystemAdaptation } from "@/system/evolution";
import type { PatchClass } from "@/agents/design-qa/patches";
import type { CompanyConfig } from "@/system/company/loader";

export type Domain =
  | "design"
  | "ux"
  | "performance"
  | "seo"
  | "smm"
  | "crm"
  | "security"
  | "conversion"
  | "pricing";

export type Severity = "low" | "medium" | "high" | "critical";

/** A single finding from one agent. */
export interface Issue {
  type: string;
  domain: Domain;
  severity: Severity;
  /** Observed frequency from memory (0 when unseen). */
  frequency: number;
  /** Static impact weight 0-10. */
  impact: number;
  /** Agent confidence 0-1. */
  confidence: number;
  sourceAgent: AgentType;
  detail: string;
  /** Optional patch capable of resolving this issue. */
  patchId?: string;
}

/** Unified issue graph — issues deduped by type across agents. */
export interface IssueGraphNode {
  type: string;
  domains: Domain[];
  sourceAgents: AgentType[];
  severity: Severity;
  frequency: number;
  impact: number;
  confidence: number;
  detail: string;
  patchId?: string;
  /** Cross-agent reinforcement multiplier (>=1). */
  reinforcement: number;
  /** priority = impact * confidence * successRate * frequency. */
  priority: number;
  successRate: number;
}

/** Rule-based domain agent contract. */
export interface AgentEvaluator {
  readonly id: AgentType;
  readonly domain: Domain;
  evaluate(source: string, context?: unknown): { score: number; issues: Issue[] };
}

/** A-OS output payload. */
export interface AosResult {
  component: string;
  finalCode: string;
  validation: Record<string, number>;
  score: number;
  passes: number;
  appliedPatches: Array<{ id: string; class: PatchClass }>;
  issueGraph: IssueGraphNode[];
  advisories: Array<{ type: string; severity: Severity; message: string }>;
  evolutionDelta: {
    issuesAdded: number;
    patchesApplied: number;
    componentsUpdated: string[];
    agentsUpdated: AgentType[];
    domainSignals: Record<string, number>;
  };
  systemAdaptations: SystemAdaptation;
  company?: CompanyConfig;
}