// openDesign validation for all Phase 4 products
const { openDesign } = require("../evaluation/openDesign");

const components = [
  { name: "navbar", code: require("fs").readFileSync("system/products/app-shell/navbar.tsx", "utf8") },
  { name: "sidebar", code: require("fs").readFileSync("system/products/app-shell/sidebar.tsx", "utf8") },
  { name: "main-content", code: require("fs").readFileSync("system/products/app-shell/main-content.tsx", "utf8") },
  { name: "footer", code: require("fs").readFileSync("system/products/app-shell/footer.tsx", "utf8") },
  { name: "stats-grid", code: require("fs").readFileSync("system/products/dashboard/stats-grid.tsx", "utf8") },
  { name: "activity-feed", code: require("fs").readFileSync("system/products/dashboard/activity-feed.tsx", "utf8") },
  { name: "data-card", code: require("fs").readFileSync("system/products/dashboard/data-card.tsx", "utf8") },
  { name: "chart-container", code: require("fs").readFileSync("system/products/dashboard/chart-container.tsx", "utf8") },
  { name: "login-form", code: require("fs").readFileSync("system/products/auth/login-form.tsx", "utf8") },
  { name: "signup-form", code: require("fs").readFileSync("system/products/auth/signup-form.tsx", "utf8") },
  { name: "forgot-password", code: require("fs").readFileSync("system/products/auth/forgot-password.tsx", "utf8") },
  { name: "pricing-page", code: require("fs").readFileSync("system/products/pricing/index.tsx", "utf8") },
  { name: "profile-section", code: require("fs").readFileSync("system/products/settings/profile-section.tsx", "utf8") },
  { name: "security-section", code: require("fs").readFileSync("system/products/settings/security-section.tsx", "utf8") },
  { name: "preferences", code: require("fs").readFileSync("system/products/settings/preferences.tsx", "utf8") },
];

let passed = 0;
let failed = 0;

for (const comp of components) {
  const result = openDesign(comp.name, comp.code);
  if (result.valid) {
    passed++;
    console.log(`PASS: ${comp.name} (UX: ${result.uxScore.overall}, Perf: ${result.performanceScore})`);
  } else {
    failed++;
    console.log(`FAIL: ${comp.name}`);
    result.errors.forEach((e) => console.log(`  - ${e}`));
  }
}

console.log(`\nResult: ${passed} passed, ${failed} failed out of ${components.length} total`);
