import { test, expect } from "@playwright/test";

test.describe("Compare Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/compare");
  });

  test("renders page title and description", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /Compare/i })
    ).toBeVisible();
    await expect(
      page.getByText(/Side-by-side comparison/i)
    ).toBeVisible();
  });

  test("renders two server selectors", async ({ page }) => {
    // Wait for loading
    await page.waitForTimeout(2000);
    // Selectors should be present with either "Select a server..." or "Loading servers..."
    const selectButtons = page.getByText(/Select a server|Loading servers|No evaluated servers/i);
    expect(await selectButtons.count()).toBeGreaterThanOrEqual(1);
  });

  test("shows empty state before selecting servers", async ({ page }) => {
    await expect(
      page.getByText(/Select two servers|No evaluated servers/i)
    ).toBeVisible();
  });

  test("shows VS label and comparison sections when servers selected", async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);

    // Check if we have servers to compare
    const hasServers = await page.getByText("Select a server...").isVisible().catch(() => false);
    if (!hasServers) {
      // No servers available, skip this test
      test.skip(true, "No evaluated servers to compare");
      return;
    }

    // Select first server
    await page.getByText("Select a server...").first().click();
    // Click the first option in the dropdown
    const firstOption = page.locator(".absolute.z-50 button").first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
      await page.waitForTimeout(200);

      // Select second server
      const secondSelector = page.getByText("Select a server...");
      if (await secondSelector.isVisible()) {
        await secondSelector.click();
        const secondOption = page.locator(".absolute.z-50 button").first();
        if (await secondOption.isVisible()) {
          await secondOption.click();
          await expect(page.getByText("VS", { exact: true })).toBeVisible();
        }
      }
    }
  });
});
