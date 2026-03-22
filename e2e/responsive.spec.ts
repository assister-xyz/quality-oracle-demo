import { test, expect } from "@playwright/test";

test.describe("Responsive Design", () => {
  test("dashboard renders on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /Laureum/i })).toBeVisible();
    await expect(page.getByText("Total Evaluations")).toBeVisible();
    await expect(page.getByText("Tier Distribution", { exact: true })).toBeVisible();
  });

  test("evaluate page works on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/evaluate");

    await expect(page.getByPlaceholder(/https:\/\/mcp\.example\.com/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Semgrep" })).toBeVisible();
  });

  test("leaderboard renders on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/leaderboard");

    await page.waitForTimeout(2000);
    // Should show either table with servers or empty state
    const hasTable = await page.locator("thead").isVisible().catch(() => false);
    const hasEmpty = await page.getByText(/No evaluations yet/i).isVisible().catch(() => false);
    expect(hasTable || hasEmpty).toBe(true);
    await expect(page.getByPlaceholder("Search servers...")).toBeVisible();
  });

  test("tablet viewport renders correctly", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /Laureum/i })).toBeVisible();
    await expect(page.getByText("How Laureum Works")).toBeVisible();
  });
});
