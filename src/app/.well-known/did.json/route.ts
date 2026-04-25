/**
 * DID Document for did:web:laureum.ai (QO-053-I AC5/AC9).
 *
 * Resolved by W3C VC verifiers when they encounter
 * `issuer: "did:web:laureum.ai"` in an AQVC. Returns the canonical
 * DID Document with Multikey verificationMethod entries.
 *
 * Cache headers per AC9: `public, max-age=300, stale-while-revalidate=3600`
 * — 5-minute compromise drill: revoke list updated, status list re-issued,
 * key removed from `assertionMethod` within 5 min. Old keys stay in
 * `verificationMethod[]` so historical AQVCs still verify.
 *
 * The current key is sourced from `LAUREUM_DID_CURRENT_KEY` (multibase
 * base58btc encoded with 'z' prefix). Historical keys are JSON in
 * `LAUREUM_DID_HISTORICAL_KEYS` (array of `{id, publicKeyMultibase}`).
 *
 * Both env vars are populated at deploy time from the issuer's
 * Ed25519 keypair. In dev (no env) we serve a deterministic placeholder
 * so the route is still discoverable.
 */
import { NextResponse } from "next/server";

const LAUREUM_DID = "did:web:laureum.ai";

// Default placeholder used when LAUREUM_DID_CURRENT_KEY is unset (dev mode).
// This is NOT a real key — it's a syntactically valid multibase string so
// the route returns 200 with a parseable DID Document.
const DEV_PLACEHOLDER_MULTIBASE =
  "z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK";

export const dynamic = "force-static";
export const revalidate = 300;

interface HistoricalKey {
  id: string; // e.g. "did:web:laureum.ai#key-2026-q1"
  publicKeyMultibase: string;
}

function parseHistoricalKeys(): HistoricalKey[] {
  const raw = process.env.LAUREUM_DID_HISTORICAL_KEYS;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (k): k is HistoricalKey =>
        typeof k?.id === "string" && typeof k?.publicKeyMultibase === "string",
    );
  } catch {
    return [];
  }
}

export async function GET() {
  const currentMultibase =
    process.env.LAUREUM_DID_CURRENT_KEY || DEV_PLACEHOLDER_MULTIBASE;
  const currentKeyId = `${LAUREUM_DID}#key-1`;

  const verificationMethod = [
    {
      id: currentKeyId,
      type: "Multikey",
      controller: LAUREUM_DID,
      publicKeyMultibase: currentMultibase,
    },
    ...parseHistoricalKeys().map((hk) => ({
      id: hk.id,
      type: "Multikey",
      controller: LAUREUM_DID,
      publicKeyMultibase: hk.publicKeyMultibase,
    })),
  ];

  const didDocument = {
    "@context": [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/multikey/v1",
    ],
    id: LAUREUM_DID,
    verificationMethod,
    // Only the current key signs new AQVCs; historical keys remain in
    // verificationMethod[] so old credentials still verify.
    assertionMethod: [currentKeyId],
    authentication: [currentKeyId],
  };

  return NextResponse.json(didDocument, {
    headers: {
      "Content-Type": "application/did+json",
      "Cache-Control":
        "public, max-age=300, stale-while-revalidate=3600",
    },
  });
}
