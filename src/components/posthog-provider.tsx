"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Keys we persist on every event as superproperties so every downstream
// interaction carries the ad-landing context, not just the initial pageview.
// Matches the middleware.ts UTM_KEYS list.
const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
];

function readUtmContext(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const out: Record<string, string> = {};

  // 1. Prefer URL query params on the current page (freshest signal).
  try {
    const params = new URLSearchParams(window.location.search);
    for (const key of UTM_KEYS) {
      const val = params.get(key);
      if (val) out[key] = val;
    }
  } catch { /* ignore */ }

  // 2. Fall back to the utm_data cookie set by middleware — covers the
  //    case where a redirect or a Next.js route transition dropped the
  //    query from the URL but the cookie persists.
  if (Object.keys(out).length === 0) {
    try {
      const cookie = document.cookie
        .split("; ")
        .find((c) => c.startsWith("utm_data="));
      if (cookie) {
        const parsed = JSON.parse(decodeURIComponent(cookie.split("=")[1]));
        for (const key of UTM_KEYS) {
          if (parsed[key]) out[key] = parsed[key];
        }
      }
    } catch { /* ignore */ }
  }

  return out;
}

export function PostHogProvider() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || typeof window === "undefined") return;

    // Dynamically load posthog-js only if key is configured
    import("posthog-js").then((posthogModule) => {
      const posthog = posthogModule.default;
      posthog.init(key, {
        api_host: "https://us.i.posthog.com",
        capture_pageview: false, // We handle this manually
        capture_pageleave: true,
        persistence: "localStorage+cookie",
      });

      // Register UTMs as SUPERPROPERTIES so they attach to every future
      // event automatically — not just $pageview. Fixes the ads-funnel
      // diagnosis that showed utm_source on only 1/56 users even though
      // Google Ads reported 437 UTM-tagged impressions: some events
      // missed enrichment because the manual per-event code path wasn't
      // hit consistently. Superproperties bind once at init.
      const utm = readUtmContext();
      if (Object.keys(utm).length > 0) {
        posthog.register(utm);
        // Also stash on the person record so cohort analysis works.
        posthog.people?.set?.({
          initial_utm_source: utm.utm_source || "",
          initial_utm_campaign: utm.utm_campaign || "",
          initial_utm_medium: utm.utm_medium || "",
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).posthog = posthog;
    }).catch(() => {
      // PostHog not available — no-op
    });
  }, []);

  return null;
}

function PageViewTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Read variant cookie
    const variantCookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("ab_variant="));
    const variant = variantCookie?.split("=")[1] || "";

    // Read UTM data cookie
    let utmData: Record<string, string> = {};
    try {
      const utmCookie = document.cookie
        .split("; ")
        .find((c) => c.startsWith("utm_data="));
      if (utmCookie) {
        utmData = JSON.parse(decodeURIComponent(utmCookie.split("=")[1]));
      }
    } catch { /* ignore */ }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ph = (window as any).posthog;
    if (ph) {
      ph.capture("$pageview", {
        $current_url: window.location.href,
        variant,
        ...utmData,
      });
    }

    // Push to GTM dataLayer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event: "page_view", page_path: pathname, variant });
  }, [pathname, searchParams]);

  return null;
}

export function PageViewTracker() {
  return (
    <Suspense fallback={null}>
      <PageViewTrackerInner />
    </Suspense>
  );
}

export function ClarityScript() {
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;
  if (!clarityId) return null;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","${clarityId}");`,
      }}
    />
  );
}

