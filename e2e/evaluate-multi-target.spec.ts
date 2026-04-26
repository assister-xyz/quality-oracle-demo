/**
 * QO-060 — Multi-Target /evaluate page E2E.
 *
 * Each test mocks the backend at the network layer so the suite can run
 * against the dev server without QO-058 being live.
 *
 * Coverage:
 *   AC1 — paste MCP URL → discovery cascade → eval submitted
 *   AC2 — drag-drop SKILL.md → preview + eval submitted
 *   AC3 — type-override bypasses cascade
 *   AC4 — sample chips pre-fill input + auto-detect type
 *   AC5 — manifest-less notice renders for rest_chat detection
 *   AC6 — all-10-fail → "Couldn't auto-detect" banner
 *   AC7 — GH folder URL detected as skill
 *   AC8 — bookmarked `?url=X` query-param backward compat
 *   AC9 — basic accessibility (axe-core would be added separately; here we
 *         assert the structural a11y pieces are present)
 */
import { test, expect, type Route } from "@playwright/test";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002";

const MOCK_DISCOVER_MCP = {
  url: "https://mcp.deepwiki.com/mcp",
  detected_type: "mcp",
  detected_label: "MCP server (Streamable HTTP)",
  probes: [
    { name: "A2A agent-card.json", step: 1, status: 404, latency_ms: 12, matched: false },
    { name: "agents.json", step: 2, status: 404, latency_ms: 8, matched: false },
    { name: "ERC-8004 registry", step: 3, status: 404, latency_ms: 6, matched: false },
    { name: "MCP initialize", step: 4, status: 200, latency_ms: 148, matched: true },
  ],
  has_manifest: true,
  needs_auth: false,
  duration_ms: 174,
};

const MOCK_DISCOVER_REST = {
  url: "https://api.example.com/chat",
  detected_type: "rest_chat",
  detected_label: "Generic chat (REST)",
  probes: [
    { name: "A2A agent-card.json", step: 1, status: 404, latency_ms: 12, matched: false },
    { name: "agents.json", step: 2, status: 404, latency_ms: 8, matched: false },
    { name: "ERC-8004 registry", step: 3, status: 404, latency_ms: 6, matched: false },
    { name: "MCP initialize", step: 4, status: 404, latency_ms: 9, matched: false },
    { name: "OpenAPI / Swagger", step: 5, status: 404, latency_ms: 7, matched: false },
    { name: "Gradio /info", step: 6, status: 404, latency_ms: 6, matched: false },
    { name: "Skill SKILL.md probe", step: 7, status: 404, latency_ms: 8, matched: false },
    { name: "GitHub tree probe", step: 8, status: null, latency_ms: 1, matched: false },
    { name: "REST chat heuristic", step: 9, status: 200, latency_ms: 142, matched: true },
  ],
  has_manifest: false,
  needs_auth: false,
  duration_ms: 199,
};

const MOCK_DISCOVER_FAIL = {
  url: "https://nothing.example.com",
  detected_type: null,
  detected_label: null,
  probes: Array.from({ length: 10 }, (_, i) => ({
    name: `probe-${i + 1}`,
    step: i + 1,
    status: 404,
    latency_ms: 10,
    matched: false,
  })),
  has_manifest: false,
  needs_auth: false,
  duration_ms: 100,
};

const MOCK_DISCOVER_SKILL = {
  url: "https://github.com/sendaifun/skills/tree/main/skills/jupiter",
  detected_type: "skill",
  detected_label: "Claude Skill (GitHub folder)",
  probes: [
    { name: "A2A agent-card.json", step: 1, status: 404, latency_ms: 12, matched: false },
    { name: "agents.json", step: 2, status: 404, latency_ms: 8, matched: false },
    { name: "ERC-8004 registry", step: 3, status: 404, latency_ms: 6, matched: false },
    { name: "MCP initialize", step: 4, status: 404, latency_ms: 9, matched: false },
    { name: "OpenAPI / Swagger", step: 5, status: 404, latency_ms: 7, matched: false },
    { name: "Gradio /info", step: 6, status: 404, latency_ms: 6, matched: false },
    { name: "Skill SKILL.md probe", step: 7, status: 200, latency_ms: 88, matched: false },
    { name: "GitHub tree probe", step: 8, status: 200, latency_ms: 142, matched: true },
  ],
  has_manifest: true,
  needs_auth: false,
  duration_ms: 280,
};

const MOCK_EVAL_RESPONSE = {
  evaluation_id: "eval_mock_123",
  status: "running",
  estimated_time_seconds: 30,
  poll_url: "/v1/evaluate/eval_mock_123",
  message: "ok",
};

const MOCK_EVAL_STATUS_RUNNING = {
  evaluation_id: "eval_mock_123",
  status: "running",
  progress_pct: 25,
  score: null,
  tier: null,
  eval_mode: "verified",
  evaluation_version: "v1.0",
  report: null,
  result: null,
  scores: null,
  attestation_jwt: null,
  badge_url: null,
  error: null,
  duration_ms: null,
};

/**
 * Install network mocks for the discover + evaluate endpoints. Returns a
 * map of received POST bodies for assertions in tests.
 */
type Captured = {
  evalSubmits: Record<string, unknown>[];
  skillSubmits: Record<string, unknown>[];
  discoverCalls: { url: string; query: string }[];
};

interface MockDiscoveryResult {
  url: string;
  detected_type: string | null;
  detected_label: string | null;
  probes: {
    name: string;
    step: number;
    status: number | null;
    latency_ms: number;
    matched: boolean;
  }[];
  has_manifest: boolean;
  needs_auth: boolean;
  duration_ms: number;
}

async function installMocks(
  page: import("@playwright/test").Page,
  opts: {
    discover?: MockDiscoveryResult | null;
    discoverFail?: boolean;
  } = {},
): Promise<Captured> {
  const captured: Captured = {
    evalSubmits: [],
    skillSubmits: [],
    discoverCalls: [],
  };

  // Discover endpoint
  await page.route(`${BACKEND}/v1/discover*`, async (route: Route) => {
    const u = new URL(route.request().url());
    captured.discoverCalls.push({
      url: route.request().url(),
      query: u.searchParams.get("url") || "",
    });
    if (opts.discoverFail) {
      await route.fulfill({ status: 502, body: "discover failed" });
      return;
    }
    if (opts.discover === null) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_DISCOVER_FAIL),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(opts.discover ?? MOCK_DISCOVER_MCP),
    });
  });

  // POST /v1/evaluate
  await page.route(`${BACKEND}/v1/evaluate`, async (route: Route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    captured.evalSubmits.push(
      JSON.parse(route.request().postData() || "{}") as Record<string, unknown>,
    );
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_EVAL_RESPONSE),
    });
  });

  // POST /v1/evaluate/skill
  await page.route(`${BACKEND}/v1/evaluate/skill`, async (route: Route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    captured.skillSubmits.push(
      JSON.parse(route.request().postData() || "{}") as Record<string, unknown>,
    );
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ...MOCK_EVAL_RESPONSE,
        evaluation_id: "eval_mock_skill_456",
      }),
    });
  });

  // GET /v1/evaluate/{id} — keep "running" so the page doesn't transition
  // to a result and shadow our cascade UI.
  await page.route(/\/v1\/evaluate\/eval_mock_/, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_EVAL_STATUS_RUNNING),
    });
  });

  return captured;
}

// First page hit triggers Turbopack compile (~25-30s on cold dev server),
// so give every test in this file headroom.
test.describe.configure({ timeout: 60_000 });

test.describe("QO-060 multi-target evaluate", () => {
  test("AC1: paste MCP URL → cascade detects MCP → eval submitted", async ({
    page,
  }) => {
    const captured = await installMocks(page, { discover: MOCK_DISCOVER_MCP });
    await page.goto("/evaluate");

    const input = page.getByTestId("multi-target-url-input");
    await expect(input).toBeVisible();
    await input.fill("https://mcp.deepwiki.com/mcp");
    await page.getByTestId("multi-target-submit").click();

    // Discovery timeline appears with the MCP probe row.
    const timeline = page.getByTestId("discovery-timeline");
    await expect(timeline).toBeVisible({ timeout: 5_000 });
    await expect(timeline).toContainText(/MCP server/);
    // Eval was submitted exactly once.
    await page.waitForTimeout(500);
    expect(captured.discoverCalls.length).toBeGreaterThanOrEqual(1);
    expect(captured.evalSubmits.length).toBe(1);
    expect(captured.evalSubmits[0].target_type).toBe("mcp");
    expect(captured.evalSubmits[0].target_url).toBe(
      "https://mcp.deepwiki.com/mcp",
    );
  });

  test("AC2: drag-drop SKILL.md → preview + skill eval submitted", async ({
    page,
  }) => {
    const captured = await installMocks(page);
    await page.goto("/evaluate");

    // Use the visible SKILL.md upload affordance (keyboard-friendly path).
    const fileInput = page.getByTestId("skill-upload-input");
    await fileInput.setInputFiles({
      name: "SKILL.md",
      mimeType: "text/markdown",
      buffer: Buffer.from(
        `---\nname: jupiter-trader\ndescription: Trade Jupiter swaps on Solana\n---\n# Jupiter Trader\n\nDoes swaps.\n`,
      ),
    });

    // Preview card with the parsed name appears.
    const preview = page.getByTestId("skill-preview-card");
    await expect(preview).toBeVisible();
    await expect(preview).toContainText("jupiter-trader");
    await expect(preview).toContainText(/Detected.*Skill/i);

    // Submit
    await page.getByTestId("multi-target-submit").click();

    await page.waitForTimeout(500);
    expect(captured.skillSubmits.length).toBe(1);
    const submitted = captured.skillSubmits[0] as {
      frontmatter: { name?: string };
      body: string;
      source: string;
    };
    expect(submitted.frontmatter.name).toBe("jupiter-trader");
    expect(submitted.source).toBe("drag");
  });

  test("AC3: type override bypasses cascade", async ({ page }) => {
    const captured = await installMocks(page);
    await page.goto("/evaluate");

    // Open dropdown, choose "Generic chat (REST)"
    await page.getByTestId("target-type-trigger").click();
    await page
      .locator('[data-target-type="rest_chat"]')
      .click();

    await page
      .getByTestId("multi-target-url-input")
      .fill("https://api.example.com/chat");
    await page.getByTestId("multi-target-submit").click();

    await page.waitForTimeout(500);
    // Cascade should NOT have been called (we skipped it via override).
    expect(captured.discoverCalls.length).toBe(0);
    expect(captured.evalSubmits.length).toBe(1);
    expect(captured.evalSubmits[0].target_type).toBe("rest_chat");
  });

  test("AC4: sample chips pre-fill input and auto-detect", async ({ page }) => {
    await installMocks(page);
    await page.goto("/evaluate");

    // The "jupiter (skill)" chip should set the URL + target type to skill.
    await page.locator('[data-sample-chip="skill"]').click();

    await expect(page.getByTestId("multi-target-url-input")).toHaveValue(
      "https://github.com/sendaifun/skills/tree/main/skills/jupiter",
    );
    await expect(page.getByTestId("target-type-trigger")).toContainText(
      /Skill/,
    );
  });

  test("AC5: manifest-less notice renders for rest_chat detection", async ({
    page,
  }) => {
    await installMocks(page, { discover: MOCK_DISCOVER_REST });
    await page.goto("/evaluate");

    await page
      .getByTestId("multi-target-url-input")
      .fill("https://api.example.com/chat");
    await page.getByTestId("multi-target-submit").click();

    const banner = page.locator('[data-error-kind="manifestless-notice"]');
    await expect(banner).toBeVisible({ timeout: 5_000 });
    await expect(banner).toContainText(/Manifest-less/i);
  });

  test("AC6: all-10-fail surfaces 'Couldn't auto-detect' banner", async ({
    page,
  }) => {
    await installMocks(page, { discover: MOCK_DISCOVER_FAIL });
    await page.goto("/evaluate");

    await page
      .getByTestId("multi-target-url-input")
      .fill("https://nothing.example.com");
    await page.getByTestId("multi-target-submit").click();

    const banner = page.locator('[data-error-kind="cascade-failed"]');
    await expect(banner).toBeVisible({ timeout: 5_000 });
    await expect(banner).toContainText(/Couldn't auto-detect/i);
  });

  test("AC7: GitHub folder URL detected as skill", async ({ page }) => {
    const captured = await installMocks(page, {
      discover: MOCK_DISCOVER_SKILL,
    });
    await page.goto("/evaluate");

    await page
      .getByTestId("multi-target-url-input")
      .fill("https://github.com/sendaifun/skills/tree/main/skills/jupiter");
    await page.getByTestId("multi-target-submit").click();

    await page.waitForTimeout(500);
    // Cascade was hit
    expect(captured.discoverCalls.length).toBeGreaterThanOrEqual(1);
    // Eval was submitted with target_type=skill
    expect(captured.evalSubmits.length).toBe(1);
    expect(captured.evalSubmits[0].target_type).toBe("skill");
  });

  test("AC8: bookmarked ?url=X pre-fills the input", async ({ page }) => {
    await installMocks(page);
    await page.goto(
      "/evaluate?url=" + encodeURIComponent("https://mcp.deepwiki.com/mcp"),
    );

    await expect(page.getByTestId("multi-target-url-input")).toHaveValue(
      "https://mcp.deepwiki.com/mcp",
      { timeout: 5_000 },
    );
  });

  test("AC9: keyboard nav + aria attributes", async ({ page }) => {
    await installMocks(page, { discover: MOCK_DISCOVER_MCP });
    await page.goto("/evaluate");

    // Type-override trigger is keyboard-reachable
    const trigger = page.getByTestId("target-type-trigger");
    await trigger.focus();
    await expect(trigger).toBeFocused();
    // Activate dropdown via keyboard
    await page.keyboard.press("Enter");
    await expect(
      page.locator('[data-target-type="mcp"]'),
    ).toBeVisible();
    await page.keyboard.press("Escape");

    // URL input is focusable
    const input = page.getByTestId("multi-target-url-input");
    await input.focus();
    await expect(input).toBeFocused();

    // Submit button becomes enabled after typing
    await input.fill("https://mcp.deepwiki.com/mcp");
    const submit = page.getByTestId("multi-target-submit");
    await expect(submit).toBeEnabled();

    // Click → cascade timeline gets aria-live=polite
    await submit.click();
    const timeline = page.getByTestId("discovery-timeline");
    await expect(timeline).toBeVisible({ timeout: 5_000 });
    await expect(timeline).toHaveAttribute("aria-live", "polite");
  });
});
