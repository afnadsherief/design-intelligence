import { Card, CardHeader, CardTitle, CardContent } from "../../primitives/card";

/* ==========================================
   DASHBOARD - CHART CONTAINER
   Composes: Card + token-driven chart area
   ========================================== */

export interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
}

export function ChartContainer({ title, children }: ChartContainerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[var(--chart-height)] flex items-center justify-center bg-[rgb(var(--surface-foreground))] rounded-[var(--radius-md)]">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
