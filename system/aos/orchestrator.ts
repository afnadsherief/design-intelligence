/* ==========================================
   A-OS — ORCHESTRATOR (ponytail mode)
   Fixed-order rule agents → unified issue graph →
   confidence-gated safe patches → bounded convergence
   → single learn call → adapt → AosResult.
   Deterministic. No randomness.
   ========================================== */

import type { AosResult, Domain, Issue, IssueGraphNode, Severity } from "@/system/aos/types";
import { DOMAIN_AGENTS } from "@/system/aos/agents";
import { patchForIssueType } from "@/system/aos/patches";
import { ingestExternalAgent, type ExternalSource } from "@/system/aos/adapters";
import { AUTO_FIX_CLASSES, SAFE_TRANSFORM_RULES, type PatchClass } from "@/agents/design-qa/patches";
import {
  adaptSystem,
  effectiveMaxPasses,
  learnFromRun,
  patchSuccessRate,
  recordDomainSignal,
} from "@/system/evolution";
import { createEmptyMemory, round2 } from "@/system/evolution/memory";
import type { GlobalEvolutionMemory } from "@/system/evolution/types";
import { loadCompany, type CompanyConfig } from "@/system/company/loader";

export interface AosOptions {
  component?: string;
  code?: string;
  memory?: GlobalEvolutionMemory;
  /** External third-party payloads: { analytics, seo-tooling, crm, security-monitor, payments }. */
  externalSignals?: Partial<Record<ExternalSource, unknown>>;
  maxPasses?: number;
  companyId?: string;
  domain?: string;
}

/** S4 flat execution shape — company object instead of id. */
export interface PipelineInput {
  component?: string;
  code?: string;
  props?: Record<string, unknown>;
  domain?: string;
  maxPasses?: number;
  company?: CompanyConfig;
  input?: string;
}

/**
 * S4 unified entrypoint — thin wrapper over orchestrate.
 * Accepts a flat { input, company } shape.
 * `input` maps to the source `code` for evaluation.
 */
export function runPipeline(input: PipelineInput): AosResult {
  return orchestrate({
    component: input.component ?? "s4-component",
    code: input.code ?? input.input,
    domain: input.domain,
    maxPasses: input.maxPasses,
    companyId: input.company?.id,
  });
}

const DOMAIN_ORDER: readonly Domain[] = ["seo", "smm", "crm", "security", "conversion", "pricing"];

const SEVERITY_ORDER: Record<Severity, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

/**
 * One pass over the six rule agents. Fixed DOMAIN_AGENTS order keeps
 * everything deterministic across runs.
 */
function runAgents(code: string): { scores: Record<Domain, number>; issues: Issue[] } {
  const scores = {} as Record<Domain, number>;
  const issues: Issue[] = [];
  for (const agent of DOMAIN_AGENTS) {
    const out = agent.evaluate(code);
    scores[agent.domain] = out.score;
    issues.push(...out.issues);
  }
  return { scores, issues };
}

/** Mean of the six domain scores. */
function overallScore(scores: Record<Domain, number>): number {
  return Math.round(DOMAIN_ORDER.reduce((sum, d) => sum + scores[d], 0) / DOMAIN_ORDER.length);
}

const SIGNAL_MAPS = [
  "seoPatterns",
  "securityRisks",
  "crmSignals",
  "smmPerformance",
  "conversionSignals",
  "productOutcomes",
] as const;

/** How many historical runs have ever reported this issue type. */
function signalFrequency(memory: GlobalEvolutionMemory, type: string): number {
  let n = 0;
  for (const name of SIGNAL_MAPS) n += memory[name][type] ?? 0;
  return n;
}

/** Node keyed by issue type; same type from several domains merges. */
export function buildIssueGraph(issues: Issue[], memory: GlobalEvolutionMemory): IssueGraphNode[] {
  const nodes = new Map<string, IssueGraphNode>();
  for (const issue of issues) {
    const existing = nodes.get(issue.type);
    const successRate = issue.patchId ? patchSuccessRate(memory, issue.patchId) : 0.5;
    const signal = signalFrequency(memory, issue.type);
    const usage = issue.patchId ? (memory.patches.usage[issue.patchId] ?? 0) : 0;
    const frequency = Math.max(signal, usage);
    if (!existing) {
      nodes.set(issue.type, {
        type: issue.type,
        domains: [issue.domain],
        sourceAgents: [issue.sourceAgent],
        severity: issue.severity,
        frequency,
        impact: issue.impact,
        confidence: issue.confidence,
        detail: issue.detail,
        ...(issue.patchId ? { patchId: issue.patchId } : {}),
        reinforcement: 1,
        priority: 0,
        successRate,
      });
      continue;
    }
    if (!existing.domains.includes(issue.domain)) existing.domains.push(issue.domain);
    if (!existing.sourceAgents.includes(issue.sourceAgent)) existing.sourceAgents.push(issue.sourceAgent);
  }
  // Cross-domain reinforcement: every node whose patch is ALSO resolved by a
  // different domain gets a boost. Combine then re-normalize coverage.
  const domainsByPatch = new Map<string, Set<Domain>>();
  for (const node of nodes.values()) {
    if (node.patchId) {
      const set = domainsByPatch.get(node.patchId) ?? new Set<Domain>();
      for (const d of node.domains) set.add(d);
      domainsByPatch.set(node.patchId, set);
    }
  }
  for (const node of nodes.values()) {
    // ponytail: reinforcement counts distinct domains sharing one patch id;
    // ceiling: ignores that a single powerful domain could be the real force;
    // upgrade path: weight by sourceAgents' memory accuracy instead.
    node.reinforcement = node.patchId
      ? 1 + 0.5 * Math.max(0, (domainsByPatch.get(node.patchId)?.size ?? 1) - 1)
      : 1;
    node.priority = round2(
      node.impact *
        node.confidence *
        node.successRate *
        Math.max(1, node.frequency) *
        node.reinforcement
    );
  }
  return [...nodes.values()].sort(
    (a, b) => b.priority - a.priority || SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity] || a.type.localeCompare(b.type)
  );
}

export function orchestrate(options: AosOptions = {}): AosResult {
  const company = options.companyId ? loadCompany(options.companyId) : undefined;
  const memory = options.memory ?? createEmptyMemory();
  const component = options.component ?? "aos-component";
  const budget = effectiveMaxPasses(component, options.maxPasses ?? SAFE_TRANSFORM_RULES.maxPasses, memory);

  for (const source of Object.keys(options.externalSignals ?? {}) as ExternalSource[]) {
    ingestExternalAgent(memory, source, (options.externalSignals as Record<string, unknown>)[source]);
  }

  let code = options.code ?? "";
  let result = runAgents(code);
  const initialScore = overallScore(result.scores);
  let score = initialScore;
  const applied: Array<{ id: string; class: PatchClass }> = [];

  let passCount = 0;
  for (; passCount < budget; passCount++) {
    // Selection: resolvable, auto-fix-class, confidence-gated, top priority first.
    const graph = buildIssueGraph(result.issues, memory);
    const candidates = graph
      .filter((n) => n.patchId && n.confidence >= SAFE_TRANSFORM_RULES.minConfidence)
      .slice(0, SAFE_TRANSFORM_RULES.maxPatchesPerRun);

    let appliedThisPass = 0;
    for (const node of candidates) {
      const patch = patchForIssueType(node.type!);
      if (!patch || !AUTO_FIX_CLASSES.has(patch.class)) continue;
      if (patch.match === "" || !code.includes(patch.match)) continue;
      // Same patch resolved from two issue types (e.g. crm + conversion):
      // apply once per run — the second transform is a no-op anyway.
      if (applied.some((p) => p.id === patch.id)) continue;
      code = patch.apply(code);
      applied.push({ id: patch.id, class: patch.class });
      appliedThisPass++;
    }

    if (appliedThisPass === 0) break;
    const re = runAgents(code);
    const next = overallScore(re.scores);
    if (next <= score) break;
    score = next;
    result = re;
  }

  const graph = buildIssueGraph(result.issues, memory);
  const issueTypes = graph.map((n) => n.type);
  const RECORDABLE: ReadonlyArray<Domain> = ["seo", "smm", "crm", "security", "conversion", "pricing"];
  for (const n of graph) {
    for (const domain of n.domains) {
      if (RECORDABLE.includes(domain)) {
        recordDomainSignal(memory, domain as "seo" | "smm" | "crm" | "security" | "conversion" | "pricing", n.type);
      }
    }
  }

  // ponytail: single learnFromRun under the existing "fix" agentType; ceiling:
  // per-domain agent performance/accuracy stays 0 until learned; upgrade path:
  // loop DOMAIN_AGENTS with per-agent learnFromRun + component-stats de-dup.
  learnFromRun(
    {
      agentType: "fix",
      componentName: component,
      passes: passCount,
      patchesApplied: applied,
      issues: issueTypes,
    },
    { scoreBefore: initialScore, scoreAfter: score },
    memory
  );

  const adaptation = adaptSystem(
    memory,
    applied.map((p) => ({ id: p.id, impact: patchForIssueType(p.id)?.impact ?? 5 }))
  );

  const advisories: Array<{ type: string; severity: Severity; message: string }> = graph
    .filter((n) => !applied.some((p) => p.id === n.patchId))
    .map((n) => ({ type: n.type, severity: n.severity, message: n.detail }));

  return {
    component,
    finalCode: code,
    validation: result.scores as Record<string, number>,
    score,
    passes: passCount,
    appliedPatches: applied,
    issueGraph: graph,
    advisories,
    evolutionDelta: {
      issuesAdded: graph.length,
      patchesApplied: applied.length,
      componentsUpdated: [component],
      agentsUpdated: [...new Set(graph.flatMap((n) => n.sourceAgents))],
      domainSignals: Object.fromEntries(DOMAIN_ORDER.map((d) => [d, graph.filter((n) => n.domains.includes(d)).length])),
    },
    systemAdaptations: adaptation,
    company,
  };
}