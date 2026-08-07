/* ==========================================
   A-OS — TOOL EXECUTOR (S4 stub)
   Minimal synchronous tool dispatch.
   No frameworks, no abstractions.
   ========================================== */

export type ToolName = "log" | "fetch";

export interface ToolResult {
  tool: ToolName;
  ok: boolean;
  output: unknown;
}

/** Execute a named tool with a payload. Deterministic, synchronous. */
export function executeTool(name: ToolName, payload: unknown): ToolResult {
  switch (name) {
    case "log": {
      const message = typeof payload === "string" ? payload : JSON.stringify(payload);
      return { tool: name, ok: true, output: message };
    }
    case "fetch": {
      const url = typeof payload === "string" ? payload : (payload as { url: string }).url;
      return { tool: name, ok: false, output: `fetch stub: ${url}` };
    }
    default:
      return { tool: name as ToolName, ok: false, output: `unknown tool: ${name}` };
  }
}
