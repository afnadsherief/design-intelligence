/* ==========================================
   DESIGN INTELLIGENCE - COMPONENT TYPES
   Strict TypeScript contracts for all components.
   Missing props = compile-time error.
   Invalid variants = compile-time error.
   ========================================== */

export type Variant = "primary" | "secondary" | "ghost" | "destructive" | "outline" | "link";
export type Size = "sm" | "md" | "lg";
export type InputType = "text" | "email" | "password";

export interface ButtonProps {
  variant: Variant;
  size: Size;
  children: React.ReactNode;
  disabled?: boolean;
  asChild?: boolean;
  className?: string;
  onClick?: () => void;
}

export interface InputProps {
  type: InputType;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

export interface SectionProps {
  size: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
  className?: string;
}

export interface ContainerProps {
  size: "sm" | "md" | "lg" | "xl" | "full";
  children: React.ReactNode;
  className?: string;
}
