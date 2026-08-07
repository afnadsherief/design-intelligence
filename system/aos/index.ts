/* ==========================================
   A-OS v1 — GLOBAL SELF-EVOLVING COMPANY OS
   index — public surface: types, orchestrator,
   agents, patch registry, external adapters.
   ========================================== */

export * from "./types";
export * from "./agents";
export { orchestrate, runPipeline, buildIssueGraph, type AosOptions, type PipelineInput } from "./orchestrator";
export { patchForIssueType, SAFE_PATCH_IDS } from "./patches";
export {
  ingestExternalAgent,
  adoptSignals,
  sanitizeExternalPayload,
  type ExternalSource,
} from "./adapters";