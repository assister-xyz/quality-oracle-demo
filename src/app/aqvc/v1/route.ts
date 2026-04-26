/**
 * Sigstore predicate-type URL alias `https://laureum.ai/aqvc/v1`
 * (QO-053-I CB6).
 *
 * QO-053-G's GitHub Action publishes Sigstore attestations with
 * `predicate-type: "https://laureum.ai/aqvc/v1"`. This route serves
 * the same JSON-LD context body as `/credentials/v1` so verifiers can
 * dereference either URL and get the same answer.
 *
 * MUST be live before QO-053-G ships (CB6 sequencing).
 */
import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = 86400;

export async function GET(request: Request) {
  // Redirect to the canonical context URL. We use a 308 (permanent)
  // so verifiers can cache the redirection target and dereference
  // /credentials/v1 directly thereafter.
  const url = new URL("/credentials/v1", request.url);
  return NextResponse.redirect(url.toString(), 308);
}
