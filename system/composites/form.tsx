import { Input } from "../primitives/input";
import { Button } from "../primitives/button";

/* ==========================================
   FORM COMPOSITE
   Composes: Input + Button + Spacing
   Zero new styling — inherits from primitives.
   ========================================== */

export interface FormField {
  type: "text" | "email" | "password";
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export interface FormProps {
  fields: FormField[];
  submitText: string;
  onSubmit: (data: Record<string, string>) => void;
}

export function Form({ fields, submitText, onSubmit }: FormProps) {
  return (
    <form
      className="flex flex-col gap-[var(--space-component-lg)]"
      onSubmit={(e) => {
        e.preventDefault();
        const data: Record<string, string> = {};
        fields.forEach((field) => {
          const input = e.currentTarget.querySelector(`[name="${field.type}"]`) as HTMLInputElement;
          if (input) data[field.type] = input.value;
        });
        onSubmit(data);
      }}
    >
      {fields.map((field) => (
        <div key={field.type} className="flex flex-col gap-[var(--space-component-xs)]">
          {field.label && (
            <label className="text-[var(--font-size-2)] font-medium text-[rgb(var(--text-primary))]">
              {field.label}
            </label>
          )}
          <Input type={field.type} placeholder={field.placeholder} />
        </div>
      ))}
      <Button variant="default" size="default">
        {submitText}
      </Button>
    </form>
  );
}
