import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * QO-053-H revalidate webhook.
 *
 * QO-053-F batch runner POSTs:
 *   POST /api/revalidate?path=/marketplace/sendai/jupiter&secret=…
 *
 * Verifies the shared secret against REVALIDATE_SECRET, then triggers ISR
 * revalidation for the supplied path. Returns 401 on bad secret, 400 on
 * missing path.
 */
export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const path = request.nextUrl.searchParams.get("path");

  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) {
    // Operator hasn't enabled the webhook — fail loudly so misconfiguration
    // is obvious rather than silently ignored in prod.
    return NextResponse.json({ ok: false, error: "REVALIDATE_SECRET not set" }, { status: 503 });
  }

  if (secret !== expected) {
    return NextResponse.json({ ok: false, error: "invalid secret" }, { status: 401 });
  }

  if (!path) {
    return NextResponse.json({ ok: false, error: "path required" }, { status: 400 });
  }

  if (!path.startsWith("/marketplace/")) {
    return NextResponse.json({ ok: false, error: "path must begin with /marketplace/" }, { status: 400 });
  }

  revalidatePath(path);
  return NextResponse.json({ ok: true, revalidated: path });
}
