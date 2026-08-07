import { Section } from "../../layouts/section";
import { Container } from "../../layouts/container";
import { Card, CardHeader, CardTitle, CardContent } from "../../primitives/card";

/* ==========================================
   SETTINGS - PROFILE SECTION
   ========================================== */

export interface ProfileSectionProps {
  name?: string;
  email?: string;
  onSubmit: (data: { name: string; email: string }) => void;
}

export function ProfileSection({ name = "", email = "", onSubmit }: ProfileSectionProps) {
  return (
    <Section size="md">
      <Container size="md">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-[var(--space-component-lg)]" onSubmit={(e) => { e.preventDefault(); onSubmit({ name, email }); }}>
              <div className="flex flex-col gap-[var(--space-component-xs)]">
                <label className="text-[var(--font-size-2)] font-medium text-[rgb(var(--text-primary))]">Name</label>
                <input type="text" defaultValue={name} className="flex w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[rgb(var(--surface-background))] px-[var(--space-component-md)] py-[var(--space-component-sm)] text-[rgb(var(--text-primary))]" />
              </div>
              <div className="flex flex-col gap-[var(--space-component-xs)]">
                <label className="text-[var(--font-size-2)] font-medium text-[rgb(var(--text-primary))]">Email</label>
                <input type="email" defaultValue={email} className="flex w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[rgb(var(--surface-background))] px-[var(--space-component-md)] py-[var(--space-component-sm)] text-[rgb(var(--text-primary))]" />
              </div>
              <button type="submit" className="self-start px-[var(--space-component-lg)] py-[var(--space-component-sm)] bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] rounded-[var(--radius-md)] font-medium">Save</button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Section>
  );
}
