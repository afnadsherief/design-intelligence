import { Container } from "../../layouts/container";

/* ==========================================
   APP SHELL - NAVBAR
   Composes: Container + token-driven styling
   ========================================== */

export interface NavbarProps {
  logo?: string;
  children?: React.ReactNode;
}

export function Navbar({ logo = "App", children }: NavbarProps) {
  return (
    <nav className="bg-[rgb(var(--surface-elevated))] border-b border-[var(--border-default)] sticky top-0 z-[var(--z-sticky)]">
      <Container size="lg">
        <div className="flex justify-between items-center h-[var(--navbar-height)]">
          <span className="text-[var(--font-size-6)] font-semibold text-[rgb(var(--text-primary))]">
            {logo}
          </span>
          {children && <div className="flex items-center gap-[var(--space-component-lg)]">{children}</div>}
        </div>
      </Container>
    </nav>
  );
}
