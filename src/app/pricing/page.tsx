"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { PaymentModal } from "@/components/landing/payment-modal";
import { trackCtaClick, trackPricingView, trackPricingTierClick } from "@/lib/analytics";
import Link from "next/link";

/* ── Tier Data ── */
const TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "For exploring and quick scans",
    features: [
      "5 full evaluations / month",
      "Unlimited L1 quick scans (IP-limited)",
      "Basic trust badge",
      "Public leaderboard listing",
      "Community support",
    ],
    cta: "Start Free",
    ctaAction: "link" as const,
    ctaHref: "/evaluate",
    highlighted: false,
    popular: false,
  },
  {
    name: "Builder",
    price: "$29",
    period: "/mo",
    description: "For indie developers shipping agents",
    features: [
      "50 evaluations / month",
      "Premium badge with score display",
      "Full API access",
      "Domain-specific rankings",
      "AQVC credential export",
      "Score decay alerts",
      "Email support",
    ],
    cta: "Join Waitlist",
    ctaAction: "modal" as const,
    highlighted: true,
    popular: true,
  },
  {
    name: "Team",
    price: "$99",
    period: "/mo",
    description: "For startups with multiple agents",
    features: [
      "500 evaluations / month",
      "Team dashboard",
      "Continuous monitoring",
      "Custom badge domain",
      "Compliance report export",
      "Priority support",
      "CI/CD integration",
    ],
    cta: "Join Waitlist",
    ctaAction: "modal" as const,
    highlighted: false,
    popular: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For organizations at scale",
    features: [
      "Unlimited evaluations",
      "SLA guarantee",
      "White-label badges",
      "SOC 2 & EU AI Act reports",
      "SSO / SAML",
      "On-premise deployment",
      "Dedicated account manager",
    ],
    cta: "Contact Us",
    ctaAction: "mailto" as const,
    highlighted: false,
    popular: false,
  },
];

/* ── Feature Comparison Matrix ── */
const COMPARISON_FEATURES = [
  { name: "Full evaluations / month", free: "5", builder: "50", team: "500", enterprise: "Unlimited" },
  { name: "L1 quick scans", free: "Unlimited", builder: "Unlimited", team: "Unlimited", enterprise: "Unlimited" },
  { name: "6-axis quality scoring", free: true, builder: true, team: true, enterprise: true },
  { name: "15 security probes", free: true, builder: true, team: true, enterprise: true },
  { name: "W3C credential", free: false, builder: true, team: true, enterprise: true },
  { name: "Embeddable trust badge", free: "Basic", builder: "Premium", team: "Custom domain", enterprise: "White-label" },
  { name: "API access", free: false, builder: true, team: true, enterprise: true },
  { name: "Domain rankings", free: false, builder: true, team: true, enterprise: true },
  { name: "Score decay alerts", free: false, builder: true, team: true, enterprise: true },
  { name: "Team dashboard", free: false, builder: false, team: true, enterprise: true },
  { name: "Continuous monitoring", free: false, builder: false, team: true, enterprise: true },
  { name: "CI/CD integration", free: false, builder: false, team: true, enterprise: true },
  { name: "Compliance reports", free: false, builder: false, team: false, enterprise: true },
  { name: "SSO / SAML", free: false, builder: false, team: false, enterprise: true },
  { name: "SLA guarantee", free: false, builder: false, team: false, enterprise: true },
  { name: "On-premise", free: false, builder: false, team: false, enterprise: true },
  { name: "Support", free: "Community", builder: "Email", team: "Priority", enterprise: "Dedicated" },
];

/* ── FAQ Data ── */
const FAQ_ITEMS = [
  {
    q: "Is the free tier really free?",
    a: "Yes. 5 full evaluations and unlimited quick scans per month, no credit card required. Just paste your server URL and get results.",
  },
  {
    q: "What's the difference between a scan and an evaluation?",
    a: "A scan (L1) checks your server's manifest quality and tool descriptions in seconds. An evaluation (L2/L3) runs 15 security probes, 6-axis quality scoring, and generates a W3C verifiable credential.",
  },
  {
    q: "Can I upgrade anytime?",
    a: "Yes, upgrade or downgrade at any time. Changes take effect on your next billing cycle.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept credit cards and cryptocurrency (USDC, SOL on Solana).",
  },
  {
    q: "Do you offer discounts for open-source projects?",
    a: "Yes! Contact us for special pricing for open-source MCP servers and AI agents.",
  },
  {
    q: "What happens when I exceed my monthly limit?",
    a: "You'll see a notification. Upgrade to continue evaluating, or wait for your limit to reset next month.",
  },
];

/* ── FAQ Accordion Item ── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[#2a2a30] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-sm font-display font-600 text-white group-hover:text-[#F97316] transition-colors pr-4">
          {q}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-[#535862] shrink-0 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-40 pb-5" : "max-h-0"
        }`}
      >
        <p className="text-sm text-[#717069] leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

/* ── Comparison Cell ── */
function ComparisonCell({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="h-4 w-4 text-[#10b981] mx-auto" />
    ) : (
      <span className="text-[#535862] text-sm">—</span>
    );
  }
  return <span className="text-sm text-white">{value}</span>;
}

/* ── Main Pricing Page ── */
export default function PricingPage() {
  const router = useRouter();
  const [modalTier, setModalTier] = useState<string | null>(null);
  const promoCode = process.env.NEXT_PUBLIC_PROMO_CODE;

  useEffect(() => {
    trackPricingView();
  }, []);

  function handleTierClick(tier: (typeof TIERS)[number]) {
    trackPricingTierClick(tier.name.toLowerCase());

    if (tier.ctaAction === "link") {
      router.push(tier.ctaHref!);
    } else if (tier.ctaAction === "mailto") {
      const a = document.createElement("a");
      a.href = "mailto:contact@laureum.ai";
      a.click();
    } else {
      setModalTier(tier.name);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A1A]">
      {/* Promo Banner */}
      {promoCode && (
        <div className="bg-gradient-to-r from-[#F97316]/10 via-[#F97316]/5 to-[#F97316]/10 border-b border-[#F97316]/20">
          <div className="max-w-5xl mx-auto px-6 py-3 text-center">
            <p className="text-sm text-[#F97316]">
              <Sparkles className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
              Use code <span className="font-mono font-bold text-white">{promoCode}</span> for 60-day free Builder trial
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="uppercase tracking-[0.2em] text-[#535862] text-xs font-medium mb-3">
            Pricing
          </p>
          <h1 className="text-3xl md:text-5xl font-display font-800 text-white tracking-tight mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-[#717069] text-sm md:text-base max-w-lg mx-auto">
            Start free. Upgrade when you need more evaluations, badges, and team features.
          </p>
        </div>
      </section>

      {/* Tier Cards */}
      <section className="pb-20 md:pb-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`relative border rounded-sm p-6 flex flex-col transition-all duration-300 hover:-translate-y-0.5 ${
                  tier.highlighted
                    ? "border-[#F97316] bg-[#F97316]/5"
                    : "border-[#2a2a30] bg-[#0A0A14] hover:border-[#3a3a40]"
                }`}
              >
                {/* Popular badge */}
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#F97316] text-white text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-sm">
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className="text-sm font-display font-600 text-white mb-1">
                  {tier.name}
                </h3>
                <p className="text-xs text-[#535862] mb-4">{tier.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-display font-800 text-white">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-sm text-[#535862]">{tier.period}</span>
                  )}
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className="text-sm text-[#717069] flex items-start gap-2"
                    >
                      <Check className="h-3.5 w-3.5 text-[#F97316] shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleTierClick(tier)}
                  className={`w-full text-sm font-semibold uppercase tracking-wider py-3 rounded-sm transition-colors ${
                    tier.highlighted
                      ? "bg-[#F97316] hover:bg-[#EA580C] text-white"
                      : tier.name === "Free"
                      ? "bg-white/10 hover:bg-white/20 text-white"
                      : "border border-[#2a2a30] hover:border-[#F97316] text-[#717069] hover:text-white"
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="pb-20 md:pb-28">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-display font-700 text-white text-center tracking-tight mb-12">
            Feature comparison
          </h2>

          <div className="border border-[#2a2a30] rounded-sm overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-[#2a2a30] bg-[#0A0A14]">
                  <th className="text-left text-xs text-[#535862] uppercase tracking-wider font-medium px-5 py-4 w-[240px]">
                    Feature
                  </th>
                  {["Free", "Builder", "Team", "Enterprise"].map((name) => (
                    <th
                      key={name}
                      className={`text-center text-xs uppercase tracking-wider font-medium px-4 py-4 ${
                        name === "Builder"
                          ? "text-[#F97316]"
                          : "text-[#535862]"
                      }`}
                    >
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((row, i) => (
                  <tr
                    key={row.name}
                    className={`border-b border-[#1a1a22] last:border-0 ${
                      i % 2 === 0 ? "bg-[#0A0A14]/50" : ""
                    }`}
                  >
                    <td className="text-sm text-[#717069] px-5 py-3.5">
                      {row.name}
                    </td>
                    <td className="text-center px-4 py-3.5">
                      <ComparisonCell value={row.free} />
                    </td>
                    <td className="text-center px-4 py-3.5 bg-[#F97316]/[0.02]">
                      <ComparisonCell value={row.builder} />
                    </td>
                    <td className="text-center px-4 py-3.5">
                      <ComparisonCell value={row.team} />
                    </td>
                    <td className="text-center px-4 py-3.5">
                      <ComparisonCell value={row.enterprise} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-20 md:pb-28">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-display font-700 text-white text-center tracking-tight mb-12">
            Frequently asked questions
          </h2>

          <div className="border border-[#2a2a30] rounded-sm bg-[#0A0A14] px-6">
            {FAQ_ITEMS.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="pb-20 md:pb-28 border-t border-[#1a1a22] pt-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-4xl font-display font-800 text-white tracking-tight mb-4">
            Ready to verify your agent?
          </h2>
          <p className="text-[#717069] text-sm mb-8">
            Free evaluation. Results in under 3 minutes.
          </p>
          <Link
            href="/evaluate"
            onClick={() => trackCtaClick("pricing_bottom_cta")}
            className="inline-flex items-center gap-3 bg-[#F97316] hover:bg-[#EA580C] text-white px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] rounded-sm transition-colors group"
          >
            Start Free Evaluation
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      {/* Payment Modal */}
      {modalTier && (
        <PaymentModal tier={modalTier} onClose={() => setModalTier(null)} />
      )}
    </div>
  );
}
