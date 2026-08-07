/* ==========================================
   A-OS — EXTERNAL AGENT ADAPTERS
   Third-party signals (analytics, CRM, security
   monitors, payments, SEO tooling, infra) are
   sanitized to metadata and folded into the correct
   memory domain maps. Metadata only — never code,
   never raw payloads, no direct tool access.
   ========================================== */

import type { GlobalEvolutionMemory } from "@/system/evolution/types";

export type ExternalSource =
  | "analytics"
  | "seo-tooling"
  | "crm"
  | "security-monitor"
  | "payments"
  | "infra";

type SignalMapName =
  | "seoPatterns"
  | "securityRisks"
  | "crmSignals"
  | "smmPerformance"
  | "conversionSignals"
  | "productOutcomes";

const SIGNAL_DOMAIN: Record<SignalMapName, "seo" | "security" | "crm" | "smm" | "conversion" | "pricing"> = {
  seoPatterns: "seo",
  securityRisks: "security",
  crmSignals: "crm",
  smmPerformance: "smm",
  conversionSignals: "conversion",
  productOutcomes: "pricing",
};

/** Source → one or more memory domain maps (analytics feeds SMM + conversion). */
const SOURCE_TARGETS: Record<ExternalSource, SignalMapName[]> = {
  analytics: ["smmPerformance", "conversionSignals"],
  "seo-tooling": ["seoPatterns"],
  crm: ["crmSignals"],
  "security-monitor": ["securityRisks"],
  payments: ["productOutcomes"],
  infra: ["productOutcomes", "conversionSignals"],
};

const SOURCE_PREFIX: Record<ExternalSource, string> = {
  analytics: "smm",
  "seo-tooling": "seo",
  crm: "crm",
  "security-monitor": "sec",
  payments: "price",
  infra: "ops",
};

/** Deterministic sanitizer: numbers in, everything else dropped, capped keys. */
export function sanitizeExternalPayload(
  payload: unknown,
  maxKeys = 20
): Record<string, number> {
  const out: Record<string, number> = {};
  if (payload === null || typeof payload !== "object") return out;
  const entries = Array.isArray(payload) ? payload.entries() : Object.entries(payload as Record<string, unknown>);
  let count = 0;
  for (const [key, value] of entries) {
    if (count >= maxKeys) break;
    if (value === null || value === undefined || typeof value === "boolean") continue;
    const n = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(n)) {
      out[String(key).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40)] = n;
      count++;
    }
  }
  return out;
}

/**
 * Fold aggregated external signals into the source's memory domain maps.
 * Values run through an EMA-style blend so single bad pings decay.
 * Returns every signal key that was applied.
 */
export function adoptSignals(
  memory: GlobalEvolutionMemory,
  source: ExternalSource,
  payload: unknown
): Record<string, number> {
  const clean = sanitizeExternalPayload(payload);
  const prefix = SOURCE_PREFIX[source];
  const applied: Record<string, number> = {};

  for (const mapName of SOURCE_TARGETS[source]) {
    const target = memory[mapName];
    for (const [key, value] of Object.entries(clean)) {
      const signalKey = `${prefix}:${key}`;
      // ponytail: EMA blend (0.75/0.25) after the first hit; ceiling: single
      // spikes decay faster than a proper EWMA; upgrade path: real EWMA config.
      target[signalKey] =
        target[signalKey] === undefined || target[signalKey] === 0
          ? value
          : Math.round(target[signalKey] * 0.75 + value * 0.25);
      applied[signalKey] = target[signalKey];
    }
  }
  return applied;
}

/** Sanitize + fold an external agent's raw signal into memory (metadata only). */
export function ingestExternalAgent(
  memory: GlobalEvolutionMemory,
  source: ExternalSource,
  payload: unknown
): { applied: Record<string, number>; domains: Array<"seo" | "security" | "crm" | "smm" | "conversion" | "pricing"> } {
  const applied = adoptSignals(memory, source, payload);
  // ponytail: apply value once (adoptSignals) — no extra frequency tally so
  // external payload magnitudes are not double-counted; ceiling: single value
  // model, no separate event-frequency; upgrade path: dedicated counter maps.
  const domains = [...new Set(SOURCE_TARGETS[source].map((m) => SIGNAL_DOMAIN[m]))];
  return { applied, domains };
}