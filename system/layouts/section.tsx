import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/tooling/utils";

/* ==========================================
   SECTION LAYOUT
   Uses tokens from tokens/component.css.
   ========================================== */

const sectionVariants = cva("", {
  variants: {
    size: {
      sm: "py-[var(--section-padding-sm)]",
      md: "py-[var(--section-padding-md)]",
      lg: "py-[var(--section-padding-lg)]",
      xl: "py-[var(--section-padding-xl)]",
    },
  },
  defaultVariants: { size: "md" },
});

interface SectionProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof sectionVariants> {}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, size, ...props }, ref) => (
    <section ref={ref} className={cn(sectionVariants({ size }), className)} {...props} />
  )
);
Section.displayName = "Section";

const SectionHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col items-center text-center space-y-4 mb-12", className)}
    {...props}
  />
));
SectionHeader.displayName = "SectionHeader";

const SectionTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-[var(--font-size-8)] font-bold tracking-tight", className)}
    {...props}
  />
));
SectionTitle.displayName = "SectionTitle";

const SectionDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-[var(--font-size-4)] text-[rgb(var(--text-secondary))] max-w-[700px]", className)}
    {...props}
  />
));
SectionDescription.displayName = "SectionDescription";

export { Section, SectionHeader, SectionTitle, SectionDescription };
