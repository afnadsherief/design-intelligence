/* ==========================================
   A-OS — AGENTS INDEX
   Fixed evaluation order — determinism requires a
   stable sequence, never parallel-with-order-bets.
   ========================================== */

import type { AgentEvaluator } from "@/system/aos/types";
import { seoAgent } from "./seo";
import { smmAgent } from "./smm";
import { crmAgent } from "./crm";
import { securityAgent } from "./security";
import { conversionAgent } from "./conversion";
import { pricingAgent } from "./pricing";

export const DOMAIN_AGENTS: ReadonlyArray<AgentEvaluator> = [
  seoAgent,
  smmAgent,
  crmAgent,
  securityAgent,
  conversionAgent,
  pricingAgent,
];

export { seoAgent, smmAgent, crmAgent, securityAgent, conversionAgent, pricingAgent };
