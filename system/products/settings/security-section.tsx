import { Section } from "../../layouts/section";
import { Container } from "../../layouts/container";
import { Card, CardHeader, CardTitle, CardContent } from "../../primitives/card";

/* ==========================================
   SETTINGS - SECURITY SECTION
   ========================================== */

export interface SecuritySectionProps {
  onSubmit: (data: { currentPassword: string; newPassword: string }) => void;
}

export function SecuritySection({ onSubmit }: SecuritySectionProps) {
  return (
    <Section size="md">
      <Container size="md">
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-[var(--space-component-lg)]" onSubmit={(e) => { e.preventDefault(); onSubmit({ currentPassword: "", newPassword: "" }); }}>
              <div className="flex flex-col gap-[var(--space-component-xs)]">
                <label className="text-[var(--font-size-2)] font-medium text-[rgb(var(--text-primary))]">Current Password</label>
                <input type="password" className="flex w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[rgb(var(--surface-background))] px-[var(--space-component-md)] py-[var(--space-component-sm)] text-[rgb(var(--text-primary))]" />
              </div>
              <div className="flex flex-col gap-[var(--space-component-xs)]">
                <label className="text-[var(--font-size-2)] font-medium text-[rgb(var(--text-primary))]">New Password</label>
                <input type="password" className="flex w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[rgb(var(--surface-background))] px-[var(--space-component-md)] py-[var(--space-component-sm)] text-[rgb(var(--text-primary))]" />
              </div>
              <button type="submit" className="self-start px-[var(--space-component-lg)] py-[var(--space-component-sm)] bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] rounded-[var(--radius-md)] font-medium">Update Password</button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Section>
  );
}
