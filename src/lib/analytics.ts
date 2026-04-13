/* PostHog + GTM + Google Ads analytics helpers */

type PostHogEvent = {
  event: string;
  properties?: Record<string, unknown>;
};

function getPostHog(): { capture: (event: string, properties?: Record<string, unknown>) => void; identify: (id: string, properties?: Record<string, unknown>) => void } | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).posthog || null;
}

function getUtmData(): Record<string, string> {
  if (typeof document === "undefined") return {};
  try {
    const cookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("utm_data="));
    if (!cookie) return {};
    return JSON.parse(decodeURIComponent(cookie.split("=")[1]));
  } catch {
    return {};
  }
}

function getVariant(): string {
  if (typeof document === "undefined") return "";
  const cookie = document.cookie
    .split("; ")
    .find((c) => c.startsWith("ab_variant="));
  return cookie?.split("=")[1] || "";
}

function pushToDataLayer(event: string, properties: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...properties });
}

function fireGoogleAdsConversion(label?: string) {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  if (w.gtag) {
    w.gtag("event", "conversion", {
      send_to: label
        ? `AW-18066381680/${label}`
        : "AW-18066381680/JtsHCKDAvpYcEPC23KZD",
    });
  }
}

function trackEvent({ event, properties = {} }: PostHogEvent) {
  const ph = getPostHog();
  const utm = getUtmData();
  const variant = getVariant();

  const enrichedProps = {
    variant,
    ...utm,
    ...properties,
  };

  if (ph) {
    ph.capture(event, enrichedProps);
  }

  // Push to GTM dataLayer
  pushToDataLayer(event, enrichedProps);

  // Console log for development when PostHog isn't configured
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] ${event}`, enrichedProps);
  }
}

export function trackPageView() {
  trackEvent({ event: "landing_page_view" });
}

export function trackCtaClick(buttonLocation: string) {
  trackEvent({
    event: "cta_click",
    properties: { button_location: buttonLocation },
  });

  // Fire Google Ads conversion directly on CTA click
  // This bypasses GTM and sends conversion signal to Google Ads immediately
  fireGoogleAdsConversion("JtsHCKDAvpYcEPC23KZD");
}

export function trackScrollDepth(depth: number) {
  trackEvent({
    event: "scroll_depth",
    properties: { depth_percent: depth },
  });
}

export function trackEmailSubmit(hasAgentUrl: boolean) {
  trackEvent({
    event: "email_submit",
    properties: { has_agent_url: hasAgentUrl },
  });
}

export function trackPaymentIntent(tier: string) {
  trackEvent({
    event: "payment_intent",
    properties: { selected_tier: tier },
  });
}

export function trackPricingView() {
  trackEvent({ event: "pricing_page_view" });
}

export function trackPricingTierClick(tier: string) {
  trackEvent({
    event: "pricing_tier_click",
    properties: { tier },
  });
}

export function trackEvaluateSubmit(url: string, evalMode: string) {
  trackEvent({
    event: "evaluate_submit",
    properties: { target_url: url, eval_mode: evalMode },
  });
}

export function trackLeadFormSubmit(data: {
  email: string;
  tier: string;
  agentUrl?: string;
  useCase?: string;
  role?: string;
}) {
  // Push dedicated conversion event to dataLayer for GTM
  pushToDataLayer("lead_form_submit", {
    email: data.email,
    tier: data.tier,
    has_agent_url: !!data.agentUrl,
    role: data.role || "",
  });

  // Also capture in PostHog with full data
  const ph = getPostHog();
  if (ph) {
    ph.identify(data.email, {
      tier: data.tier,
      agent_url: data.agentUrl || "",
      use_case: data.useCase || "",
      role: data.role || "",
    });
    ph.capture("lead_form_submit", {
      email: data.email,
      tier: data.tier,
      has_agent_url: !!data.agentUrl,
      use_case: data.useCase || "",
      role: data.role || "",
      ...getUtmData(),
      variant: getVariant(),
    });
  }

  // Fire Google Ads conversion directly
  fireGoogleAdsConversion("JtsHCKDAvpYcEPC23KZD");
}

export { getVariant, getUtmData };
