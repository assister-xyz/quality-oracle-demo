"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

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

