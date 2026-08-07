/* ==========================================
   DESIGN INTELLIGENCE - PERFORMANCE HEURISTIC
   Shared by openDesign() and the performance agent.
   Token density is rewarded; source size, class
   repetition, variant sprawl, and hardcoded values
   are penalized (each capped so one factor cannot
   zero the score alone).
   ========================================== */

export interface PerformanceMetrics {
  score: number;
  sourceLength: number;
  classNameCount: number;
  variantCount: number;
  hardcodedCount: number;
  tokenCount: number;
}

export function scorePerformance(code: string): PerformanceMetrics {
  const sourceLength = code.length;
  const classNameCount = (code.match(/className/g) ?? []).length;
  const variantCount = (code.match(/\bvariant\b/g) ?? []).length;
  const hardcodedCount = (code.match(/\d+px|\d+rem|#[0-9a-fA-F]{3,8}/g) ?? []).length;
  const tokenCount = (code.match(/var\(--/g) ?? []).length;

  const sizePenalty = Math.min(30, Math.max(0, (sourceLength - 800) / 40));
  const classPenalty = Math.min(30, classNameCount * 3);
  const variantPenalty = Math.min(10, variantCount * 2);
  const hardcodedPenalty = Math.min(20, hardcodedCount * 5);
  const tokenBonus = Math.min(10, tokenCount / 10);

  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        100 - sizePenalty - classPenalty - variantPenalty - hardcodedPenalty + tokenBonus
      )
    )
  );

  return {
    score,
    sourceLength,
    classNameCount,
    variantCount,
    hardcodedCount,
    tokenCount,
  };
}