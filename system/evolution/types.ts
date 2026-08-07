/* ==========================================
   DESIGN INTELLIGENCE - GLOBAL EVOLUTION LAYER / TYPES
   Cross-agent memory contracts. Metadata only —
   never code, never randomness, deterministic.
   ========================================== */

export type AgentType =
  | "qa"
  | "fix"
  | "ux"
  | "perf"
  | "generator"
  | "seo"
  | "smm"
  | "crm"
  | "security"
  | "conversion"
  | "pricing";

export type PatchClassRef =
  | "deterministic"
  | "safe"
  | "advisory"
  | "critical"
  | "seo-critical"
  | "security-critical"
  | "conversion-critical";

/** Typed advisory (Part 6). */
export type AdvisoryType = "hierarchy" | "performance" | "contract";
export type AdvisorySeverity = "low" | "medium" | "high";

export interface Advisory {
  type: AdvisoryType;
  severity: AdvisorySeverity;
  message: string;
}

export interface ComponentStats {
  runs: number;
  avgPasses: number;
  avgScore: number;
}

/** Global memory model (Part 1). */
export interface GlobalEvolutionMemory {
  patches: {
    success: Record<string, number>;
    failure: Record<string, number>;
    usage: Record<string, number>;
  };
  agents: {
    /** EMA of per-agent outcome score (0-100). */
    performance: Record<AgentType, number>;
    /** EMA of per-agent "did score improve?" (0-1). */
    accuracy: Record<AgentType, number>;
  };
  components: Record<string, ComponentStats>;
  heuristics: {
    performanceWeight: number;
    uxWeight: number;
    accessibilityWeight: number;
  };
  /** Frequency registry — advisory/issue categories, keyed by patch id or category. */
  issues: Record<string, number>;

  /** A-OS domain intelligence (metadata only). */
  seoPatterns: Record<string, number>;
  securityRisks: Record<string, number>;
  crmSignals: Record<string, number>;
  smmPerformance: Record<string, number>;
  conversionSignals: Record<string, number>;
  productOutcomes: Record<string, number>;
}

/** Backward-compatible alias (fix-agent imports EvolutionMemory). */
export type EvolutionMemory = GlobalEvolutionMemory;

/** Reduced view of a validation result (structural, agent-agnostic). */
export interface ValidationLike {
  errors?: string[];
  tokenUsage?: { valid?: boolean };
  uxScore?: { overall?: number };
  performanceScore?: number;
}

/** Structural input for learnFromRun(context, result) (Part 2). */
export interface LearnContext {
  agentType: AgentType;
  componentName: string;
  componentKind?: string;
  passes?: number;
  patchesApplied?: ReadonlyArray<{ id: string; class?: PatchClassRef }>;
  /** Pre-detected issue keys (e.g. from QA validation + hierarchy). */
  issues?: ReadonlyArray<string>;
}

export interface LearnRunResult {
  scoreBefore?: number;
  scoreAfter?: number;
  /** Agent-specific final score (UX/perf/generator). */
  score?: number;
  errorCountBefore?: number;
  errorCountAfter?: number;
}

export interface LearnSummary {
  agentType: AgentType;
  componentName: string;
  outcome: "success" | "failure" | "neutral";
  recordedIssues: number;
  agentAccuracy: number;
  agentPerformance: number;
}

/** Output of adaptSystem() (Part 3). */
export interface SystemAdaptation {
  tunedMaxPasses: Record<string, number>;
  heuristicWeights: GlobalEvolutionMemory["heuristics"];
  agentWeights: Record<AgentType, { performance: number; accuracy: number }>;
  patchPriorities: Array<{
    id: string;
    impact: number;
    successRate: number;
    frequency: number;
    score: number;
  }>;
}

/** Minimal patch shape accepted by adaptation utilities. */
export interface PatchLike {
  id: string;
  kind: string;
  class: PatchClassRef;
  description: string;
  impact: number;
  confidence?: number;
  successRate?: number;
  frequency?: number;
}
