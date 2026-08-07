import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../primitives/card";
import { Button } from "../primitives/button";

/* ==========================================
   PRICING COMPOSITE
   Composes: Card + Button + Grid
   Zero new styling — inherits from primitives.
   ========================================== */

export interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  ctaText: string;
  highlighted?: boolean;
}

export interface PricingProps {
  tiers: PricingTier[];
}

export function Pricing({ tiers }: PricingProps) {
  return (
    <div className="grid gap-[var(--grid-gap-md)] grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {tiers.map((tier) => (
        <Card key={tier.name} className={tier.highlighted ? "ring-2 ring-[rgb(var(--color-primary))]" : ""}>
          <CardHeader>
            <CardTitle>{tier.name}</CardTitle>
            <CardDescription>{tier.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--font-size-8)] font-bold text-[rgb(var(--text-primary))]">
              {tier.price}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant={tier.highlighted ? "default" : "outline"} size="default">
              {tier.ctaText}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
