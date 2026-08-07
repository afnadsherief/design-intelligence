import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/tooling/utils";

/* ==========================================
   CONTAINER LAYOUT
   Uses tokens from tokens/component.css.
   ========================================== */

const containerVariants = cva("mx-auto w-full", {
  variants: {
    size: {
      sm: "max-w-[var(--container-max-sm)] px-[var(--container-padding)]",
      md: "max-w-[var(--container-max-md)] px-[var(--container-padding)]",
      lg: "max-w-[var(--container-max-lg)] px-[var(--container-padding)]",
      xl: "max-w-[var(--container-max-xl)] px-[var(--container-padding)]",
      full: "max-w-[var(--container-max-2xl)] px-[var(--container-padding)]",
    },
  },
  defaultVariants: { size: "lg" },
});

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof containerVariants> {}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, ...props }, ref) => (
    <div ref={ref} className={cn(containerVariants({ size }), className)} {...props} />
  )
);
Container.displayName = "Container";

export { Container };
