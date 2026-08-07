import { Section } from "../../layouts/section";
import { Container } from "../../layouts/container";
import { Card, CardHeader, CardTitle, CardContent } from "../../primitives/card";

/* ==========================================
   SETTINGS - PREFERENCES
   ========================================== */

export interface PreferencesProps {
  theme?: "light" | "dark" | "system";
  notifications?: boolean;
  onThemeChange?: (theme: string) => void;
  onNotificationsChange?: (enabled: boolean) => void;
}

export function Preferences({ theme = "system", notifications = true, onThemeChange, onNotificationsChange }: PreferencesProps) {
  return (
    <Section size="md">
      <Container size="md">
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-[var(--space-component-lg)]">
              <div className="flex justify-between items-center">
                <span className="text-[var(--font-size-3)] text-[rgb(var(--text-primary))]">Theme</span>
                <select value={theme} onChange={(e) => onThemeChange?.(e.target.value)} className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[rgb(var(--surface-background))] px-[var(--space-component-md)] py-[var(--space-component-sm)] text-[rgb(var(--text-primary))]">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--font-size-3)] text-[rgb(var(--text-primary))]">Notifications</span>
                <button onClick={() => onNotificationsChange?.(!notifications)} className="px-[var(--space-component-md)] py-[var(--space-component-sm)] rounded-[var(--radius-md)] bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] font-medium">
                  {notifications ? "Enabled" : "Disabled"}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Container>
    </Section>
  );
}
