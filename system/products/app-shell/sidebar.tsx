import { cn } from "@/tooling/utils";

/* ==========================================
   APP SHELL - SIDEBAR
   Token-driven, collapsible, state-safe
   ========================================== */

export interface SidebarProps {
  collapsed?: boolean;
  children?: React.ReactNode;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, children, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        "h-full bg-[rgb(var(--surface-foreground))] border-r border-[var(--border-default)] transition-all duration-[var(--duration-normal)]",
        collapsed ? "w-[var(--sidebar-collapsed-width)]" : "w-[var(--sidebar-width)]"
      )}
    >
      <div className="p-[var(--space-component-lg)]">
        <button
          onClick={onToggle}
          className="mb-[var(--space-component-lg)] p-[var(--space-component-sm)] rounded-[var(--radius-md)] hover:bg-[rgb(var(--surface-elevated))] transition-colors duration-[var(--duration-fast)]"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="text-[rgb(var(--text-primary))]">{collapsed ? "?" : "?"}</span>
        </button>
        <nav className="flex flex-col gap-[var(--space-component-sm)]">
          {children}
        </nav>
      </div>
    </aside>
  );
}
