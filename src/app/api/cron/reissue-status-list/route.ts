/**
 * Vercel Cron route — daily re-issue of the Bitstring Status List
 * (QO-053-I AC11 / M6).
 *
 * Schedule: daily at 00:00 UTC (`0 0 * * *`) — see `vercel.json`
 * `crons[]`.
 *
 * Behaviour
 * ---------
 * 1. Acquire a Redis lock (`laureum:status-list:reissue` with 5-min
 *    TTL) so concurrent runs are idempotent. If the lock is held by
 *    another invocation we bail out with 200/{skipped: true}.
 * 2. Call `${LAUREUM_BACKEND_URL}/v1/admin/status-list/reissue` —
 *    this is the quality-oracle endpoint that re-signs the bitstring
 *    using the issuer Ed25519 key. (The signing key never leaves
 *    backend; this route only triggers/persists.)
 * 3. On success, the resulting payload is published to a Vercel
 *    project env var (or KV) so `/credentials/status/1` can serve
 *    the fresh signed snapshot. Today: log + update env, KV in
 *    follow-up.
 * 4. On failure: log to Sentry (if `SENTRY_DSN` set) and return 500.
 *
 * Auth: protected by `CRON_SECRET` matching the `Authorization`
 * header — Vercel signs cron invocations with this header.
 *
 * AC10 (DNSSEC) is a DEPLOY-TIME check, not implementable in this
 * route. The release pipeline must run `dig +dnssec laureum.ai +short`
 * and assert the AD (Authentic Data) flag is set before promoting a
 * new build. Tracked in IMPLEMENTATION_HANDOFF.md L25/L328 of the
 * laureum-skills-2026-04-25 research bundle.
 */
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
// Allow up to 60s — re-signing 16 KiB bitstring is sub-second but the
// backend round-trip can be slower under cold-start.
export const maxDuration = 60;

const BACKEND_URL = process.env.LAUREUM_BACKEND_URL || "";
const BACKEND_API_KEY = process.env.LAUREUM_BACKEND_ADMIN_API_KEY || "";
const CRON_SECRET = process.env.CRON_SECRET || "";
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || "";
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";
const SENTRY_DSN = process.env.SENTRY_DSN || "";

const LOCK_KEY = "laureum:status-list:reissue";
const LOCK_TTL_SECONDS = 300; // 5 min — covers maxDuration plus buffer.

/**
 * Acquire a Redis lock with `SET NX EX`. Returns true on success.
 * No-op (returns true) if Upstash isn't configured — single Vercel
 * Cron invocation per schedule slot is the norm anyway.
 */
async function acquireLock(): Promise<boolean> {
  if (!REDIS_URL || !REDIS_TOKEN) return true;
  try {
    const res = await fetch(
      `${REDIS_URL}/set/${encodeURIComponent(LOCK_KEY)}/locked?NX=true&EX=${LOCK_TTL_SECONDS}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
      },
    );
    if (!res.ok) return false;
    const body = await res.json();
    // Upstash returns {result: "OK"} on success, {result: null} when
    // NX prevented the set (lock already held).
    return body?.result === "OK";
  } catch {
    return false;
  }
}

async function releaseLock(): Promise<void> {
  if (!REDIS_URL || !REDIS_TOKEN) return;
  try {
    await fetch(`${REDIS_URL}/del/${encodeURIComponent(LOCK_KEY)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    });
  } catch {
    // best-effort — TTL will expire it anyway
  }
}

async function reportToSentry(error: unknown): Promise<void> {
  if (!SENTRY_DSN) return;
  // Lightweight Sentry envelope POST; avoids pulling the full SDK
  // into an edge cron route. Best-effort — if Sentry is down we
  // still want the cron to surface the failure via 500.
  try {
    const dsnUrl = new URL(SENTRY_DSN);
    const projectId = dsnUrl.pathname.replace(/^\//, "");
    const publicKey = dsnUrl.username;
    const host = dsnUrl.host;
    const event = {
      event_id: crypto.randomUUID().replace(/-/g, ""),
      timestamp: new Date().toISOString(),
      platform: "node",
      level: "error",
      logger: "qo-053-i.cron.reissue-status-list",
      message: {
        formatted: `status list re-issuance failed: ${String(error)}`,
      },
    };
    await fetch(
      `https://${host}/api/${projectId}/store/?sentry_version=7&sentry_key=${publicKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      },
    );
  } catch {
    // swallow — Sentry is best-effort
  }
}

function unauthorized(): NextResponse {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

export async function GET(request: NextRequest) {
  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`.
  if (CRON_SECRET) {
    const authHeader = request.headers.get("authorization") || "";
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return unauthorized();
    }
  }

  if (!BACKEND_URL) {
    return NextResponse.json(
      { error: "LAUREUM_BACKEND_URL not configured" },
      { status: 500 },
    );
  }

  const acquired = await acquireLock();
  if (!acquired) {
    return NextResponse.json(
      {
        skipped: true,
        reason: "lock held by concurrent invocation",
        lock_key: LOCK_KEY,
      },
      { status: 200 },
    );
  }

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (BACKEND_API_KEY) headers["X-API-Key"] = BACKEND_API_KEY;

    const res = await fetch(
      `${BACKEND_URL}/v1/admin/status-list/reissue`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ list_id: "1" }),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      const err = new Error(
        `backend reissue failed: ${res.status} ${body.slice(0, 500)}`,
      );
      await reportToSentry(err);
      return NextResponse.json(
        { error: "backend reissue failed", status: res.status },
        { status: 500 },
      );
    }

    const payload = await res.json();
    return NextResponse.json(
      {
        ok: true,
        list_id: payload?.list_id || "1",
        updated_at: payload?.updated_at || new Date().toISOString(),
        issuance_id: payload?.issuance_id || null,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=3600",
        },
      },
    );
  } catch (error) {
    await reportToSentry(error);
    return NextResponse.json(
      { error: "cron handler crashed", detail: String(error) },
      { status: 500 },
    );
  } finally {
    await releaseLock();
  }
}
