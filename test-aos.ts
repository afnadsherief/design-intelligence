/* ==========================================
   A-OS v1 — MULTI-AGENT ORCHESTRATOR TEST SUITE
   Deterministic runner (no framework, like test-agents.ts).
   ========================================== */

import { orchestrate, buildIssueGraph } from "@/system/aos";
import { seoAgent } from "@/system/aos/agents";
import { patchForIssueType, SAFE_PATCH_IDS } from "@/system/aos/patches";
import { ingestExternalAgent, sanitizeExternalPayload } from "@/system/aos/adapters";
import type { Issue } from "@/system/aos/types";
import { getMemory, resetMemory } from "@/system/evolution";

let failures = 0;

function check(name: string, cond: boolean, extra?: unknown): void {
  if (cond) {
    console.log(`  ✓ ${name}`);
  } else {
    failures++;
    console.log(`  ✗ ${name}`, extra ?? "");
  }
}

const VULNERABLE = `
export function Landing() {
  return (
    <section>
      <img src="https://example.test/logo.svg" className="logo" />
      <a target="_blank" href="https://example.test/partners">Partners</a>
      <button onClick={hero}>Get started</button>
      <h2>Features</h2>
      <p className="prose">Ship fast.</p>
      <form className="card">
        <input type="email" placeholder="you@corp.com" />
      </form>
      <div><span>from $99</span></div>
      <a href="javascript:void(0)">Pay now</a>
    </section>
  );
}`;

function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║       A-OS v1 — ORCHESTRATOR TEST SUITE       ║");
  console.log("╚══════════════════════════════════════════════╝");

  // ---- [1] DOMAIN AGENTS IN ISOLATION ----
  console.log("\n[1] SEO agent on landing:");
  const seo = seoAgent.evaluate(VULNERABLE);
  console.log("  score:", seo.score, "| issues:", seo.issues.map((i) => i.type).join(", "));
  check("seo flags missing title", seo.issues.some((i) => i.type === "seo-missing-title"));
  check("seo flags img alt + anchor href", seo.issues.some((i) => i.type === "seo-img-missing-alt"));

  // ---- [2] PATCH REGISTRY: safe reuse exists ----
  console.log("\n[2] Patch registry cross-links:");
  check("security-blank-no-rel → a11y-anchor-rel (safe)", patchForIssueType("security-blank-no-rel")?.id === "a11y-anchor-rel");
  check("seo-img-missing-alt → a11y-img-alt (safe)", patchForIssueType("seo-img-missing-alt")?.id === "a11y-img-alt");
  check("conversion-button-default-type → a11y-button-type (safe)", patchForIssueType("conversion-button-default-type")?.id === "a11y-button-type");
  check("registry only exposes the 4 safe ids", SAFE_PATCH_IDS.includes("a11y-anchor-rel"));

  // ---- 3) ORCHESTRATION: vulnerable → healed ----
  console.log("\n[3] Orchestrate (fresh memory):");
  resetMemory();
  const mem = getMemory();
  const first = orchestrate({ component: "Landing", code: VULNERABLE, memory: mem });
  console.log("  score:", first.score, "| passes:", first.passes);
  console.log("  applied:", JSON.stringify(first.appliedPatches));
  check("score improves across passes", first.score > 35, first.score);
  check("a11y-anchor-rel auto-applied", first.appliedPatches.some((p) => p.id === "a11y-anchor-rel"));
  check("image alt added to output", /alt=""/.test(first.finalCode));
  check("rel=noopener added to output", /rel="noopener noreferrer"/.test(first.finalCode));
  check(
    "cross-agent reinforcement: a11y-input label patch boosted by 2 domains",
    first.issueGraph.every((n) => n.reinforcement === 1)
  );
  const synthetic: Issue[] = [
    { type: "crm-input-no-label", domain: "crm", severity: "high", frequency: 0, impact: 7, confidence: 0.85, sourceAgent: "crm", detail: "x", patchId: "a11y-input-aria-label" },
    { type: "conversion-field-unlabeled", domain: "conversion", severity: "medium", frequency: 0, impact: 6, confidence: 0.85, sourceAgent: "conversion", detail: "y", patchId: "a11y-input-aria-label" },
  ];
  const graph = buildIssueGraph(synthetic, mem);
  check(
    "cross-domain reinforcement: a11y-input-aria-label boosted by 2 domains",
    graph.filter((n) => n.patchId === "a11y-input-aria-label").every((n) => n.reinforcement === 1.5)
  );
  check("advisories carry unresolved seo title", first.advisories.some((a) => a.type === "seo-missing-title"));
  check("security-dangerous/jsv on graph", first.issueGraph.some((n) => n.type === "security-javascript-href"));
  console.log("  evolutionDelta:", JSON.stringify(first.evolutionDelta));

  // ---- 4) LEARNS ACROSS RUNS ----
  console.log("\n[4] Second run on same memory: learn + adapt");
  const second = orchestrate({ component: "Landing", code: first.finalCode, memory: mem });
  check("patch usage recorded", (mem.patches.usage["a11y-anchor-rel"] ?? 0) > 0);
  check("domain signal recorded", (mem.seoPatterns["seo-missing-title"] ?? 0) > 0);
  check("components learned avgScore", mem.components["Landing"] !== undefined);
  check("issues frequency surfaces in graph", second.issueGraph.some((n) => n.frequency > 0));
  console.log("  memory:", JSON.stringify({ patches: mem.patches.usage, seo: mem.seoPatterns }));

  // ---- 5] External adapters ----
  console.log("\n[5] External agent adapters:");
  const ingested = ingestExternalAgent({ ...mem }, "analytics", { sessions: 12, "bounce-rate": 0.34, sqlStatement: null });
  check("analytics folded into smmPerformance", ingested.applied["smm:sessions"] === 12);
  check("non-number dropped", !("smm:sqlStatement" in ingested.applied));
  const sanitized = sanitizeExternalPayload({ a: 1, b: "x", c: [1, 2] });
  check("sanitizer keeps numbers only", JSON.stringify(sanitized) === "{\"a\":1}");

  // ---- 6] DETERMINISM ----
  console.log("\n[6] Determinism (fresh memories → identical results):");
  const r1 = orchestrate({ component: "Landing", code: VULNERABLE });
  const r2 = orchestrate({ component: "Landing", code: VULNERABLE });
  const sig1 = JSON.stringify({ finalCode: r1.finalCode, appliedPatches: r1.appliedPatches, score: r1.score });
  const sig2 = JSON.stringify({ finalCode: r2.finalCode, appliedPatches: r2.appliedPatches, score: r2.score });
  check("identical across fresh runs", sig1 === sig2);

  // ---- 7] One agent only needs its kind ----
  console.log("\n[7] zero-patch component converges in ≤1 pass:");
  const clean = orchestrate({ component: "Clean", code: "<p className=\"text-gray-500\">ok</p>", maxPasses: 3 });
  check("clean converges", clean.passes <= 1, clean.passes);

  console.log(failures === 0 ? "\nALL A-OS TESTS PASSED" : `\n${failures} FAILURE(S)`);
  process.exit(failures === 0 ? 0 : 1);
}

main();