import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../primitives/card";
import { Input } from "../../primitives/input";
import { Button } from "../../primitives/button";

/* ==========================================
   AUTH - SIGNUP FORM
   Composes: Card + Input + Button
   ========================================== */

export interface SignupFormProps {
  onSubmit: (data: { name: string; email: string; password: string }) => void;
  error?: string;
}

export function SignupForm({ onSubmit, error }: SignupFormProps) {
  return (
    <Card className="w-full max-w-[calc(var(--container-max-sm))]">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Get started with your free account</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-[var(--space-component-lg)]"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const name = (form.querySelector('[name="name"]') as HTMLInputElement).value;
            const email = (form.querySelector('[name="email"]') as HTMLInputElement).value;
            const password = (form.querySelector('[name="password"]') as HTMLInputElement).value;
            onSubmit({ name, email, password });
          }}
        >
          {error && (
            <div className="p-[var(--space-component-md)] rounded-[var(--radius-md)] bg-[rgb(var(--color-error)/0.1)] border border-[rgb(var(--color-error))]">
              <p className="text-[var(--font-size-2)] text-[rgb(var(--color-error))]">{error}</p>
            </div>
          )}
          <div className="flex flex-col gap-[var(--space-component-xs)]">
            <label htmlFor="signup-name" className="text-[var(--font-size-2)] font-medium text-[rgb(var(--text-primary))]">
              Full Name
            </label>
            <Input id="signup-name" name="name" type="text" placeholder="John Doe" />
          </div>
          <div className="flex flex-col gap-[var(--space-component-xs)]">
            <label htmlFor="signup-email" className="text-[var(--font-size-2)] font-medium text-[rgb(var(--text-primary))]">
              Email
            </label>
            <Input id="signup-email" name="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="flex flex-col gap-[var(--space-component-xs)]">
            <label htmlFor="signup-password" className="text-[var(--font-size-2)] font-medium text-[rgb(var(--text-primary))]">
              Password
            </label>
            <Input id="signup-password" name="password" type="password" placeholder="Create password" />
          </div>
          <Button variant="default" size="default">Create Account</Button>
        </form>
      </CardContent>
    </Card>
  );
}
