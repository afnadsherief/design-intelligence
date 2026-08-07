import { Card, CardContent } from "../../primitives/card";

/* ==========================================
   DASHBOARD - STATS GRID
   Composes: Card + token-driven grid
   ========================================== */

export interface Stat {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
}

export interface StatsGridProps {
  stats: Stat[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid gap-[var(--grid-gap-md)] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent>
            <p className="text-[var(--font-size-2)] text-[rgb(var(--text-muted))] mb-[var(--space-component-xs)]">
              {stat.label}
            </p>
            <p className="text-[var(--font-size-7)] font-bold text-[rgb(var(--text-primary))]">
              {stat.value}
            </p>
            {stat.change && (
              <p className={cn(
                "text-[var(--font-size-2)] mt-[var(--space-component-xs)]",
                stat.positive ? "text-[rgb(var(--color-success))]" : "text-[rgb(var(--color-error))]"
              )}>
                {stat.change}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
