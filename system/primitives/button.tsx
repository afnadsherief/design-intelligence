import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/tooling/utils";

/* ==========================================
   BUTTON PRIMITIVE
   Uses tokens from tokens/component.css via rgb(var()) pattern.
   Contract: system/contracts/component-contracts.ts
   ========================================== */

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors duration-fast ease-ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] shadow-[var(--shadow-sm)] hover:bg-[rgb(var(--color-primary-hover))]",
        destructive: "bg-[rgb(var(--color-error))] text-[rgb(var(--color-error-foreground))] shadow-[var(--shadow-sm)] hover:opacity-90",
        outline: "border border-[var(--border-default)] bg-[rgb(var(--surface-background))] shadow-[var(--shadow-sm)] hover:bg-[rgb(var(--surface-foreground))]",
        secondary: "bg-[rgb(var(--color-secondary))] text-[rgb(var(--color-secondary-foreground))] shadow-[var(--shadow-sm)] hover:opacity-80",
        ghost: "hover:bg-[rgb(var(--surface-foreground))] hover:text-[rgb(var(--text-primary))]",
        link: "text-[rgb(var(--color-primary))] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[var(--button-height-md)] px-[var(--button-padding-x)] py-[var(--button-padding-y)] rounded-[var(--button-radius)] text-[var(--button-font-size)]",
        sm: "h-[var(--button-height-sm)] px-[var(--space-component-md)] rounded-[var(--input-radius)] text-[var(--font-size-1)]",
        lg: "h-[var(--button-height-lg)] px-[var(--space-component-xl)] rounded-[var(--input-radius)] text-[var(--font-size-4)]",
        icon: "h-[var(--button-height-md)] w-[var(--button-height-md)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
