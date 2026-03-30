"use client";

import { useState } from "react";
import { ArrowRight, Link2, Search, Shield, Award, Check } from "lucide-react";
import { PaymentModal } from "./payment-modal";
import { trackCtaClick } from "@/lib/analytics";
import Link from "next/link";

/* ── How It Works Section ── */
export function HowItWorks() {
  const steps = [
    {
      icon: Link2,
      step: "01",
      title: "Connect",
      desc: "Paste your MCP server URL",
    },
    {
      icon: Search,
      step: "02",
      title: "Discover",
      desc: "We map all tools and capabilities",
    },
    {
      icon: Shield,
      step: "03",
      title: "Evaluate",
      desc: "15 security probes + 6-axis quality scoring",
    },
    {
      icon: Award,
      step: "04",
      title: "Attest",
      desc: "Get embeddable trust badge + W3C credential",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-[#0A0A1A]">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-center uppercase tracking-[0.2em] text-[#535862] text-xs font-medium mb-3">
          How It Works
        </p>
        <h2 className="text-2xl md:text-4xl font-display font-700 text-white text-center tracking-tight mb-14">
          Four steps to verified trust
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
          {steps.map((s) => (
            <div key={s.step}>
              <div className="flex items-center gap-3 mb-3">
                <s.icon className="h-5 w-5 text-[#F97316]" />
                <span className="text-xs font-mono text-[#535862]">
                  {s.step}
                </span>
              </div>
              <h3 className="text-lg font-display font-600 text-white mb-1">
                {s.title}
              </h3>
              <p className="text-sm text-[#717069] leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Badge Preview Section ── */
export function BadgePreview() {
  const [copied, setCopied] = useState(false);

  const badgeCode = `[![Laureum Verified](https://laureum.ai/badge/your-agent.svg)](https://laureum.ai/leaderboard)`;

  function handleCopy() {
    navigator.clipboard.writeText(badgeCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <section className="py-20 md:py-28 bg-[#0F0F1E]">
      <div className="max-w-4xl mx-auto px-6">
        <p className="text-center uppercase tracking-[0.2em] text-[#535862] text-xs font-medium mb-3">
          Trust Badges
        </p>
        <h2 className="text-2xl md:text-4xl font-display font-700 text-white text-center tracking-tight mb-4">
          Embeddable trust badges
        </h2>
        <p className="text-center text-sm text-[#717069] mb-12 max-w-lg mx-auto">
          Show your agent&apos;s verified score in README, docs, or marketplaces.
        </p>

        {/* Mock GitHub README context */}
        <div className="border border-[#2a2a30] rounded-sm overflow-hidden max-w-2xl mx-auto">
          <div className="bg-[#161620] px-4 py-2.5 border-b border-[#2a2a30] flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#2a2a30]" />
            <span className="text-xs text-[#535862] font-mono">README.md</span>
          </div>
          <div className="bg-[#0A0A14] p-6">
            <p className="text-sm text-[#717069] font-mono mb-4">
              # My MCP Server
            </p>
            <p className="text-sm text-[#717069] font-mono mb-4">
              A production-ready MCP server for data analysis.
            </p>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#161620] border border-[#2a2a30] rounded-sm px-3 py-1.5">
              <Shield className="h-3.5 w-3.5 text-[#10b981]" />
              <span className="text-xs font-mono text-[#10b981]">
                Laureum Verified
              </span>
              <span className="text-xs font-mono text-white">85/100</span>
              <span className="text-[10px] font-mono text-[#F97316] uppercase">
                Proficient
              </span>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 text-sm text-[#717069] hover:text-white border border-[#2a2a30] hover:border-[#F97316] px-4 py-2 rounded-sm transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#10b981]" />
                Copied!
              </>
            ) : (
              <>Copy badge code</>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── Mini Leaderboard Section ── */
const STATIC_LEADERBOARD = [
  { rank: 1, name: "Sequential Thinking", score: 92, tier: "Expert" },
  { rank: 2, name: "Brave Search", score: 87, tier: "Proficient" },
  { rank: 3, name: "GitHub MCP", score: 81, tier: "Proficient" },
  { rank: 4, name: "Filesystem Server", score: 74, tier: "Basic" },
  { rank: 5, name: "Memory Server", score: 68, tier: "Basic" },
];

function getTierColor(tier: string) {
  switch (tier.toLowerCase()) {
    case "expert":
      return "text-[#F97316]";
    case "proficient":
      return "text-[#10b981]";
    default:
      return "text-[#535862]";
  }
}

export function MiniLeaderboard() {
  return (
    <section className="py-20 md:py-28 bg-[#0A0A1A]">
      <div className="max-w-3xl mx-auto px-6">
        <p className="text-center uppercase tracking-[0.2em] text-[#535862] text-xs font-medium mb-3">
          Leaderboard
        </p>
        <h2 className="text-2xl md:text-4xl font-display font-700 text-white text-center tracking-tight mb-12">
          Top evaluated agents
        </h2>

        <div className="border border-[#2a2a30] rounded-sm overflow-hidden">
          {STATIC_LEADERBOARD.map((agent) => (
            <div
              key={agent.rank}
              className="flex items-center justify-between py-4 px-5 border-b border-[#1a1a22] last:border-0"
            >
              <div className="flex items-center gap-4">
                <span className="text-lg font-display font-700 text-[#535862] w-6 text-center">
                  {agent.rank}
                </span>
                <span className="text-sm font-display font-600 text-white">
                  {agent.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider ${getTierColor(
                    agent.tier
                  )}`}
                >
                  {agent.tier}
                </span>
                <span className="text-sm font-mono text-white">
                  {agent.score}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 text-sm text-[#717069] hover:text-white transition-colors"
          >
            View full leaderboard <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Pricing Preview Section ── */
const TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "",
    features: ["5 evals/month", "Basic badge", "Leaderboard"],
    cta: "Start Free",
    isFree: true,
  },
  {
    name: "Builder",
    price: "$29",
    period: "/mo",
    features: ["50 evals/month", "Premium badge", "API access"],
    cta: "Join Waitlist",
    isFree: false,
  },
  {
    name: "Team",
    price: "$99",
    period: "/mo",
    features: ["500 evals/month", "Team dashboard", "Monitoring"],
    cta: "Join Waitlist",
    isFree: false,
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: ["Unlimited evals", "Custom integration", "SLA"],
    cta: "Contact Us",
    isFree: false,
  },
];

export function PricingPreview() {
  const [modalTier, setModalTier] = useState<string | null>(null);

  return (
    <section className="py-20 md:py-28 bg-[#0F0F1E]">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-center uppercase tracking-[0.2em] text-[#535862] text-xs font-medium mb-3">
          Pricing
        </p>
        <h2 className="text-2xl md:text-4xl font-display font-700 text-white text-center tracking-tight mb-12">
          Simple, transparent pricing
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`border rounded-sm p-5 ${
                tier.highlighted
                  ? "border-[#F97316] bg-[#F97316]/5"
                  : "border-[#2a2a30] bg-[#0A0A14]"
              }`}
            >
              <h3 className="text-sm font-display font-600 text-white mb-1">
                {tier.name}
              </h3>
              <div className="mb-4">
                <span className="text-3xl font-display font-800 text-white">
                  {tier.price}
                </span>
                {tier.period && (
                  <span className="text-sm text-[#535862]">{tier.period}</span>
                )}
              </div>

              <ul className="space-y-2 mb-6">
                {tier.features.map((f) => (
                  <li
                    key={f}
                    className="text-sm text-[#717069] flex items-center gap-2"
                  >
                    <Check className="h-3.5 w-3.5 text-[#F97316] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  if (tier.isFree) {
                    trackCtaClick("pricing_free");
                    window.location.href = "/evaluate";
                  } else {
                    trackCtaClick(`pricing_${tier.name.toLowerCase()}`);
                    setModalTier(tier.name);
                  }
                }}
                className={`w-full text-sm font-semibold uppercase tracking-wider py-2.5 rounded-sm transition-colors ${
                  tier.highlighted
                    ? "bg-[#F97316] hover:bg-[#EA580C] text-white"
                    : tier.isFree
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

      {modalTier && (
        <PaymentModal tier={modalTier} onClose={() => setModalTier(null)} />
      )}
    </section>
  );
}

/* ── Final CTA Section ── */
export function FinalCta({
  headline = "Ready to verify your agent?",
  ctaText = "Start Free Evaluation",
  ctaHref = "/evaluate",
}: {
  headline?: string;
  ctaText?: string;
  ctaHref?: string;
}) {
  return (
    <section className="py-20 md:py-28 bg-[#0A0A1A] border-t border-[#1a1a22]">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-2xl md:text-4xl font-display font-800 text-white tracking-tight mb-4">
          {headline}
        </h2>
        <p className="text-[#717069] text-sm mb-8">
          Free evaluation. Results in under 3 minutes.
        </p>
        <Link
          href={ctaHref}
          onClick={() => trackCtaClick("bottom")}
          className="inline-flex items-center gap-3 bg-[#F97316] hover:bg-[#EA580C] text-white px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] rounded-sm transition-colors group"
        >
          {ctaText}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}

/* ── Footer ── */
export function LandingFooter() {
  return (
    <footer className="py-12 bg-[#060610] border-t border-[#1a1a22]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-bold tracking-tight text-white">
              Laureum
            </span>
          </div>
          <p className="text-xs text-[#535862]">
            Pre-payment quality verification for AI agents. Built by{" "}
            <a
              href="https://assisterr.ai"
              target="_blank"
              rel="noopener"
              className="text-[#717069] hover:text-white transition-colors"
            >
              Assisterr
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
