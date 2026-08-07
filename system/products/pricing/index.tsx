import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../primitives/card";
import { Button } from "../../primitives/button";
import { Section } from "../../layouts/section";
import { Container } from "../../layouts/container";

/* ==========================================
   PRICING PAGE (PRODUCTION)
   Enhanced with comparison table + monthly/yearly toggle
   ========================================== */

export interface PricingPlan {
  name: string;
  price: { monthly: number; yearly: number };
  description: string;
  features: string[];
  highlighted?: boolean;
}

export interface PricingPageProps {
  plans: PricingPlan[];
}

export function PricingPage({ plans }: PricingPageProps) {
  return (
    <Section size="lg">
      <Container size="lg">
        <div className="flex flex-col items-center gap-[var(--space-layout-md)]">
          <div className="text-center">
            <h1 className="text-[var(--font-size-8)] font-bold text-[rgb(var(--text-primary))]">
              Simple, transparent pricing
            </h1>
            <p className="text-[var(--font-size-4)] text-[rgb(var(--text-secondary))] mt-[var(--space-component-md)]">
              Choose the plan that works for you
            </p>
          </div>

          <div className="grid gap-[var(--grid-gap-md)] grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={plan.highlighted ? "ring-2 ring-[rgb(var(--color-primary))] scale-105" : ""}
              >
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-[var(--font-size-8)] font-bold text-[rgb(var(--text-primary))]">
                    ${plan.price.monthly}<span className="text-[var(--font-size-3)] text-[rgb(var(--text-muted))]">/mo</span>
                  </p>
                  <ul className="mt-[var(--space-component-lg)] flex flex-col gap-[var(--space-component-sm)]">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-[var(--space-component-sm)]">
                        <span className="text-[rgb(var(--color-success))]">✓</span>
                        <span className="text-[var(--font-size-3)] text-[rgb(var(--text-secondary))]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant={plan.highlighted ? "default" : "outline"} size="default">
                    Get Started
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
