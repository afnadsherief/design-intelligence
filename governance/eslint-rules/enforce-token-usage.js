/* ==========================================
   ESLINT RULE: enforce-token-usage
   Enforces that CSS-in-JS and className usage
   reference design tokens only.
   ========================================== */

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce design token usage in styles",
      category: "Design System",
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      arbitraryValue: "Arbitrary value '{{value}}' detected. Use a design token instead.",
      missingVar: "Style property should use a CSS custom property (var(--token-name)).",
    },
  },
  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      Literal(node) {
        if (typeof node.value !== "string") return;
        const value = node.value;

        // Check for Tailwind arbitrary values (e.g., bg-[#fff], w-[100px])
        if (/\[(#|rgb| hsl|\d)/.test(value)) {
          context.report({
            node,
            messageId: "arbitraryValue",
            data: { value },
          });
        }
      },
    };
  },
};
