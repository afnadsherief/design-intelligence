/* ==========================================
   A-OS — HERMES SKILL LAYER
   Deterministic, pure skills. Input → output.
   Skills NEVER mutate code or memory directly —
   runPipeline/Fix-Agent own mutations.
   ========================================== */

export interface HermesSkill {
  name: string;
  domain: string;
  deterministic: true;
  execute(input: unknown): unknown;
}

/** Refactor — deterministic advisory scan for obvious cleanup signals. */
const refactor: HermesSkill = {
  name: "Refactor",
  domain: "code",
  deterministic: true,
  execute(input: unknown) {
    const code = (input as { code?: string }).code ?? "";
    const hardcodedHex = (code.match(/#[0-9a-fA-F]{3,8}/g) ?? []).length;
    const hardcodedPx = (code.match(/\b\d+px\b/g) ?? []).length;
    const repeats = new Map<string, number>();
    for (const m of code.matchAll(/className="([^"]+)"/g)) {
      repeats.set(m[1], (repeats.get(m[1]) ?? 0) + 1);
    }
    const duplicatedClasses = [...repeats].filter(([, count]) => count > 1).map(([c]) => c);
    return {
      advisories: {
        hardcodedHex,
        hardcodedPx,
        duplicatedClassGroups: duplicatedClasses.length,
      },
      details: [
        hardcodedHex ? `Hardcoded hex values (${hardcodedHex}) — prefer rgb(var(--…)) tokens` : null,
        hardcodedPx ? `Hardcoded px values (${hardcodedPx}) — prefer --space-* tokens` : null,
        ...duplicatedClasses.slice(0, 5).map((c) => `Duplicated class ${c} — extract to cva variant`),
      ]
        .filter((d): d is string => d !== null)
        .join("\n"),
    };
  },
};

/** ComposeUI: deterministic assembly of validated parts into a composite. */
const composeUi: HermesSkill = {
  name: "ComposeUI",
  domain: "ui",
  deterministic: true,
  execute(input: unknown) {
    const parts = (input as { parts?: string[] }).parts ?? [];
    const body = parts.map((p) => p.trim()).filter(Boolean).join("\n      ");
    return {
      composed: `export function Composed() {\n  return (\n    <section className="grid gap-4">\n      ${body}\n    </section>\n  );\n}`,
      partCount: parts.length,
    };
  },
};

/** CopyForge — deterministic {{key}} template fill with sanitized values. */
const copyForge: HermesSkill = {
  name: "CopyForge",
  domain: "content",
  deterministic: true,
  execute(input: unknown) {
    const { template, variables } = input as { template?: string; variables?: Record<string, string> };
    let out = template ?? "";
    for (const [key, raw] of Object.entries(variables ?? {})) {
      const safe = String(raw).slice(0, 200);
      out = out.split(`{{${key}}}`).join(safe);
    }
    return { output: out, templateKeys: Object.keys(variables ?? {}).length };
  },
};

/** Ranker — deterministic prioritization mirroring A-OS formula. */
const ranker: HermesSkill = {
  name: "Ranker",
  domain: "intelligence",
  deterministic: true,
  execute(input: unknown) {
    const items = (input as { items?: Array<{ id: string; impact: number; confidence: number; successRate?: number; frequency?: number }> }).items ?? [];
    return items
      .map((item, index) => ({
        id: item.id,
        score: item.impact * item.confidence * (item.successRate ?? 0.5) * Math.max(1, item.frequency ?? 0),
        _index: index,
      }))
      .sort((a, b) => b.score - a.score || a._index - b._index)
      .map(({ id, score }) => ({ id, score }));
  },
};

/** PatternEye — deterministic code-pattern fingerprint. */
const patternEye: HermesSkill = {
  name: "PatternEye",
  domain: "code",
  deterministic: true,
  execute(input: unknown) {
    const code = (input as { code?: string }).code ?? "";
    return {
      patterns: {
        imgWithoutAlt: (code.match(/<img\b(?![^>]*\balt=)/g) ?? []).length,
        buttonWithoutType: (code.match(/<button\b(?![^>]*\btype=)/g) ?? []).length,
        blankTargetNoRel: (code.match(/<a\b(?![^>]*\brel=)(?=[^>]*\btarget=(?:"_blank"|'_blank'))/g) ?? []).length,
        hardcodedHex: (code.match(/#[0-9a-fA-F]{3,8}/g) ?? []).length,
        dangerousHtml: (code.match(/dangerouslySetInnerHTML/g) ?? []).length,
      },
    };
  },
};

export const SKILLS: readonly HermesSkill[] = [refactor, composeUi, copyForge, ranker, patternEye];

export function getSkill(name: string): HermesSkill | undefined {
  return SKILLS.find((s) => s.name === name);
}

export function invokeSkill(name: string, input: unknown): unknown {
  const skill = getSkill(name);
  if (!skill) throw new Error(`Unknown Hermes skill: ${name}`);
  return skill.execute(input);
}

import { executeTool } from "@/system/tools/executor";

/** Hook for skills/tools to call external tools via ToolExecutor. */
export { executeTool };

/** Wrapper — call a tool by name with payload, returns structured result. */
export function callTool(name: string, payload: unknown) {
  return executeTool(name as "log" | "fetch", payload);
}