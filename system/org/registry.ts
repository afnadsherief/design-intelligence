/* ==========================================
   A-OS — HIERARCHICAL AGENT REGISTRY
   Tier 1 executives, Tier 2 core, Tier 3 domain.
   Deterministic fixed order. Metadata only.
   ========================================== */

import type { AgentType } from "@/system/evolution";
import type { Issue, AgentEvaluator } from "@/system/aos/types";
import { DOMAIN_AGENTS } from "@/system/aos/agents";

export type Tier = 1 | 2 | 3;

export interface OrgAgent {
  name: string;
  role: string;
  domain: string;
  tier: Tier;
  deterministic: true;
  priority: number;
  evaluate?: (source: string) => { score: number; issues: Issue[] };
}

const evaluatorFor = (agent: AgentEvaluator | undefined) =>
  agent ? (source: string) => agent.evaluate(source) : undefined;

const DOMAIN_SPECS: Array<[string, string, AgentType, number]> = [
  ["Atlas", "SEO", "seo", 1],
  ["Aegis", "Security", "security", 2],
  ["Nexus", "CRM", "crm", 3],
  ["Viral", "SMM", "smm", 4],
  ["Convert", "Product", "conversion", 5],
  ["Margin", "Pricing", "pricing", 6],
];

const EXECUTIVE: OrgAgent[] = [
  { name: "Astra", role: "CEO — strategy & prioritization", domain: "strategy", tier: 1, deterministic: true, priority: 1 },
  { name: "Forge", role: "CTO — architecture & infrastructure", domain: "architecture", tier: 1, deterministic: true, priority: 2 },
  { name: "Pulse", role: "CMO — marketing & SMM", domain: "marketing", tier: 1, deterministic: true, priority: 3 },
  { name: "Ledger", role: "CFO — pricing & cost", domain: "finance", tier: 1, deterministic: true, priority: 4 },
];

const CORE: OrgAgent[] = [
  { name: "Merlin", role: "Chief Orchestrator", domain: "core", tier: 2, deterministic: true, priority: 1 },
  { name: "Sentinel", role: "QA validation", domain: "qa", tier: 2, deterministic: true, priority: 2 },
  { name: "Flow", role: "UX optimization", domain: "ux", tier: 2, deterministic: true, priority: 3 },
  { name: "Volt", role: "Performance", domain: "perf", tier: 2, deterministic: true, priority: 4 },
  { name: "Patch", role: "Fix execution", domain: "fix", tier: 2, deterministic: true, priority: 5 },
  { name: "Echo", role: "Evolution learning", domain: "evolution", tier: 2, deterministic: true, priority: 6 },
];

const DOMAIN: OrgAgent[] = DOMAIN_SPECS.map(([name, role, agentType, priority]) => {
  const evaluator = evaluatorFor(DOMAIN_AGENTS.find((a) => a.id === agentType));
  return {
    name,
    role,
    domain: agentType,
    tier: 3 as Tier,
    deterministic: true as const,
    priority,
    ...(evaluator ? { evaluate: evaluator } : {}),
  };
});

/** Deterministic flat registry — executives, core, then domain. */
export const AGENTS: readonly OrgAgent[] = [...EXECUTIVE, ...CORE, ...DOMAIN];

export function getAllAgents(): readonly OrgAgent[] {
  return AGENTS;
}

export function getAgent(name: string): OrgAgent | undefined {
  return AGENTS.find((a) => a.name === name);
}

export function agentsByTier(tier: Tier): readonly OrgAgent[] {
  return AGENTS.filter((a) => a.tier === tier);
}

export const executiveAgents = (): readonly OrgAgent[] => agentsByTier(1);
export const coreAgents = (): readonly OrgAgent[] => agentsByTier(2);
export const domainAgents = (): readonly OrgAgent[] => agentsByTier(3);

/** Deterministic names list (order = registry order). */
export function agentNames(): string[] {
  return AGENTS.map((a) => a.name);
}

/** Roles present in a run — matched by core role keyword. */
export function agentsForRoles(roles: string[]): string[] {
  return roles
    .map((role) => AGENTS.find((a) => a.role.includes(role) || a.name === role))
    .filter((agent): agent is OrgAgent => agent !== undefined)
    .map((a) => a.name);
}