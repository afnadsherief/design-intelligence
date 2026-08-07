import { cn } from "@/tooling/utils";

/* ==========================================
   APP SHELL - MAIN CONTENT
   Token-driven layout area
   ========================================== */

export interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

export function MainContent({ children, className }: MainContentProps) {
  return (
    <main className={cn("flex-1 overflow-auto bg-[rgb(var(--surface-background))]", className)}>
      <div className="p-[var(--space-layout-md)]">
        {children}
      </div>
    </main>
  );
}
