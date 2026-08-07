/* ==========================================
   DESIGN INTELLIGENCE - TOKEN ENGINE
   Multi-platform theme generator with auto-layer mapping,
   theme switching, and circular dependency validation.
   ========================================== */

import fs from "fs";

export type TokenLayer = "base" | "semantic" | "component";

export interface TokenMap {
  base: Record<string, string>;
  semantic: Record<string, string>;
  component: Record<string, string>;
}

export function generateCSS(tokens: Record<string, string>): string {
  const lines = Object.entries(tokens).map(([key, value]) => `--${key}: ${value};`);
  return `:root {\n  ${lines.join("\n  ")}\n}`;
}

export function buildTheme(file: string): string {
  const tokens = JSON.parse(fs.readFileSync(file, "utf-8"));
  return generateCSS(tokens);
}

export function buildAllThemes(themesDir: string): Record<string, string> {
  const themes: Record<string, string> = {};
  const files = fs.readdirSync(themesDir).filter((f) => f.endsWith(".json"));
  for (const file of files) {
    const themeName = file.replace(".json", "");
    themes[themeName] = buildTheme(`${themesDir}/${file}`);
  }
  return themes;
}

export function validateTheme(theme: Record<string, string>): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  for (const [key, value] of Object.entries(theme)) {
    if (!key.match(/^[a-z0-9-]+$/)) issues.push(`Invalid key format: "${key}"`);
    if (typeof value !== "string") issues.push(`Value for "${key}" must be a string`);
  }
  return { valid: issues.length === 0, issues };
}

export function mapLayers(base: Record<string, string>, semantic: Record<string, string>, component: Record<string, string>): TokenMap {
  return { base, semantic, component };
}

export function validateLayerReferences(layer: Record<string, string>, allowedRefs: Record<string, string>): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  for (const [key, value] of Object.entries(layer)) {
    const refMatches = value.match(/var\(--([a-z0-9-]+)\)/g) || [];
    for (const ref of refMatches) {
      const refName = ref.replace("var(--", "").replace(")", "");
      if (!allowedRefs[refName] && !refName.startsWith("color-") && !refName.startsWith("space-")) {
        issues.push(`Unresolved reference in "${key}": ${ref}`);
      }
    }
  }
  return { valid: issues.length === 0, issues };
}

export function validateNoCircularDeps(tokens: Record<string, string>): { valid: boolean; cycles: string[] } {
  const cycles: string[] = [];
  const visited = new Set<string>();

  for (const key of Object.keys(tokens)) {
    const chain = new Set<string>();
    let current = key;
    while (current && !visited.has(current)) {
      if (chain.has(current)) {
        cycles.push(`Circular dependency: ${current}`);
        break;
      }
      chain.add(current);
      const value = tokens[current];
      const refMatch = value?.match(/var\(--([a-z0-9-]+)\)/);
      current = refMatch ? refMatch[1] : "";
    }
    chain.forEach((k) => visited.add(k));
  }

  return { valid: cycles.length === 0, cycles };
}

export function switchTheme(themeName: string, themesDir: string): string {
  const themeFile = `${themesDir}/${themeName}.json`;
  if (!fs.existsSync(themeFile)) {
    throw new Error(`Theme "${themeName}" not found at ${themeFile}`);
  }
  return buildTheme(themeFile);
}

export function buildFullSystem(baseFile: string, semanticFile: string, componentFile: string): string {
  const base = JSON.parse(fs.readFileSync(baseFile, "utf-8"));
  const semantic = JSON.parse(fs.readFileSync(semanticFile, "utf-8"));
  const component = JSON.parse(fs.readFileSync(componentFile, "utf-8"));

  const baseCSS = generateCSS(base);
  const semanticCSS = generateCSS(semantic);
  const componentCSS = generateCSS(component);

  return `${baseCSS}\n${semanticCSS}\n${componentCSS}`;
}
