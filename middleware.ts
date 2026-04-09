import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const variant = request.cookies.get("ab_variant")?.value;

  if (!variant || !["a", "b", "c"].includes(variant)) {
    const assigned = ["a", "b", "c"][Math.floor(Math.random() * 3)];
    const response = NextResponse.next();
    response.cookies.set("ab_variant", assigned, {
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
    });

    // Also persist UTM params if present
    const url = request.nextUrl;
    const utmSource = url.searchParams.get("utm_source");
    const utmMedium = url.searchParams.get("utm_medium");
    const utmCampaign = url.searchParams.get("utm_campaign");

    if (utmSource || utmMedium || utmCampaign) {
      const utmData = JSON.stringify({
        utm_source: utmSource || "",
        utm_medium: utmMedium || "",
        utm_campaign: utmCampaign || "",
      });
      response.cookies.set("utm_data", utmData, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
        sameSite: "lax",
      });
    }

    return response;
  }

  // Update UTM data if new UTM params come in
  const url = request.nextUrl;
  const utmSource = url.searchParams.get("utm_source");
  if (utmSource) {
    const utmData = JSON.stringify({
      utm_source: utmSource || "",
      utm_medium: url.searchParams.get("utm_medium") || "",
      utm_campaign: url.searchParams.get("utm_campaign") || "",
    });
    const response = NextResponse.next();
    response.cookies.set("utm_data", utmData, {
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
