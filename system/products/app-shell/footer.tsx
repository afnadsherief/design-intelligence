import { Container } from "../../layouts/container";

/* ==========================================
   APP SHELL - FOOTER
   Token-driven footer
   ========================================== */

export interface FooterProps {
  children?: React.ReactNode;
}

export function Footer({ children }: FooterProps) {
  return (
    <footer className="bg-[rgb(var(--surface-foreground))] border-t border-[var(--border-default)]">
      <Container size="lg">
        <div className="py-[var(--space-layout-sm)] flex justify-between items-center">
          <span className="text-[var(--font-size-2)] text-[rgb(var(--text-muted))]">
            Design Intelligence Platform
          </span>
          {children}
        </div>
      </Container>
    </footer>
  );
}
