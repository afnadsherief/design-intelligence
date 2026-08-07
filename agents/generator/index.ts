import { type ValidationResult } from "@/system";
import { applyFixes, type FixResult } from "@/agents/design-qa/fix-agent";
import { learnFromRun, qualityScore, type EvolutionMemory } from "@/system/evolution";

export interface GeneratedComponent {
  name: string;
  code: string;
  validation: ValidationResult;
  fix: FixResult | null;
}

interface Template {
  name: string;
  code: string;
  props: Record<string, unknown>;
}

type TemplateKind = "form" | "pricing" | "hero" | "card" | "button" | "default";

function detectTemplate(prompt: string): TemplateKind {
  const p = prompt.toLowerCase();
  if (/(login|signup|auth|contact|form)/.test(p)) return "form";
  if (/(pricing|plan|billing)/.test(p)) return "pricing";
  if (/(hero|landing|header)/.test(p)) return "hero";
  if (/(product|card|tile)/.test(p)) return "card";
  if (/(button|cta|action)/.test(p)) return "button";
  return "default";
}

/** All template kinds a prompt could match (excluding the always-on default). */
function detectTemplateCandidates(prompt: string): TemplateKind[] {
  const p = prompt.toLowerCase();
  const candidates: TemplateKind[] = [];
  if (/(login|signup|auth|contact|form)/.test(p)) candidates.push("form");
  if (/(pricing|plan|billing)/.test(p)) candidates.push("pricing");
  if (/(hero|landing|header)/.test(p)) candidates.push("hero");
  if (/(product|card|tile)/.test(p)) candidates.push("card");
  if (/(button|cta|action)/.test(p)) candidates.push("button");
  return candidates;
}

/**
 * PART 7 — memory-biased template selection.
 * For ambiguous prompts, prefer the candidate template with the best
 * historical avgScore (from memory); ties break toward priority order.
 */
function biasTemplate(
  candidates: TemplateKind[],
  memory?: EvolutionMemory
): TemplateKind {
  if (!memory || candidates.length <= 1) return candidates[0] ?? "default";
  let best: TemplateKind = candidates[0];
  let bestScore = -1;
  for (const kind of candidates) {
    const stats = memory.components[TEMPLATES[kind].name];
    const score = stats?.avgScore ?? -1;
    if (score > bestScore) {
      bestScore = score;
      best = kind;
    }
  }
  return best;
}

const TEMPLATES: Record<TemplateKind, Template> = {
  form: {
    name: "GeneratedForm",
    code: `import { Button, Input } from "@/system";

export interface GeneratedFormProps {
  onSubmit: (data: { email: string }) => void;
}

export function GeneratedForm({ onSubmit }: GeneratedFormProps) {
  return (
    <form
      className="flex flex-col gap-[var(--space-component-lg)]"
      onSubmit={(e) => {
        e.preventDefault();
        const email = (e.currentTarget.querySelector('[name="email"]') as HTMLInputElement).value;
        onSubmit({ email });
      }}
    >
      <label
        htmlFor="gen-email"
        className="text-[var(--font-size-2)] font-medium text-[rgb(var(--text-primary))]"
      >
        Email
      </label>
      <Input id="gen-email" name="email" type="email" placeholder="you@example.com" />
      <Button variant="default" size="default" type="submit">
        Submit
      </Button>
    </form>
  );
}`,
    props: { variant: "default", size: "default" },
  },
  pricing: {
    name: "GeneratedPricing",
    code: `import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button } from "@/system";

export interface GeneratedPricingProps {
  name: string;
  price: string;
  features: string[];
}

export function GeneratedPricing({ name, price, features }: GeneratedPricingProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{price}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-[var(--space-component-md)] text-[rgb(var(--text-secondary))]">
          {features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button variant="default" size="default">
          Choose {name}
        </Button>
      </CardFooter>
    </Card>
  );
}`,
    props: { variant: "default", size: "default" },
  },
  hero: {
    name: "GeneratedHero",
    code: `import { Button } from "@/system";

export interface GeneratedHeroProps {
  title: string;
  ctaText?: string;
}

export function GeneratedHero({ title, ctaText }: GeneratedHeroProps) {
  return (
    <section className="py-[var(--section-padding-xl)] text-center">
      <h1 className="text-[var(--font-size-9)] font-bold tracking-tight text-[rgb(var(--text-primary))]">
        {title}
      </h1>
      {ctaText && (
        <Button variant="default" size="lg" className="mt-[var(--space-component-lg)]">
          {ctaText}
        </Button>
      )}
    </section>
  );
}`,
    props: { variant: "default", size: "default" },
  },
  card: {
    name: "GeneratedCard",
    code: `import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/system";

export interface GeneratedCardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function GeneratedCard({ title, description, children }: GeneratedCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
}`,
    props: { variant: "default", size: "default" },
  },
  button: {
    name: "GeneratedCta",
    code: `import { Button } from "@/system";

export interface GeneratedCtaProps {
  label: string;
  onClick?: () => void;
}

export function GeneratedCta({ label, onClick }: GeneratedCtaProps) {
  return (
    <Button variant="default" size="lg" onClick={onClick}>
      {label}
    </Button>
  );
}`,
    props: { variant: "default", size: "default" },
  },
  default: {
    name: "GeneratedSection",
    code: `import { Section, Container } from "@/system";

export interface GeneratedSectionProps {
  title: string;
  children?: React.ReactNode;
}

export function GeneratedSection({ title, children }: GeneratedSectionProps) {
  return (
    <Section size="lg">
      <Container size="lg">
        <h2 className="text-[var(--font-size-7)] font-bold text-[rgb(var(--text-primary))]">
          {title}
        </h2>
        {children}
      </Container>
    </Section>
  );
}`,
    props: { variant: "default", size: "default" },
  },
};

/**
 * Rule-based component generator. Guarantees:
 * - token-driven styling (var(--*) only)
 * - variants drilled from the existing Button contract
 * - valid TSX output, self-validated with openDesign()
 * - output passes through applyFixes() so safe a11y fixes
 *   (button type, img alt, anchor rel) are applied post-generation
 * - with memory: ambiguous prompts bias toward the best-scoring
 *   template and the run is recorded (components / generator agent)
 */
export function generateComponent(
  prompt: string,
  memory?: EvolutionMemory
): GeneratedComponent {
  const candidates = detectTemplateCandidates(prompt);
  const kind = biasTemplate(candidates, memory);
  const template = TEMPLATES[kind];

  const fix = applyFixes(template.name, template.code, template.props);
  const code = fix.fixed ? (fix.code as string) : template.code;
  const validation = fix.validationAfter;

  // PART 7 — remember generator outcomes for future template bias.
  if (memory) {
    learnFromRun(
      { agentType: "generator", componentName: template.name, passes: fix.passCount },
      { scoreBefore: 0, scoreAfter: qualityScore(validation) },
      memory
    );
  }

  return {
    name: template.name,
    code,
    validation,
    fix: fix.fixed ? fix : null,
  };
}