/* ==========================================
   A-OS — ORG / MERLIN / HERMES / OBSIDIAN TEST SUITE
   Deterministic runner (no framework, same style
   as test-aos.ts and test-agents.ts).
   ========================================== */

import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

import { merlin, isDocumented } from "@/system/org/merlin";
import {
  AGENTS,
  getAgent,
  agentsByTier,
  agentsForRoles,
  coreAgents,
  domainAgents,
  executiveAgents,
} from "@/system/org/registry";
import { invokeSkill, getSkill } from "@/system/hermes/index";
import { buildExecutionDoc, slugify } from "@/system/docs/obsidian";
import { runPipeline } from "@/system/evolution/core";
import { getMemory, resetMemory } from "@/system/evolution";
import { ingestExternalAgent, sanitizeExternalPayload } from "@/system/aos/adapters";

let failures = 0;
const check = (name: string, cond: boolean, extra?: unknown): void => {
  if (cond) console.log(`  ✓ ${name}`);
  else {
    failures++;
    console.log(`  ✗ ${name}`, extra ?? "");
  }
};

const SAMPLE = `
export function Hero() {
  return (
    <section className="hero">
      <img src="/logo.png" className="logo" />
      <a target="_blank" href="https://example.com/docs">Docs</a>
      <button onClick={submit}>Join</button>
      <p className="text-[#f3f4f6]">Hello</p>
    </section>
  );
}`;

function main() {
  console.log("╔════════════════════════════════════════════════╗");
  console.log("║   A-OS — ORG / MERLIN / HERMES / OBSIDIAN QA   ║");
  console.log("╚════════════════════════════════════════════════╝");

  // [1] REGISTRY INTEGRITY
  console.log("\n[1] Agent registry integrity:");
  check("16 agents (4 executive + 6 core + 6 domain)", AGENTS.length === 16, AGENTS.length);
  check("every agent is deterministic + fully specified",
    AGENTS.every((a) => a.deterministic === true && a.name && a.role && a.domain && a.tier >= 1 && a.tier <= 3 && a.priority >= 1));
  check("tier sizes 4/6/6", agentsByTier(1).length === 4 && agentsByTier(2).length === 6 && agentsByTier(3).length === 6);
  check("all domain agents have evaluators", domainAgents().every((a) => typeof a.evaluate === "function"));
  check("executives have no evaluators", executiveAgents().every((a) => a.evaluate === undefined));
  check("Merlin is Tier 2", getAgent("Merlin")?.tier === 2);
  check("core agents are named", coreAgents().every((a) => ["Merlin", "Sentinel", "Flow", "Volt", "Patch", "Echo"].includes(a.name)));
  check("agentsForRoles maps roles to names", JSON.stringify(agentsForRoles(["Fix", "QA"])) === JSON.stringify(["Patch", "Sentinel"]));

  // [2] DOMAIN EVALUATORS
  console.log("\n[2] Domain evaluator wiring (Atlas → SEO):");
  const atlas = getAgent("Atlas");
  const out = atlas?.evaluate ? atlas.evaluate(SAMPLE) : { score: 100, issues: [] };
  check("Atlas flags missing title/img-alt", out.score < 100 && out.issues.length > 0, out);
  const aegis = getAgent("Aegis");
  const sec = aegis?.evaluate ? aegis.evaluate(SAMPLE) : { score: 100, issues: [] };
  check("Aegis flags blank target without rel", sec.issues.some((i) => i.type === "security-blank-no-rel"));

  // [3] HERMES SKILLS
  console.log("\n[3] Hermes skills:");
  const ranked = invokeSkill("Ranker", {
    items: [
      { id: "low", impact: 2, confidence: 0.5, frequency: 0 },
      { id: "high", impact: 10, confidence: 1, frequency: 1 },
    ],
  }) as Array<{ id: string; score: number }>;
  check("Ranker sorts deterministically", ranked[0].id === "high");
  const pattern = invokeSkill("PatternEye", { code: SAMPLE }) as { patterns: Record<string, number> };
  check("PatternEye detects img/button/anchor issues",
    pattern.patterns.imgWithoutAlt === 1 && pattern.patterns.buttonWithoutType === 1 && pattern.patterns.blankTargetNoRel === 1);
  const refact = invokeSkill("Refactor", { code: SAMPLE }) as { advisories: Record<string, number> };
  check("Refactor flags hardcoded hex", refact.advisories.hardcodedHex >= 1);
  const copy = invokeSkill("CopyForge", { template: "Hi {{name}}!", variables: { name: "Ada" } }) as { output: string };
  check("CopyForge fills {{placeholders}}", copy.output === "Hi Ada!");
  const ui = invokeSkill("ComposeUI", { parts: ["<Card>A</Card>", "<Card>B</Card>"] }) as { partCount: number; composed: string };
  check("ComposeUI assembles parts", ui.partCount === 2 && ui.composed.includes("Card"));
  check("unknown skill rejected", getSkill("Nope") === undefined);

  // [4] MERLIN ORCHESTRATION + DOCS
  console.log("\n[4] Merlin execution + Obsidian documentation:");
  process.env.AOS_OBSIDIAN_ROOT = "ObsidianTests";
  resetMemory();
  const m = merlin.execute({ component: "Hero", code: SAMPLE, domain: "pricing" });
  check("result is documented", isDocumented(m));
  check("doc has all 8 sections",
    ["## Domain", "## Summary", "## Decisions", "## Changes", "## Metrics", "## Agents", "## Learnings", "## Next Actions"]
      .every((s) => m.documentation.includes(s)));
  check("doc has title + domain", m.documentation.includes("# Hero — Execution Log") && m.documentation.includes("pricing"));
  check("doc file written to Obsidian/A-OS/Logs", existsSync(m.documentationPath) && m.documentationPath.includes("A-OS") && m.documentationPath.endsWith(".md"));
  check("Merlin coordinates org agents", m.orgAgents[0] === "Merlin" && m.orgAgents.includes("Patch") && m.orgAgents.includes("Sentinel"));
  check("Hermes skills attached", typeof m.skills.PatternEye === "object");
  check("pipeline converged & healed code", m.score > 0 && m.passCount >= 1 && m.applies.appliedPatches.length > 0);
  check("only safe/deterministic patches applied", m.applies.appliedPatches.every((p) => p.class !== "advisory"));
  check("img alt + anchor rel landed", m.code.includes('alt=""') && m.code.includes('rel="noopener noreferrer"'));

  // [5] DETERMINISM
  console.log("\n[5] Determinism across fresh memories:");
  resetMemory();
  const a = merlin.execute({ component: "Hero", code: SAMPLE, domain: "pricing" });
  resetMemory();
  const b = merlin.execute({ component: "Hero", code: SAMPLE, domain: "pricing" });
  check("identical documentation body", a.documentation === b.documentation);
  check("identical scores/applied patches", a.score === b.score && JSON.stringify(a.applies.appliedPatches) === JSON.stringify(b.applies.appliedPatches));

  // [6] PIPELINE UNCHANGED
  console.log("\n[6] Core pipeline regression:");
  resetMemory();
  const p1 = runPipeline("Hero", SAMPLE);
  const p2 = runPipeline("Hero", SAMPLE);
  check("first run applies patches + progresses", p1.passCount >= 1 && p1.applies.appliedPatches.length > 0 && p1.score > 0);
  check("learning persists across runs", (getMemory().components["Hero"]?.runs ?? 0) >= 2);
  check("memory stores metadata only", !JSON.stringify(getMemory()).includes("export function"));
  check("slugify is deterministic", slugify("Pricing Page!") === "pricing-page");

  // [7] ADAPTER INGESTION (multi-target)
  console.log("\n[7] Adapter ingestion:");
  resetMemory();
  const mem = getMemory();
  const analytic = ingestExternalAgent(mem, "analytics", { sessions: 12 });
  check("analytics → smmPerformance + conversionSignals",
    mem.smmPerformance["smm:sessions"] === 12 && mem.conversionSignals["smm:sessions"] === 12);
  check("analytics domains reported", JSON.stringify(analytic.domains) === JSON.stringify(["smm", "conversion"]));
  ingestExternalAgent(mem, "crm", { contacts: 5 });
  check("crm → crmSignals", mem.crmSignals["crm:contacts"] === 5);
  ingestExternalAgent(mem, "security-monitor", { alerts: 2 });
  check("security → securityRisks", mem.securityRisks["sec:alerts"] === 2);
  ingestExternalAgent(mem, "payments", { mrr: 99 });
  check("payments → productOutcomes", mem.productOutcomes["price:mrr"] === 99);
  ingestExternalAgent(mem, "infra", { uptime: 99.9 });
  check("infra → productOutcomes", mem.productOutcomes["ops:uptime"] === 99.9);
  check("sanitizer keeps numbers only", JSON.stringify(sanitizeExternalPayload({ a: 1, b: "x", c: [1, 2] })) === '{"a":1}');

  // cleanup test vault
  rmSync(resolve("ObsidianTests"), { recursive: true, force: true });

  console.log(failures === 0 ? "\nALL ORG/MERLIN/HERMES/OBSIDIAN TESTS PASSED" : `\n${failures} FAILURE(S)`);
  process.exit(failures === 0 ? 0 : 1);
}

main();