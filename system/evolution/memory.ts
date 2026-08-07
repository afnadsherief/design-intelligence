/* ==========================================
   DESIGN INTELLIGENCE - GLOBAL EVOLUTION MEMORY
   Lightweight, deterministic, metadata-only store.
   No external DB, no code retention, no I/O.
   ========================================== */

import type { AgentType, GlobalEvolutionMemory } from "./types";

export function createEmptyMemory(): GlobalEvolutionMemory {
  return {
    patches: { success: {}, failure: {}, usage: {} },
    agents: {
      performance: { qa: 0, fix: 0, ux: 0, perf: 0, generator: 0, seo: 0, smm: 0, crm: 0, security: 0, conversion: 0, pricing: 0 },
      accuracy: { qa: 0, fix: 0, ux: 0, perf: 0, generator: 0, seo: 0, smm: 0, crm: 0, security: 0, conversion: 0, pricing: 0 },
    },
    components: {},
    heuristics: {
      performanceWeight: 1,
      uxWeight: 1,
      accessibilityWeight: 1,
    },
    issues: {},
    seoPatterns: {},
    securityRisks: {},
    crmSignals: {},
    smmPerformance: {},
    conversionSignals: {},
    productOutcomes: {},
  };
}

let store: GlobalEvolutionMemory = createEmptyMemory();

export const getMemory = (): GlobalEvolutionMemory => store;
export const resetMemory = (): void => {
  store = createEmptyMemory();
};

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Simple deterministic exponential moving average. */
export function ema(current: number, sample: number, alpha = 0.5): number {
  return current === 0 ? sample : round2(current * (1 - alpha) + sample * alpha);
}

export function incrementPatches(memory: GlobalEvolutionMemory, id: string): void {
  memory.patches.usage[id] = (memory.patches.usage[id] ?? 0) + 1;
}

export function recordPatchOutcome(
  memory: GlobalEvolutionMemory,
  id: string,
  outcome: "success" | "failure"
): void {
  const bucket = outcome === "success" ? memory.patches.success : memory.patches.failure;
  bucket[id] = (bucket[id] ?? 0) + 1;
}

export function patchSuccessRate(memory: GlobalEvolutionMemory, id: string): number {
  const success = memory.patches.success[id] ?? 0;
  const failure = memory.patches.failure[id] ?? 0;
  return success + failure === 0 ? 0.5 : success / (success + failure);
}

export function patchStats(
  memory: GlobalEvolutionMemory,
  id: string
): { success: number; failure: number; usage: number } {
  return {
    success: memory.patches.success[id] ?? 0,
    failure: memory.patches.failure[id] ?? 0,
    usage: memory.patches.usage[id] ?? 0,
  };
}

export function incrementIssue(memory: GlobalEvolutionMemory, key: string): void {
  memory.issues[key] = (memory.issues[key] ?? 0) + 1;
}

/** Record a domain-specific signal (seoPatterns/securityRisks/...). */
export function recordDomainSignal(
  memory: GlobalEvolutionMemory,
  domain: "seo" | "security" | "crm" | "smm" | "conversion" | "pricing",
  key: string
): void {
  const target =
    domain === "seo"
      ? memory.seoPatterns
      : domain === "security"
        ? memory.securityRisks
        : domain === "crm"
          ? memory.crmSignals
          : domain === "smm"
            ? memory.smmPerformance
            : domain === "conversion"
              ? memory.conversionSignals
              : memory.productOutcomes;
  target[key] = (target[key] ?? 0) + 1;
}

export function recordAgentOutcome(
  memory: GlobalEvolutionMemory,
  agentType: AgentType,
  score: number,
  improved: boolean
): void {
  memory.agents.performance[agentType] = ema(memory.agents.performance[agentType], clamp(score, 0, 100));
  memory.agents.accuracy[agentType] = ema(memory.agents.accuracy[agentType], improved ? 1 : 0);
}

export function recordComponentRun(
  store: GlobalEvolutionMemory,
  component: string,
  passes: number,
  score: number
): void {
  if (passes <= 0) passes = 1;
  const prev = store.components[component];
  if (!prev) {
    store.components[component] = { runs: 1, avgPasses: passes, avgScore: score };
    return;
  }
  const runs = prev.runs + 1;
  store.components[component] = {
    runs,
    avgPasses: (prev.avgPasses * prev.runs + passes) / runs,
    avgScore: (prev.avgScore * prev.runs + score) / runs,
  };
}

/** Import guard: keeps helper signatures stable without leaking store type. */
export type GlobalMemoryMetrics = GlobalEvolutionMemory;
export type MemoryStore = GlobalEvolutionMemory;