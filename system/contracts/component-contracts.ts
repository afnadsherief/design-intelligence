/* ==========================================
   DESIGN INTELLIGENCE - COMPONENT CONTRACTS
   Defines required props and forbidden patterns
   for each component.
   ========================================== */

export const contracts = {
  button: {
    requiredProps: ["variant", "size"],
    forbidden: ["px", "hardcoded colors", "inline styles", "#", "style="],
  },
  input: {
    requiredProps: ["type"],
    forbidden: ["px", "hex", "#", "style="],
  },
  card: {
    requiredProps: [],
    forbidden: ["px", "hardcoded padding", "#", "style="],
  },
  section: {
    requiredProps: ["size"],
    forbidden: ["px", "hardcoded spacing", "#", "style="],
  },
  container: {
    requiredProps: ["size"],
    forbidden: ["px", "hardcoded width", "#", "style="],
  },
};

export function getContract(componentName: string) {
  return contracts[componentName as keyof typeof contracts];
}

export function isTokenAllowed(componentName: string, token: string): boolean {
  const contract = getContract(componentName);
  if (!contract) return true;
  return !contract.forbidden.some((f) => token.includes(f));
}

export function hasForbiddenPattern(componentName: string, code: string): boolean {
  const contract = getContract(componentName);
  if (!contract) return false;
  return contract.forbidden.some((pattern) => code.includes(pattern));
}
