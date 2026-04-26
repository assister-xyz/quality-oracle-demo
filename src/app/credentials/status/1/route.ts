/**
 * Bitstring Status List 1.0 endpoint (QO-053-I AC4 / AC11).
 *
 * Hosted at `https://laureum.ai/credentials/status/1`. Each AQVC carries
 * a `BitstringStatusListEntry` referencing this URL by index. Fetching
 * this returns a signed `BitstringStatusListCredential` whose
 * `credentialSubject.encodedList` is `base64url(gzip(bitstring))`.
 *
 * Strategy: this route reads the latest signed snapshot from one of
 * three sources (in priority order):
 *
 *   1. `LAUREUM_STATUS_LIST_PAYLOAD` env var (JSON string) — the
 *      Vercel Cron route writes this on each successful daily run.
 *   2. The quality-oracle backend at
 *      `${LAUREUM_BACKEND_URL}/v1/status-list/1` — fallback when the
 *      env var hasn't been populated yet.
 *   3. Empty placeholder list — for fresh dev environments.
 *
 * Cache `public, max-age=3600` (1 hour) so verifiers don't hammer
 * the backend; the cron re-issues every 24h.
 */
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.LAUREUM_BACKEND_URL || "";

export const dynamic = "force-dynamic";

// Empty placeholder credential — only returned when no real signed
// status list is available. NOT cryptographically valid. Intended for
// fresh dev environments where the cron has never run.
const PLACEHOLDER_LIST = {
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://w3id.org/security/data-integrity/v2",
    "https://laureum.ai/credentials/v1",
  ],
  id: "https://laureum.ai/credentials/status/1",
  type: ["VerifiableCredential", "BitstringStatusListCredential"],
  issuer: "did:web:laureum.ai",
  validFrom: "2026-01-01T00:00:00Z",
  credentialSubject: {
    id: "https://laureum.ai/credentials/status/1#list",
    type: "BitstringStatusList",
    statusPurpose: "revocation",
    // 16 KiB of zeroes, gzipped + base64url. Hard-coded literal so
    // the route is responsive even when MongoDB / cron hasn't run yet.
    encodedList:
      "H4sIAAAAAAAAA-3BMQEAAADCoPVPbQ0PoAAAAAAAAAAAAAAAAAAAAOBthNSm1AAQAAA",
  },
  // No proof — caller MUST treat this as untrusted until a real
  // signed snapshot is available. See LAUREUM_STATUS_LIST_PAYLOAD.
  _placeholder: true,
};

async function fetchFromBackend(): Promise<unknown | null> {
  if (!BACKEND_URL) return null;
  try {
    const res = await fetch(`${BACKEND_URL}/v1/status-list/1`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const body = await res.json();
    if (body?.credential) return body.credential;
    if (body?.encodedList || body?.encoded_list) return body;
    return null;
  } catch {
    return null;
  }
}

export async function GET() {
  // 1. Env-var payload (written by the Vercel Cron route)
  const envPayload = process.env.LAUREUM_STATUS_LIST_PAYLOAD;
  let credential: unknown = null;
  if (envPayload) {
    try {
      const parsed = JSON.parse(envPayload);
      credential = parsed?.credential ?? parsed;
    } catch {
      credential = null;
    }
  }

  // 2. Fall back to backend
  if (!credential) {
    credential = await fetchFromBackend();
  }

  // 3. Placeholder
  if (!credential) {
    credential = PLACEHOLDER_LIST;
  }

  return NextResponse.json(credential, {
    headers: {
      "Content-Type": "application/ld+json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
