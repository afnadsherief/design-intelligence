import { test, expect } from "@playwright/test";

test("Button + Card render with visual consistency", async ({ page }) => {
  await page.goto("/qa");
  await page.waitForLoadState("networkidle");

  const card = page.locator("[data-qa='card']");
  await expect(card).toBeVisible();
  await expect(page.locator("[data-qa='button']").first()).toBeVisible();

  await expect(page).toHaveScreenshot("button-card.png", {
    maxDiffPixelRatio: 0.02,
  });
});