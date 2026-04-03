/* PostHog + Clarity analytics helpers */

type PostHogEvent = {
  event: string;
  properties?: Record<string, unknown>;
};

function getPostHog(): { capture: (event: string, properties?: Record<string, unknown>) => void } | null {
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

  // Push to GTM dataLayer for Google Ads conversion tracking
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

export { getVariant, getUtmData };
