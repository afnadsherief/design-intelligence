/* ==========================================
   DESIGN INTELLIGENCE - COMPONENT KIND SYSTEM
   Classifies components so validation rules can
   adapt: primitives and layouts are exempt from
   composite-purity import checks, and generated
   code (importing via @/system) is recognized.
   ========================================== */

export type ComponentKind = "primitive" | "layout" | "composite" | "product";

const PRIMITIVE_NAMES = new Set(["Button", "Input", "Card"]);
const LAYOUT_RE = /layout|section|container|shell|sidebar|navbar|footer|header|main-content|maincontent/i;
const PRODUCT_RE = /page|screen|view|route/i;

export function classifyComponent(name: string, _code: string): ComponentKind {
  const trimmed = name.trim();
  if (PRIMITIVE_NAMES.has(trimmed)) return "primitive";
  if (/primitive/i.test(trimmed)) return "primitive";
  if (LAYOUT_RE.test(trimmed)) return "layout";
  if (PRODUCT_RE.test(trimmed)) return "product";
  return "composite";
}