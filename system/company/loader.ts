/* ==========================================
   A-OS — COMPANY LOADER (S4 wiring)
   Simple fs read + JSON parse.
   No abstractions, no validation layers.
   ========================================== */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export interface CompanyConfig {
  id: string;
  name: string;
  domain: string;
  type: string;
  status: string;
  objectives: string[];
  constraints: Record<string, string>;
}

function configPath(id: string): string {
  return resolve(process.cwd(), "system", "company", "configs", `${id}.json`);
}

/** Load a company config by id. Throws if missing (fail fast, deterministic). */
export function loadCompany(id: string): CompanyConfig {
  const raw = readFileSync(configPath(id), "utf-8");
  return JSON.parse(raw) as CompanyConfig;
}
