/**
 * AQVC issuer ledger for laureum.ai (QO-053-I AC9).
 *
 * Public-key ledger surfaced for verifiers + auditors to inspect
 * historical key rotations. Companion to `/.well-known/did.json`,
 * which is the DID-Document-shaped view; this endpoint is the
 * Laureum-specific issuer metadata (rotation policy, contact, etc.).
 *
 * Cache headers per AC9: `public, max-age=300, stale-while-revalidate=3600`.
 */
import { NextResponse } from "next/server";

const LAUREUM_DID = "did:web:laureum.ai";

const DEV_PLACEHOLDER_MULTIBASE =
  "z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK";

export const dynamic = "force-static";
export const revalidate = 300;

interface HistoricalKey {
  id: string;
  publicKeyMultibase: string;
  rotated_at?: string;
  reason?: string;
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
  const rotated = process.env.LAUREUM_DID_CURRENT_KEY_ROTATED_AT || null;

  const ledger = {
    "@context": "https://laureum.ai/credentials/v1",
    issuer: LAUREUM_DID,
    aqvc_version: "1.0",
    rotation_policy: "quarterly",
    compromise_drill: {
      sla_minutes: 5,
      runbook: "https://laureum.ai/docs/compromise-drill",
      steps: [
        "Issuer revokes all AQVCs signed by compromised key (status list bit flip)",
        "Status list re-issued + republished within 5 minutes",
        "Compromised key removed from assertionMethod[] (kept in verificationMethod[] so historical AQVCs still verify)",
        "New key added to assertionMethod[]; rotated_at timestamp updated",
      ],
    },
    current_key: {
      id: `${LAUREUM_DID}#key-1`,
      publicKeyMultibase: currentMultibase,
      rotated_at: rotated,
    },
    historical_keys: parseHistoricalKeys(),
    contact: {
      security: "security@laureum.ai",
      pgp: "https://laureum.ai/.well-known/pgp.asc",
    },
    status_lists: ["https://laureum.ai/credentials/status/1"],
    // The DID Document is the canonical entry point; this ledger is
    // a Laureum-specific view of issuer metadata + rotation history.
    did_document: "https://laureum.ai/.well-known/did.json",
  };

  return NextResponse.json(ledger, {
    headers: {
      "Cache-Control":
        "public, max-age=300, stale-while-revalidate=3600",
    },
  });
}
