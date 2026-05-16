import { expect, test } from "@playwright/test";

test("login page renders Google OAuth button", async ({ page }) => {
  await page.goto("/login");

  const button = page.getByRole("button", { name: /continuar con google/i });
  await expect(button).toBeVisible();
  await expect(button).toBeEnabled();
});
