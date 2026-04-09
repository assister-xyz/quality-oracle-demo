"use client";

import { useEffect } from "react";
import { VariantA } from "./variant-a";
import { VariantB } from "./variant-b";
import { VariantC } from "./variant-c";
import { trackScrollDepth } from "@/lib/analytics";

export function LandingPageClient({ variant }: { variant: "a" | "b" | "c" }) {
  // Track scroll depth (page views handled globally by PageViewTracker)
  useEffect(() => {
    let maxDepth = 0;
    const thresholds = [25, 50, 75, 100];

    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const depth = Math.round((scrollTop / docHeight) * 100);

      for (const t of thresholds) {
        if (depth >= t && maxDepth < t) {
          trackScrollDepth(t);
        }
      }
      maxDepth = Math.max(maxDepth, depth);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  switch (variant) {
    case "a":
      return <VariantA />;
    case "b":
      return <VariantB />;
    case "c":
      return <VariantC />;
    default:
      return <VariantA />;
  }
}
