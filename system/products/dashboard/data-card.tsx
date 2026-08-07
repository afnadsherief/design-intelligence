import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../primitives/card";

/* ==========================================
   DASHBOARD - DATA CARD
   Composes: Card + token-driven content
   ========================================== */

export interface DataCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function DataCard({ title, description, children }: DataCardProps) {
  return (
    <Card className="bg-[rgb(var(--surface-elevated))]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
