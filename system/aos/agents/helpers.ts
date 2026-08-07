/* ==========================================
   A-OS — SHARED RULE HELPERS FOR DOMAIN AGENTS
   Deterministic, pure, no I/O.
   ========================================== */

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Issue factory — agents emit frequency: 0; orchestrator stamps real frequency. */
export function makeIssue(
  type: string,
  detail: string,
  opts: {
    severity: "low" | "medium" | "high" | "critical";
    impact: number;
    confidence: number;
    patchId?: string;
  }
) {
  return {
    type,
    severity: opts.severity,
    frequency: 0,
    impact: opts.impact,
    confidence: opts.confidence,
    detail,
    ...(opts.patchId ? { patchId: opts.patchId } : {}),
  };
}
