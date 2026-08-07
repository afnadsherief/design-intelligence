import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
  openDesign,
  evaluateComponent,
  scoreComponent,
  evaluateUX,
  enforceHierarchy,
} from "@/system";
import { cn } from "@/tooling/utils";

function main() {
  const buttonSource = readFileSync(
    fileURLToPath(new URL("./system/primitives/button.tsx", import.meta.url)),
    "utf-8"
  );

  const component = "Button";

  console.log("===========================================");
  console.log(`DESIGN INTELLIGENCE — COMPONENT: ${component}`);
  console.log("===========================================");

  const validation = openDesign(component, buttonSource, { variant: "default", size: "default" });
  console.log("\n[1] openDesign() validation result:");
  console.log(JSON.stringify(validation, null, 2));

  const ux = evaluateUX(buttonSource);
  console.log("\n[2] evaluateUX() raw score:");
  console.log(JSON.stringify(ux, null, 2));

  const hierarchy = enforceHierarchy(buttonSource);
  console.log("\n[3] enforceHierarchy() result:");
  console.log(JSON.stringify(hierarchy, null, 2));

  const scored = evaluateComponent(component, {
    tokenUsage: 95,
    accessibility: 85,
    performance: 80,
    consistency: 95,
  });
  console.log("\n[4] evaluateComponent() detailed result:");
  console.log(JSON.stringify(scored, null, 2));

  const card = scoreComponent(component, {
    tokenUsage: 95,
    accessibility: 85,
    performance: 80,
    consistency: 95,
  });
  console.log("\n[5] scoreComponent() scorecard (flat output):");
  console.log(JSON.stringify(card, null, 2));

  console.log("\n[6] Runtime util sanity: cn() =", cn("bg-red-500", "bg-red-500"));
}

main();