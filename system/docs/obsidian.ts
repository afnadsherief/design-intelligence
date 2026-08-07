/* ==========================================
   A-OS — OBSIDIAN DOCUMENTATION ENFORCEMENT
   Every execution produces a markdown log under
   {root}/A-OS/Logs/{timestamp}-{slug}.md
   Root override: AOS_OBSIDIAN_ROOT (default: ./Obsidian).
   ========================================== */

import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import type { PipelineResult } from "@/system/evolution/core";
import type { GlobalEvolutionMemory } from "@/system/evolution/types";
import { getMemory } from "@/system/evolution/memory";
import { agentNames } from "@/system/org/registry";

/** Pipeline output extended with the documentation contract. */
export type LoggedExecution = PipelineResult & {
  documentation?: string;
  documentationPath?: string;
};

export interface DocContext {
  domain?: string;
  memory?: GlobalEvolutionMemory;
  agents?: string[];
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Deterministic UTC timestamp for the filename (never in the body). */
export function timestampUtc(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}-` +
    `${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`
  );
}

export function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "execution"
  );
}

/** Pure builder — deterministic markdown from a pipeline result. */
export function buildExecutionDoc(result: LoggedExecution, context: DocContext = {}): string {
  const memory = context.memory ?? getMemory();
  const component = result.component;
  const patches = result.applies.appliedPatches;
  const errors = result.advisories.length;

  const changes =
    patches.map((p) => `- ${p.class ?? "n/a"}: ${p.id}`).join("\n") ||
    "- none — converged clean";
  const stats = memory.components[component];
  const successSummary = patches
    .map(
      (p) =>
        `${p.id}: success ${memory.patches.success[p.id] ?? 0}, failure ${memory.patches.failure[p.id] ?? 0}, usage ${memory.patches.usage[p.id] ?? 0}`
    )
    .join(", ");

  const topPatches = result.adapt.patchPriorities.slice(0, 3);
  const nextActions = [
    ...result.advisories
      .slice(0, 3)
      .map((a) => `- ${a.severity} ${a.type}: ${a.message}`),
    topPatches.length
      ? `- Priority targets: ${topPatches.map((p) => p.id).join(", ")}`
      : "- No new priority targets.",
  ].join("\n");

  const learnings = [
    stats
      ? `Component history: runs=${stats.runs}, avgPasses=${round2(stats.avgPasses)}, avgScore=${round2(stats.avgScore)}`
      : "No prior component history.",
    `Converged in ${result.passCount} pass(es) — ${result.valid ? "valid" : "NOT valid"}.`,
    "Advisory findings were recorded, never promoted into code changes.",
  ].join("\n");

  const agents = context.agents?.length ? context.agents.join(", ") : agentNames().join(", ");

  return [
    `# ${component} — Execution Log`,
    "",
    "## Domain",
    context.domain ?? "pipeline",
    "",
    "## Summary",
    `Valid=${result.valid} · score=${result.score} · passes=${result.passCount} · patches=${patches.length} · errors=${errors}`,
    "",
    "## Decisions",
    `- Applied ${patches.length} patch(es) via A-OS fix agent (safe/deterministic only).`,
    "- Advisory findings were NOT mutated into code.",
    "",
    "## Changes",
    changes,
    "",
    "## Metrics",
    `patches=${patches.length}`, `score=${result.score}`, `passes=${result.passCount}`,
    `patchStats=${successSummary || "none"}`,
    `topPriorities=${JSON.stringify(topPatches)}`,
    "",
    "## Agents",
    agents,
    "",
    "## Learnings",
    learnings,
    "",
    "## Next Actions",
    nextActions,
    "",
  ].join("\n");
}

/** Write the execution log to {root}/A-OS/Logs/ and return its path. */
export function writeExecutionDoc(
  result: LoggedExecution,
  context: DocContext = {}
): string {
  const rootPath = resolve(process.env.AOS_OBSIDIAN_ROOT ?? "C:\\Users\\Afnad Sherief\\Docs\\AOS");
  const dir = join(rootPath, "A-OS", "Logs");
  mkdirSync(dir, { recursive: true });
  const path = join(dir, `${timestampUtc()}-${slugify(result.component)}.md`);
  writeFileSync(path, buildExecutionDoc(result, context), "utf-8");
  return path;
}

/** Merlin guarantee — an execution is never returned undocumented. */
export function ensureDocumentation(result: LoggedExecution, context: DocContext = {}): string {
  if (typeof result.documentation === "string" && result.documentation.length > 0) {
    return result.documentation;
  }
  return buildExecutionDoc(result, context);
}