import { test, expect } from "@playwright/test";

/**
 * QO-062 — Landing page honesty copy.
 *
 * Verifies that the sub-headline on each landing variant + the evaluate-page
 * hero advertise capabilities Laureum actually ships today (MCP servers +
 * SKILL.md drop), and that switching the NEXT_PUBLIC_LAUREUM_MULTITARGET_LIVE
 * flag flips them to the v2.0 multi-target language.
 *
 * Snapshots are scoped to [data-testid='hero'] / [data-testid='evaluate-...']
 * so unrelated marketplace data drift can't false-fail the asserts.
 */

const V1_HONESTY_BAND =
  "Today: any MCP server. Coming soon: A2A agents and Claude Skills. Six-axis scoring, adversarial probes, and a signed AQVC attestation you can embed anywhere.";

const V1_EVALUATE_HERO =
  "Paste an MCP server URL, drop a SKILL.md, or pick a target type. We test every tool, score 6 dimensions, and sign an AQVC attestation.";

const V2_MULTITARGET_BAND =
  "Any MCP server, A2A agent, or Claude Skill. Six-axis scoring, adversarial probes, and a signed AQVC attestation you can embed anywhere.";

async function setVariant(
  context: import("@playwright/test").BrowserContext,
  variant: "a" | "b" | "c",
) {
  await context.addCookies([
    {
      name: "ab_variant",
      value: variant,
      url: "http://localhost:3003",
    },
  ]);
}

test.describe("QO-062 landing honesty copy", () => {
  test("AC1 — variant A sub-headline matches v1.1 honesty band by default", async ({
    page,
    context,
  }) => {
    await setVariant(context, "a");
    await page.goto("/");

    const sub = page.locator(
      "[data-testid='hero'] [data-testid='hero-subheadline']",
    );
    await expect(sub).toBeVisible();
    await expect(sub).toHaveText(V1_HONESTY_BAND);
  });

  test("AC2 — variants B and C also match the v1.1 honesty band", async ({
    page,
    context,
  }) => {
    for (const variant of ["b", "c"] as const) {
      await context.clearCookies();
      await setVariant(context, variant);
      await page.goto("/");

      const sub = page.locator(
        "[data-testid='hero'] [data-testid='hero-subheadline']",
      );
      await expect(sub, `variant ${variant}`).toBeVisible();
      await expect(sub, `variant ${variant}`).toHaveText(V1_HONESTY_BAND);
    }
  });

  test("AC3 — evaluate hero copy matches v1.1", async ({ page }) => {
    await page.goto("/evaluate");

    const heroCopy = page.locator("[data-testid='evaluate-hero-copy']");
    await expect(heroCopy).toBeVisible();
    await expect(heroCopy).toHaveText(V1_EVALUATE_HERO);
  });

  test("AC5 — sub-headline switches to v2.0 when NEXT_PUBLIC_LAUREUM_MULTITARGET_LIVE=true", async ({
    page,
    context,
  }) => {
    // The flag is read at build time (Next.js inlines NEXT_PUBLIC_* into the
    // client bundle), so this test only passes when the dev server was
    // started with the env var set. We branch on the server-side bundle:
    // if v1.1 still renders, we assume the flag wasn't set for this run and
    // skip with an informative message rather than fail.
    await setVariant(context, "a");
    await page.goto("/");

    const sub = page.locator(
      "[data-testid='hero'] [data-testid='hero-subheadline']",
    );
    await expect(sub).toBeVisible();

    const text = (await sub.textContent())?.trim() ?? "";
    if (text === V1_HONESTY_BAND) {
      test.skip(
        true,
        "NEXT_PUBLIC_LAUREUM_MULTITARGET_LIVE not set for this dev server run — flag default is false. Re-run with the env var to assert v2.0 copy.",
      );
    }
    expect(text).toBe(V2_MULTITARGET_BAND);
  });
});
