import { NextRequest, NextResponse } from "next/server";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = "https://us.i.posthog.com";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, agentUrl, useCase, role, tier, variant } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    const entry = {
      email,
      agentUrl: agentUrl || "",
      useCase: useCase || "",
      role: role || "",
      tier: tier || "",
      variant: variant || "",
      timestamp: new Date().toISOString(),
    };

    // Log to Vercel runtime logs
    console.log("[Waitlist Submission]", JSON.stringify(entry));

    // Persist to PostHog server-side (reliable, survives serverless)
    if (POSTHOG_KEY) {
      try {
        await fetch(`${POSTHOG_HOST}/capture/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: POSTHOG_KEY,
            event: "waitlist_submission",
            distinct_id: email,
            properties: {
              email,
              agent_url: entry.agentUrl,
              use_case: entry.useCase,
              role: entry.role,
              tier: entry.tier,
              variant: entry.variant,
              $set: {
                email,
                tier: entry.tier,
                role: entry.role,
                agent_url: entry.agentUrl,
              },
            },
            timestamp: entry.timestamp,
          }),
        });
      } catch (err) {
        console.error("[Waitlist] PostHog capture failed:", err);
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
