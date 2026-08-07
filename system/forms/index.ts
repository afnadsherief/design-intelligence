import { useForm, type FieldPath, type FieldValues } from "react-hook-form";
import type { ZodType } from "zod";
import { validateForm } from "./validation";

/**
 * react-hook-form bridged to Zod WITHOUT @hookform/resolvers.
 * - register()/watch()/errors work exactly like RHF
 * - handleValidSubmit(onValid) validates the whole form against the schema,
 *   maps issues onto field errors, then calls `onValid(data)` only when valid.
 * Compatible with the existing `Input` component (value/onChange driven).
 */
export function useSchemaForm<T extends FieldValues>(schema: ZodType<T>) {
  const form = useForm<T>({
    mode: "onTouched",
  });

  function handleValidSubmit(onValid: (data: T) => void) {
    return form.handleSubmit((values) => {
      const result = validateForm(schema, values);
      if (!result.success) {
        for (const [key, message] of Object.entries(result.errors)) {
          form.setError(key as FieldPath<T>, { message });
        }
        return;
      }
      onValid(result.data);
    });
  }

  return {
    ...form,
    handleValidSubmit,
  };
}

export * from "./schemas";
export * from "./validation";