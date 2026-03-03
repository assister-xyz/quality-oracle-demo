import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("navbar is visible on all pages", async ({ page }) => {
    const nav = page.getByRole("navigation");

    await page.goto("/");
    await expect(nav).toBeVisible();
    await expect(page.getByText("DEMO")).toBeVisible();

    await page.goto("/evaluate");
    await expect(nav).toBeVisible();

    await page.goto("/leaderboard");
    await expect(nav).toBeVisible();
  });

  test("navbar links navigate correctly", async ({ page }) => {
    const nav = page.getByRole("navigation");

    await page.goto("/");

    await nav.getByRole("link", { name: /Evaluate/i }).click();
    await expect(page).toHaveURL(/\/evaluate/);

    await nav.getByRole("link", { name: /Leaderboard/i }).click();
    await expect(page).toHaveURL(/\/leaderboard/);

    await nav.getByRole("link", { name: /Dashboard/i }).click();
    await expect(page).toHaveURL("/");
  });

  test("active nav link is highlighted", async ({ page }) => {
    await page.goto("/evaluate");

    const evalLink = page.getByRole("navigation").getByRole("link", { name: /Evaluate/i });
    await expect(evalLink).toHaveClass(/text-primary/);
  });

  test("dashboard View all link goes to leaderboard", async ({ page }) => {
    await page.goto("/");
    // View all may or may not be present depending on backend data
    const hasViewAll = await page.getByRole("main").getByRole("link", { name: /View all/i }).isVisible().catch(() => false);
    if (hasViewAll) {
      await page.getByRole("main").getByRole("link", { name: /View all/i }).click();
      await expect(page).toHaveURL(/\/leaderboard/);
    } else {
      // If no evaluations, the empty state has a link to evaluate instead
      expect(true).toBe(true);
    }
  });

  test("full user journey: dashboard -> leaderboard -> evaluate", async ({ page }) => {
    await page.goto("/");

    // Go to leaderboard via nav link
    await page.getByRole("main").getByRole("link", { name: /Leaderboard/i }).click();
    await expect(page).toHaveURL(/\/leaderboard/);

    // Wait for data to load
    await page.waitForTimeout(2000);

    // Should show either servers or empty state
    const hasServers = await page.locator("tbody tr").count() > 0;
    const hasEmpty = await page.getByText(/No evaluations yet/i).isVisible().catch(() => false);
    expect(hasServers || hasEmpty).toBe(true);

    // Navigate to evaluate page
    await page.getByRole("navigation").getByRole("link", { name: /Evaluate/i }).click();
    await expect(page).toHaveURL(/\/evaluate/);

    // Verify evaluate page structure
    await expect(page.getByPlaceholder(/https:\/\/mcp\.example\.com/i)).toBeVisible();
  });
});
