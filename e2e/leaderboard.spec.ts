import { test, expect } from "@playwright/test";

test.describe("Leaderboard Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/leaderboard");
  });

  test("renders page title", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /MCP Server/i })
    ).toBeVisible();
  });

  test("renders search input", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search servers...");
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeEditable();
  });

  test("renders tier filter buttons", async ({ page }) => {
    for (const filter of ["All", "Expert", "Proficient", "Basic", "Failed"]) {
      await expect(
        page.getByRole("button", { name: filter, exact: true }).first()
      ).toBeVisible();
    }
  });

  test("renders table with column headers", async ({ page }) => {
    // Wait for loading to finish
    await page.waitForTimeout(2000);

    const thead = page.locator("thead");
    const hasServer = await thead.getByText("Server").isVisible().catch(() => false);
    const hasScore = await thead.getByText("Score").isVisible().catch(() => false);
    // Table should be visible if there are results, otherwise empty state
    const hasEmptyState = await page.getByText(/No evaluations yet/i).isVisible().catch(() => false);

    expect(hasServer || hasEmptyState).toBe(true);
  });

  test("search with no results shows message", async ({ page }) => {
    await page.waitForTimeout(2000);
    await page.getByPlaceholder("Search servers...").fill("nonexistentserver12345");
    // Shows "No servers match your filters." when there are servers, or
    // "No evaluations yet." when the database is empty
    const hasNoMatch = await page.getByText(/No servers match/i).isVisible().catch(() => false);
    const hasNoEvals = await page.getByText(/No evaluations yet/i).isVisible().catch(() => false);
    expect(hasNoMatch || hasNoEvals).toBe(true);
  });

  test("empty sidebar shows placeholder", async ({ page }) => {
    await expect(
      page.getByText("Click a server to see detailed evaluation results")
    ).toBeVisible();
  });
});
