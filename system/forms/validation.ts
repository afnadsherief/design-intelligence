import type { ZodType } from "zod";

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> };

/**
 * Validate arbitrary form values against a Zod schema.
 * Returns field-keyed error messages compatible with react-hook-form's
 * `setError` convention (dotted paths flattened to dot notation).
 */
export function validateForm<T>(
  schema: ZodType<T>,
  values: unknown
): ValidationResult<T> {
  const parsed = schema.safeParse(values);
  if (parsed.success) {
    return { success: true, data: parsed.data };
  }

  const errors: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "form";
    if (!(key in errors)) {
      errors[key] = issue.message;
    }
  }

  return { success: false, errors };
}