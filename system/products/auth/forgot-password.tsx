import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../primitives/card";
import { Input } from "../../primitives/input";
import { Button } from "../../primitives/button";

/* ==========================================
   AUTH - FORGOT PASSWORD
   Composes: Card + Input + Button
   ========================================== */

export interface ForgotPasswordProps {
  onSubmit: (data: { email: string }) => void;
  success?: boolean;
}

export function ForgotPassword({ onSubmit, success }: ForgotPasswordProps) {
  return (
    <Card className="w-full max-w-[calc(var(--container-max-sm))]">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>Enter your email to receive a reset link</CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="p-[var(--space-component-md)] rounded-[var(--radius-md)] bg-[rgb(var(--color-success)/0.1)] border border-[rgb(var(--color-success))]">
            <p className="text-[var(--font-size-2)] text-[rgb(var(--color-success))]">
              Check your email for a reset link.
            </p>
          </div>
        ) : (
          <form
            className="flex flex-col gap-[var(--space-component-lg)]"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const email = (form.querySelector('[name="email"]') as HTMLInputElement).value;
              onSubmit({ email });
            }}
          >
            <div className="flex flex-col gap-[var(--space-component-xs)]">
              <label htmlFor="reset-email" className="text-[var(--font-size-2)] font-medium text-[rgb(var(--text-primary))]">
                Email
              </label>
              <Input id="reset-email" name="email" type="email" placeholder="you@example.com" />
            </div>
            <Button variant="default" size="default">Send Reset Link</Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
