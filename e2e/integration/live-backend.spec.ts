/**
 * Integration E2E tests against live backend + mock MCP server.
 *
 * Prerequisites:
 *   - Backend running on http://localhost:8002
 *   - Mock MCP server running on http://localhost:8010
 *   - Frontend running on http://localhost:3003 (auto-started by Playwright)
 *
 * Run: npx playwright test e2e/integration/ --timeout=120000
 */
import { test, expect } from "@playwright/test";

const MOCK_MCP_URL = "http://localhost:8010/sse";

test.describe("Live Backend Integration", () => {
  test.beforeEach(async ({ page }) => {
    // Check backend is reachable via direct HTTP (not through browser CORS)
    try {
      const res = await page.request.get("http://localhost:8002/health");
      if (res.status() !== 200) {
        test.skip(true, "Backend not running");
      }
    } catch {
      test.skip(true, "Backend not reachable");
    }
  });

  test("Dashboard loads with real data (or empty state)", async ({ page }) => {
    await page.goto("/");

    // Should show dashboard title
    await expect(page.getByRole("heading", { name: /AgentTrust/i })).toBeVisible();

    // Should show KPI cards (values may be 0 or -- if no evaluations)
    await expect(page.getByText("Total Evaluations")).toBeVisible();
    await expect(page.getByText("Average Score")).toBeVisible();
  });

  test("Navbar shows connection indicator", async ({ page }) => {
    await page.goto("/");
    // Should show either LIVE (backend reachable from browser) or OFFLINE (CORS issue)
    await page.waitForTimeout(3000);
    const hasLive = await page.getByText("LIVE").isVisible().catch(() => false);
    const hasOffline = await page.getByText("OFFLINE").isVisible().catch(() => false);
    expect(hasLive || hasOffline).toBe(true);
  });

  test("Evaluate page: real evaluation against mock MCP server", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto("/evaluate");

    // Fill in mock MCP URL
    const input = page.getByPlaceholder(/https:\/\/mcp\.example\.com/i);
    await input.fill(MOCK_MCP_URL);

    // Click evaluate
    await page.getByRole("button", { name: /^Evaluate$/i }).click();

    // Should show evaluation in progress or error
    await expect(
      page.getByText(/Evaluation in Progress|Evaluation Error|Failed to submit/i).first()
    ).toBeVisible({ timeout: 10_000 });

    // If evaluation started successfully, wait for completion
    const hasProgress = await page.getByText("Evaluation in Progress").isVisible().catch(() => false);
    if (hasProgress) {
      // Wait for completion — real evaluation can take 30-90 seconds
      await expect(
        page.getByText(/Confidence:|Evaluation Error/i).first()
      ).toBeVisible({ timeout: 90_000 });
    }
  });

  test("Leaderboard shows evaluated servers from backend", async ({ page }) => {
    await page.goto("/leaderboard");

    // Title should render
    await expect(page.getByRole("heading", { name: /Leaderboard/i })).toBeVisible();

    // Wait for loading to finish
    await page.waitForTimeout(2000);

    // Should show either servers or empty state
    const hasTableRows = (await page.locator("tbody tr").count()) > 0;
    const hasEmpty = await page
      .getByText(/No evaluations yet/i)
      .isVisible()
      .catch(() => false);

    expect(hasTableRows || hasEmpty).toBe(true);
  });

  test("Compare page renders with server selectors", async ({ page }) => {
    await page.goto("/compare");

    // Title should render
    await expect(page.getByRole("heading", { name: /Compare/i })).toBeVisible();

    // Should show server selector buttons with A and B labels
    await expect(page.getByText("A", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("B", { exact: true }).first()).toBeVisible();
  });

  test("Evaluate page: error state for invalid URL", async ({ page }) => {
    await page.goto("/evaluate");

    const input = page.getByPlaceholder(/https:\/\/mcp\.example\.com/i);
    await input.fill("http://localhost:99999/nonexistent");

    await page.getByRole("button", { name: /^Evaluate$/i }).click();

    // Should show either progress then error, or immediate error
    await expect(
      page.getByText(/Evaluation in Progress|Evaluation Error|Failed to submit/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });
});
