"use client";

import { ArrowRight } from "lucide-react";
import { trackCtaClick } from "@/lib/analytics";
import {
  HowItWorks,
  BadgePreview,
  MiniLeaderboard,
  PricingPreview,
  FinalCta,
  LandingFooter,
} from "./shared";
import Link from "next/link";

/* ── Variant B: "Scan, Score, Certify your Agent" (Process-focused) ── */
export function VariantB() {
  const multitargetLive =
    process.env.NEXT_PUBLIC_LAUREUM_MULTITARGET_LIVE === "true";
  const subHeadline = multitargetLive
    ? "Any MCP server, A2A agent, or Claude Skill. Six-axis scoring, adversarial probes, and a signed AQVC attestation you can embed anywhere."
    : "Today: any MCP server. Coming soon: A2A agents and Claude Skills. Six-axis scoring, adversarial probes, and a signed AQVC attestation you can embed anywhere.";

  return (
    <div className="bg-[#0A0A1A] min-h-screen">
      {/* HERO */}
      <section
        data-testid="hero"
        className="min-h-svh flex flex-col items-center justify-center px-6"
      >
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-800 text-white tracking-tight leading-[0.95]">
            Scan, Score, Certify your AI agents
          </h1>

          <p
            data-testid="hero-subheadline"
            className="mt-6 text-lg md:text-xl text-[#717069] max-w-2xl mx-auto"
          >
            {subHeadline}
          </p>

          <div className="mt-10">
            <Link
              href="/evaluate"
              onClick={() => trackCtaClick("hero")}
              className="inline-flex items-center gap-3 bg-[#F97316] hover:bg-[#EA580C] text-white px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] rounded-sm transition-colors group"
            >
              Scan Your Agent Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {[
              { value: "847", label: "evaluations" },
              { value: "52", label: "agents certified" },
              { value: "6", label: "quality dimensions" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-display font-800 text-white">
                  {stat.value}
                </div>
                <div className="text-xs text-[#535862] uppercase tracking-wider mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shared sections */}
      <HowItWorks />
      <BadgePreview />
      <MiniLeaderboard />
      <PricingPreview />
      <FinalCta
        headline="Ready to certify your agent?"
        ctaText="Scan Your Agent Free"
      />
      <LandingFooter />
    </div>
  );
}
