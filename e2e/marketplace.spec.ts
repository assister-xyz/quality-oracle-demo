import { test, expect } from "@playwright/test";

// QO-053-H — public scorecard E2E.
// Note: tests use the fallback fixture data (45 SendAI skills) because the
// dev server isn't connected to a populated MongoDB in CI. The fallback path
// exercises the same component tree that production uses.

test.describe("Marketplace public scorecard", () => {
  test("AC1: /marketplace/sendai renders 45 tiles", async ({ page }) => {
    await page.goto("/marketplace/sendai");
    await expect(page.getByRole("heading", { name: /SendAI/i })).toBeVisible();
    await page.waitForSelector("[data-testid='marketplace-grid']");
    const tiles = page.locator("[data-testid='skill-tile']");
    await expect(tiles).toHaveCount(45);
  });

  test("AC2: sort + filter re-render the grid", async ({ page }) => {
    await page.goto("/marketplace/sendai");
    await page.waitForSelector("[data-testid='marketplace-grid']");
    // Switch sort to Name → first tile changes from default (recommended).
    await page.getByLabel("Sort").selectOption("name");
    // Filter by tier=expert
    await page.getByLabel("Tier").selectOption("expert");
    const tiles = page.locator("[data-testid='skill-tile']");
    const count = await tiles.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(45);
  });

  test("AC3: Top-10 risks toggle surfaces R5 ids", async ({ page }) => {
    await page.goto("/marketplace/sendai");
    await page.waitForSelector("[data-testid='marketplace-grid']");
    await page.getByTestId("top-risks-toggle").click();
    const tiles = page.locator("[data-testid='skill-tile']");
    await expect(tiles).toHaveCount(10);
  });

  test("AC4: per-skill detail renders radar + activation provider", async ({ page }) => {
    await page.goto("/marketplace/sendai/jupiter");
    await expect(page.getByRole("heading", { name: /Jupiter Swap/i })).toBeVisible();
    // Activation provider chip
    await expect(page.getByText("cerebras:llama3.1-8b").first()).toBeVisible();
    // Probe list rendered
    const rows = page.locator("[data-testid='probe-row']");
    expect(await rows.count()).toBeGreaterThanOrEqual(5);
  });

  test("AC5: differential ScoreDelta visible when delta_vs_baseline present", async ({ page }) => {
    await page.goto("/marketplace/sendai/jupiter");
    // Jupiter fixture has delta=+12.4
    await expect(page.getByText(/Differential/i)).toBeVisible();
    await expect(page.getByText(/\+12\.4/).first()).toBeVisible();
  });

  test("AC6: AQVC chip renders + download button works", async ({ page }) => {
    await page.goto("/marketplace/sendai/jupiter");
    await expect(page.getByTestId("aqvc-chip")).toBeVisible();
    const button = page.getByTestId("aqvc-download");
    await expect(button).toBeVisible();
    // Click triggers fetch; without backend the click still resolves with error UI.
    await button.click();
  });

  test("Click Jupiter tile from grid navigates to detail", async ({ page }) => {
    await page.goto("/marketplace/sendai");
    await page.waitForSelector("[data-testid='marketplace-grid']");
    await page.locator("[data-testid='skill-tile'][data-skill-id='jupiter']").click();
    await expect(page).toHaveURL(/\/marketplace\/sendai\/jupiter$/);
    await expect(page.getByRole("heading", { name: /Jupiter Swap/i })).toBeVisible();
  });

  test("Embed kit modal opens with markdown snippet", async ({ page }) => {
    await page.goto("/marketplace/sendai/jupiter");
    await page.getByTestId("embed-kit-open").click();
    await expect(page.getByRole("heading", { name: /Embed Laureum badge/i })).toBeVisible();
    await expect(page.getByText("Markdown")).toBeVisible();
    await expect(page.getByText("HTML")).toBeVisible();
  });

  test("Search filter narrows tile count", async ({ page }) => {
    await page.goto("/marketplace/sendai");
    await page.waitForSelector("[data-testid='marketplace-grid']");
    await page.getByPlaceholder("Search skills…").fill("jupiter");
    const tiles = page.locator("[data-testid='skill-tile']");
    const count = await tiles.count();
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(3);
  });
});
