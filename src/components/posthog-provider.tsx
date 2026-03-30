"use client";

import { useEffect } from "react";

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
