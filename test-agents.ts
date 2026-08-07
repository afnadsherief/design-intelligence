import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { designQAAgent } from "@/agents/design-qa/design-qa-agent";
import { applyFixes } from "@/agents/design-qa/fix-agent";
import { optimizeLayout } from "@/agents/ux-agent";
import { analyzePerformance } from "@/agents/performance-agent";
import { generateComponent } from "@/agents/generator";
import { search } from "@/system/search";
import { getContent } from "@/content";
import { validateForm, contactFormSchema } from "@/system/forms";
import {
  resetMemory,
  getMemory,
  learnFromRun,
  adjustConfidence,
  prioritizeRecommendations,
  qualityScore,
  runPipeline,
} from "@/system/evolution";

function main() {
  const buttonSource = readFileSync(
    fileURLToPath(new URL("./system/primitives/button.tsx", import.meta.url)),
    "utf-8"
  );

  console.log("╔══════════════════════════════════════════╗");
  console.log("║  DESIGN INTELLIGENCE — AGENT TEST SUITE   ║");
  console.log("╚══════════════════════════════════════════╝");

  console.log("\n[1] DESIGN QA AGENT — Button:");
  const qa = designQAAgent("Button", buttonSource, { variant: "default", size: "default" });
  console.log(JSON.stringify(qa, null, 2));

  console.log("\n[2] UX OPTIMIZATION AGENT — Button:");
  console.log(JSON.stringify(optimizeLayout(buttonSource), null, 2));

  console.log("\n[3] PERFORMANCE AGENT — Button:");
  console.log(JSON.stringify(analyzePerformance(buttonSource), null, 2));

  console.log("\n[4] COMPONENT GENERATOR — 'pricing page with 3 tiers':");
  const generated = generateComponent("pricing page with 3 tiers");
  console.log(
    JSON.stringify(
      {
        name: generated.name,
        validation: generated.validation,
        codePreview: generated.code.split("\n").slice(0, 6).join("\n") + "\n...",
        hasHardcodedHex: /#[0-9a-fA-F]{3,8}/.test(generated.code),
        hasHardcodedPx: /\d+px/.test(generated.code),
      },
      null,
      2
    )
  );

  console.log("\n[5] CONTENT LAYER — products (2):");
  console.log(JSON.stringify(getContent({ type: "product" }).slice(0, 2), null, 2));

  console.log("\n[6] SEARCH — 'drop':");
  console.log(JSON.stringify(search("drop"), null, 2));

  console.log("\n[7] FORM VALIDATION — invalid email:");
  console.log(
    JSON.stringify(validateForm(contactFormSchema, { name: "Ada", email: "bad", message: "hello world" }), null, 2)
  );

  console.log("\n[8] FIX AGENT — hardcoded composite (auto-fix):");
  const brokenCard = `import { Card } from "@/system";

export function BadCard() {
  return (
    <Card className="bg-[#f3f4f6] p-[16px] shadow-[#00000020]">
      <p>Hello</p>
    </Card>
  );
}`;
  const fix = applyFixes("BadCard", brokenCard);
  console.log(
    JSON.stringify(
      {
        fixed: fix.fixed,
        kind: fix.kind,
        appliedPatches: fix.appliedPatches.map((p) => ({ kind: p.kind, description: p.description, confidence: p.confidence })),
        pendingRecommendations: fix.pendingRecommendations,
        code: fix.code,
        validationAfter: fix.validationAfter,
      },
      null,
      2
    )
  );

  console.log("\n[9] DESIGN QA AGENT — Button (after engine improvements):");
  const qaImproved = designQAAgent("Button", buttonSource, { variant: "default", size: "default" });
  console.log(
    JSON.stringify(
      {
        valid: qaImproved.valid,
        issues: qaImproved.issues,
        score: qaImproved.score,
        recommendations: qaImproved.recommendations,
      },
      null,
      2
    )
  );

  console.log("\n[10] PERFORMANCE AGENT — Button (shared heuristic):");
  console.log(JSON.stringify(analyzePerformance(buttonSource), null, 2));

  // ============ GLOBAL EVOLUTION LAYER (PART 9) ============
  resetMemory();

  console.log("\n[11] EVOLUTION — GLOBAL PIPELINE run 1 (QA → Fix → Learn → Adapt):");
  const evoCard = `import { Card } from "@/system";

export function EvoCard() {
  return (
    <Card className="bg-[#f3f4f6] p-[16px]">
      <img src="/hero.png" />
      <a href="https://example.com" target="_blank">Learn</a>
      <button className="bg-[#2563eb]">Go</button>
    </Card>
  );
}`;
  const pipe1 = runPipeline("EvoCard", evoCard, undefined, { logPasses: true });
  console.log(
    JSON.stringify(
      {
        fixed: pipe1.applies.appliedPatches,
        passCount: pipe1.passCount,
        score: pipe1.score,
        valid: pipe1.valid,
        advisories: pipe1.adapt.patchPriorities.slice(0, 4),
        tunedMaxPasses: pipe1.adapt.tunedMaxPasses,
        agentWeights: pipe1.adapt.agentWeights,
      },
      null,
      2
    )
  );

  console.log("\n[12] EVOLUTION — run 2 (same component, memory active):");
  const pipe2 = runPipeline("EvoCard", evoCard, undefined, { logPasses: true });
  console.log("run2 passCount:", pipe2.passCount, "(dynamic ceiling should be ≤ run1)");
  console.log("components:", JSON.stringify(getMemory().components));

  console.log("\n[13] EVOLUTION — extra a11y-only run (confirms alignment: abort fixes now raise Scores):");
  const staticCard = `export function StaticCard() {
  return (
    <div className="flex items-center justify-between">
      <img src="/icon.png" />
      <button onClick={() => {}}>Go</button>
    </div>
  );
}`;
  const fail = applyFixes("EvoCard", staticCard, undefined, { memory: getMemory() });
  learnFromRun(
    {
      agentType: "fix",
      componentName: "EvoCard",
      passes: fail.passCount,
      patchesApplied: fail.appliedPatches.map((p) => ({ id: p.id })),
    },
    {
      scoreBefore: qualityScore(fail.validationBefore),
      scoreAfter: qualityScore(fail.validationAfter),
    },
    getMemory()
  );
  console.log("applied:", fail.appliedPatches.map((p) => p.id), "| score before/after:",
    qualityScore(fail.validationBefore), "→", qualityScore(fail.validationAfter));
  console.log("patch success/failure/usage:", JSON.stringify(getMemory().patches));

  console.log("\n[14] ADAPTIVE CONFIDENCE — base vs adjusted (deterministic):");
  const mem = getMemory();
  // Illustrative past state: this patch has under-performed in memory.
  mem.patches.failure["a11y-anchor-rel"] = 4;
  const confExamples = [
    { id: "a11y-anchor-rel", confidence: 0.95 },
    { id: "a11y-button-type", confidence: 0.95 },
    { id: "a11y-img-alt", confidence: 0.9 },
    { id: "hex-#f3f4f6", confidence: 0.95 },
  ];
  for (const p of confExamples) {
    console.log("  ", p.id, "base", p.confidence, "→ adjusted", adjustConfidence(p, mem));
  }

  console.log("\n[15] ADVISORIES + PRIORITIZATION — EvoCard run2:");
  console.log("advisories:", JSON.stringify(pipe2.advisories, null, 2));
  console.log(
    "ranked advisories:",
    JSON.stringify(prioritizeRecommendations(pipe2.advisories.map((a) => a.message), mem), null, 2)
  );

  console.log("\n[16] AGENT IMPROVEMENT — UX agent suggestion reordering (with memory):");
  const uxBefore = optimizeLayout(`export function Basic() { return <div className="text-[#333] p-[10px]"><button>Ok</button></div>; }`);
  const uxAfter = optimizeLayout(`export function Basic() { return <div className="text-[#333] p-[10px]"><button>Ok</button></div>; }`, mem);
  console.log("before roots:", uxBefore.suggestions.slice(0, 2));
  console.log("after roots: ", uxAfter.suggestions.slice(0, 2));

  console.log("\n[17] PERFORMANCE AGENT — heuristic refinement with memory:");
  const perfBefore = analyzePerformance(buttonSource);
  const perfAfter = analyzePerformance(buttonSource, mem);
  console.log("perfScore base:", perfBefore.score, "→ refined:", perfAfter.score);
  console.log("heuristics:", JSON.stringify(mem.heuristics));

  console.log("\nMEMORY SNAPSHOT (metadata only, no code):");
  console.log(JSON.stringify(getMemory(), null, 2));
}

main();