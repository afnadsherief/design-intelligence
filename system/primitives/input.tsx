import * as React from "react";
import { cn } from "@/tooling/utils";

/* ==========================================
   INPUT PRIMITIVE
   Uses tokens from tokens/component.css via rgb(var()) pattern.
   Contract: system/contracts/component-contracts.ts
   ========================================== */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-[var(--input-radius)] border border-[var(--border-default)] bg-[rgb(var(--surface-background))] px-[var(--input-padding-x)] py-[var(--input-padding-y)] text-[var(--input-font-size)] text-[rgb(var(--text-primary))] ring-offset-[rgb(var(--surface-background))] transition-colors duration-[var(--input-transition)] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[rgb(var(--text-muted))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
