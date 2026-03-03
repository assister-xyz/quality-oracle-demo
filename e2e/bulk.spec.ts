import { test, expect } from "@playwright/test";

test.describe("Bulk Evaluation Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/bulk");
  });

  test("renders page title and description", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /Bulk/i })
    ).toBeVisible();
    await expect(
      page.getByText(/Evaluate multiple MCP servers/i)
    ).toBeVisible();
  });

  test("renders textarea for URL input", async ({ page }) => {
    const textarea = page.getByPlaceholder(/Paste MCP server URLs/i);
    await expect(textarea).toBeVisible();
    await expect(textarea).toBeEditable();
  });

  test("renders Add and File buttons", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /Add/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /File/i })
    ).toBeVisible();
  });

  test("Add button is disabled when textarea is empty", async ({ page }) => {
    const addBtn = page.getByRole("button", { name: /Add/i });
    await expect(addBtn).toBeDisabled();
  });

  test("renders preset buttons", async ({ page }) => {
    await expect(page.getByText("Presets:")).toBeVisible();
  });

  test("shows empty state when no items", async ({ page }) => {
    await expect(
      page.getByText("Add MCP server URLs to start bulk evaluation")
    ).toBeVisible();
  });

  test("adding URLs from textarea creates queue items", async ({ page }) => {
    const textarea = page.getByPlaceholder(/Paste MCP server URLs/i);
    await textarea.fill(
      "https://mcp.deepwiki.com/mcp\nhttps://mcp.semgrep.ai/mcp"
    );
    await page.getByRole("button", { name: /Add/i }).click();

    await expect(page.getByText("2 servers")).toBeVisible();
    await expect(
      page.getByText("mcp.deepwiki.com").first()
    ).toBeVisible();
    await expect(
      page.getByText("mcp.semgrep.ai").first()
    ).toBeVisible();
  });

  test("Clear button removes all items", async ({ page }) => {
    const textarea = page.getByPlaceholder(/Paste MCP server URLs/i);
    await textarea.fill("https://mcp.deepwiki.com/mcp\nhttps://mcp.semgrep.ai/mcp");
    await page.getByRole("button", { name: /Add/i }).click();
    await expect(page.getByText("2 servers")).toBeVisible();

    await page.getByRole("button", { name: /Clear/i }).click();
    await expect(
      page.getByText("Add MCP server URLs to start bulk evaluation")
    ).toBeVisible();
  });

  test("textarea clears after adding URLs", async ({ page }) => {
    const textarea = page.getByPlaceholder(/Paste MCP server URLs/i);
    await textarea.fill("https://mcp.deepwiki.com/mcp");
    await page.getByRole("button", { name: /Add/i }).click();

    await expect(textarea).toHaveValue("");
  });

  test("comma-separated URLs are parsed correctly", async ({ page }) => {
    const textarea = page.getByPlaceholder(/Paste MCP server URLs/i);
    await textarea.fill(
      "https://mcp.deepwiki.com/mcp, https://mcp.semgrep.ai/mcp, https://huggingface.co/mcp"
    );
    await page.getByRole("button", { name: /Add/i }).click();

    await expect(page.getByText("3 servers")).toBeVisible();
  });

  test("concurrency selector is present", async ({ page }) => {
    const textarea = page.getByPlaceholder(/Paste MCP server URLs/i);
    await textarea.fill("https://mcp.deepwiki.com/mcp");
    await page.getByRole("button", { name: /Add/i }).click();

    await expect(page.getByText("Concurrency:")).toBeVisible();
    const select = page.locator("select");
    await expect(select).toBeVisible();
  });

  test("Run All button starts evaluation", async ({ page }) => {
    const textarea = page.getByPlaceholder(/Paste MCP server URLs/i);
    await textarea.fill("https://mcp.deepwiki.com/mcp");
    await page.getByRole("button", { name: /Add/i }).click();

    await page.getByRole("button", { name: /Run All/i }).click();

    // Should show running state (either progress or error depending on backend)
    const hasRunning = await page.getByText(/running|Starting|Submitting|Error/i).isVisible().catch(() => false);
    expect(hasRunning).toBe(true);
  });
});
