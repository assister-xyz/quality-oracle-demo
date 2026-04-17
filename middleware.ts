import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// A/B variants still in-flight. Variant "a" was retired on 2026-04-17 after
// ~40 users: 31% CTA rate vs 79% (B) and 77% (C). Users who already have
// the "a" cookie stay on "a" (stickiness, no flicker mid-session) but no
// new users are assigned. Once cookies expire they migrate to B/C.
const ACTIVE_VARIANTS = ["b", "c"] as const;
// All variants we'll honor from existing cookies (includes retired "a").
const RECOGNIZED_VARIANTS = new Set(["a", "b", "c"]);

// UTM params we want to capture from ad-landing URLs.
const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
] as const;

function extractUtm(searchParams: URLSearchParams): Record<string, string> | null {
  const out: Record<string, string> = {};
  let found = false;
  for (const key of UTM_KEYS) {
    const val = searchParams.get(key);
    if (val) {
      out[key] = val;
      found = true;
    }
  }
  return found ? out : null;
}

function setUtmCookie(response: NextResponse, utm: Record<string, string>) {
  response.cookies.set("utm_data", JSON.stringify(utm), {
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
    sameSite: "lax",
  });
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // Safety-net redirect: www → apex, preserving the query string. Vercel
  // normally handles this at the domain level, but if its redirect drops
  // the query string we lose UTM tracking (the ads-team verified 437 ad
  // impressions were reaching the page with UTM tags but 0 Clarity
  // sessions were attributed — classic UTM-strip). Doing the redirect
  // ourselves guarantees params survive.
  const host = request.headers.get("host") || "";
  if (host.startsWith("www.")) {
    const target = new URL(url.toString());
    target.host = host.slice(4);
    return NextResponse.redirect(target, 308);
  }

  const variant = request.cookies.get("ab_variant")?.value;
  const utm = extractUtm(url.searchParams);

  // First-time visitor (or a cookie we don't recognize) — assign a variant.
  if (!variant || !RECOGNIZED_VARIANTS.has(variant)) {
    const assigned = ACTIVE_VARIANTS[Math.floor(Math.random() * ACTIVE_VARIANTS.length)];
    const response = NextResponse.next();
    response.cookies.set("ab_variant", assigned, {
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
    });
    if (utm) setUtmCookie(response, utm);
    return response;
  }

  // Returning visitor with a new ad click — refresh the utm_data cookie
  // so attribution reflects the most recent campaign interaction.
  if (utm) {
    const response = NextResponse.next();
    setUtmCookie(response, utm);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
