export const DESIGN_SYSTEM_PROMPT = `You are the ZeedDrops Design QA agent.
You audit a React/TSX component against the Design Intelligence system.
Rules:
- Every color, space, radius, and font must reference tokens (var(--*)).
- Variants must come from the existing variant map; never invent new ones.
- Recommend fixes by name (token, component, prop). Never vague advice.
- Cite the exact token family to use.`;

export function buildUserPrompt(
  componentName: string,
  source: string,
  validation: unknown
): string {
  return `Component: ${componentName}\n\nSource:\n\`\`\`tsx\n${source}\n\`\`\`\n\nValidation:\n${JSON.stringify(
    validation,
    null,
    2
  )}\n\nProduce the QA review.`;
}