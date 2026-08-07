import { Button } from "../primitives/button";
import { Container } from "../layouts/container";
import { Section } from "../layouts/section";

/* ==========================================
   HERO COMPOSITE
   Composes: Section + Container + Button
   Zero new styling — inherits from primitives.
   ========================================== */

export interface HeroProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

export function Hero({ title, subtitle, ctaText, onCtaClick }: HeroProps) {
  return (
    <Section size="lg">
      <Container size="md">
        <div className="flex flex-col items-center text-center space-y-6">
          <h1 className="text-[var(--font-size-9)] font-bold tracking-tight text-[rgb(var(--text-primary))]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[var(--font-size-4)] text-[rgb(var(--text-secondary))] max-w-[600px]">
              {subtitle}
            </p>
          )}
          {ctaText && (
            <Button variant="default" size="lg" onClick={onCtaClick}>
              {ctaText}
            </Button>
          )}
        </div>
      </Container>
    </Section>
  );
}
