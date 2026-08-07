import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../primitives/card";
import { Input } from "../../primitives/input";
import { Button } from "../../primitives/button";

/* ==========================================
   AUTH - LOGIN FORM
   Composes: Card + Input + Button
   Accessible: labels, focus, error states
   ========================================== */

export interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => void;
  error?: string;
}

export function LoginForm({ onSubmit, error }: LoginFormProps) {
  return (
    <Card className="w-full max-w-[calc(var(--container-max-sm))]">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-[var(--space-component-lg)]"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const email = (form.querySelector('[name="email"]') as HTMLInputElement).value;
            const password = (form.querySelector('[name="password"]') as HTMLInputElement).value;
            onSubmit({ email, password });
          }}
        >
          {error && (
            <div className="p-[var(--space-component-md)] rounded-[var(--radius-md)] bg-[rgb(var(--color-error)/0.1)] border border-[rgb(var(--color-error))]">
              <p className="text-[var(--font-size-2)] text-[rgb(var(--color-error))]">{error}</p>
            </div>
          )}
          <div className="flex flex-col gap-[var(--space-component-xs)]">
            <label htmlFor="login-email" className="text-[var(--font-size-2)] font-medium text-[rgb(var(--text-primary))]">
              Email
            </label>
            <Input id="login-email" name="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="flex flex-col gap-[var(--space-component-xs)]">
            <label htmlFor="login-password" className="text-[var(--font-size-2)] font-medium text-[rgb(var(--text-primary))]">
              Password
            </label>
            <Input id="login-password" name="password" type="password" placeholder="Enter password" />
          </div>
          <Button variant="default" size="default">Sign In</Button>
        </form>
      </CardContent>
    </Card>
  );
}
