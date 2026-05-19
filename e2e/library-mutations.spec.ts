/**
 * Library mutations happy-path E2E spec.
 *
 * NOT auto-run in CI. Run manually with:
 *   pnpm test:e2e --headed
 *
 * Requires a local Supabase stack with a seeded test user.
 * Skip markers prevent accidental CI execution.
 */

import { expect, test } from "@playwright/test";

// All tests in this file are skipped in CI.
// Remove the skip flag and configure `storageState` for local manual runs.
test.describe("Library mutations happy path", () => {
  test.skip(
    !process.env.E2E_RUN_MUTATIONS,
    "Library mutations tests require E2E_RUN_MUTATIONS=1 and a running local stack"
  );

  test("add book to library, change status, then delete", async ({ page }) => {
    // 1. Navigate to search page (assumes already authenticated via storageState)
    await page.goto("/library/search");
    await expect(page).toHaveURL(/\/library\/search/);

    // 2. Search for a book
    const searchInput = page.getByRole("searchbox");
    await searchInput.fill("harry potter");
    await page.getByRole("button", { name: /buscar/i }).click();

    // 3. Wait for results
    await expect(page.getByRole("list")).toBeVisible();
    const firstCard = page.getByRole("listitem").first();
    await expect(firstCard).toBeVisible();

    // 4. Open the add dialog for the first result
    const addButton = firstCard.getByRole("button", { name: /agregar/i });
    await addButton.click();

    // 5. Dialog should be open
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: /agregar a tu biblioteca/i })).toBeVisible();

    // 6. Confirm add with default status
    await dialog.getByRole("button", { name: /agregar/i }).click();

    // 7. Expect success toast
    await expect(page.getByText(/agregado a tu biblioteca/i)).toBeVisible();

    // 8. Navigate to library list
    await page.goto("/library");
    await expect(page).toHaveURL(/\/library/);

    // 9. Find the new entry card and open its actions menu
    const entryCard = page
      .getByRole("listitem")
      .filter({ hasText: /harry potter/i })
      .first();
    await expect(entryCard).toBeVisible();

    const actionsButton = entryCard.getByRole("button", { name: /acciones del libro/i });
    await actionsButton.click();

    // 10. Change status to "leyendo"
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    await menu.getByText(/marcar como leyendo/i).click();

    // 11. Delete the entry
    await actionsButton.click();
    await expect(menu).toBeVisible();
    await menu.getByText(/eliminar/i).click();

    // 12. Verify the entry is gone
    await expect(entryCard).not.toBeVisible();
  });
});
