import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

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

    // Log to console (always works)
    console.log("[Waitlist Submission]", JSON.stringify(entry));

    // Try to persist to JSON file (works in dev, may not in serverless)
    try {
      const filePath = path.join(process.cwd(), "waitlist-data.json");
      let existing: typeof entry[] = [];
      try {
        const data = await fs.readFile(filePath, "utf-8");
        existing = JSON.parse(data);
      } catch {
        // File doesn't exist yet
      }
      existing.push(entry);
      await fs.writeFile(filePath, JSON.stringify(existing, null, 2));
    } catch {
      // In serverless environments, file writes may fail — that's OK
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
