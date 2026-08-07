/* ==========================================
   ESLINT RULE: no-hardcoded-values
   Blocks hardcoded px values and hex colors.
   Enforces design token usage.
   ========================================== */

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow hardcoded spacing and color values",
      category: "Design System",
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      hardcodedPx: "Hardcoded px value '{{value}}'. Use a design token (e.g., var(--space-*)).",
      hardcodedColor: "Hardcoded color '{{value}}'. Use a semantic token (e.g., var(--color-*)).",
      hardcodedRem: "Hardcoded rem value '{{value}}'. Use a typography token (e.g., var(--font-size-*)).",
    },
  },
  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      Literal(node) {
        if (typeof node.value !== "string") return;
        const value = node.value;

        // Check for hex colors
        if (/^#[0-9a-fA-F]{3,8}$/.test(value)) {
          context.report({
            node,
            messageId: "hardcodedColor",
            data: { value },
          });
        }

        // Check for px values
        if (/^-?\d+(\.\d+)?px$/.test(value)) {
          context.report({
            node,
            messageId: "hardcodedPx",
            data: { value },
          });
        }

        // Check for rem values (font-size contexts)
        if (/^-?\d+(\.\d+)?rem$/.test(value)) {
          context.report({
            node,
            messageId: "hardcodedRem",
            data: { value },
          });
        }
      },
    };
  },
};
