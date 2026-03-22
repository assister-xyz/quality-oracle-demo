"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { useScoresList, useBackendHealth } from "@/lib/hooks";
import { ScoreGauge } from "@/components/score-gauge";
import { TierBadge } from "@/components/tier-badge";
import { LaurelWreath, LaurelLogo } from "@/components/laurel-logo";
import { LaurelBadge } from "@/components/laurel-badge";
import {
  ArrowRight,
  Shield,
  Layers,
  Award,
  Zap,
  Fingerprint,
  ExternalLink,
  Timer,
} from "lucide-react";

const ease = [0.45, 0.02, 0.09, 0.98] as const;

/* ── Text Scramble Effect ── */
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&";
const WORDS = ["Verify", "Benchmark", "Certify", "Trust"];

function useTextScramble(words: string[], interval = 3000) {
  const [display, setDisplay] = useState(words[0]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, interval);
    return () => clearInterval(timer);
  }, [words, interval]);

  useEffect(() => {
    const target = words[index];
    const maxLen = Math.max(display.length, target.length);
    let frame = 0;
    const totalFrames = 12;

    const scramble = () => {
      frame++;
      const progress = frame / totalFrames;
      let result = "";
      for (let i = 0; i < maxLen; i++) {
        if (i < target.length) {
          if (progress > (i + 1) / maxLen) {
            result += target[i];
          } else {
            result += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          }
        }
      }
      setDisplay(result);
      if (frame < totalFrames) {
        requestAnimationFrame(scramble);
      } else {
        setDisplay(target);
      }
    };
    requestAnimationFrame(scramble);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return display;
}

/* ── Count-up animation ── */
function CountUp({ target, suffix = "" }: { target: number | string; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView || typeof target !== "number" || target === 0) return;
    const duration = 1200;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);

  const displayed = typeof target === "number" && target > 0 ? `${value}${suffix}` : "—";

  return <div ref={ref}>{displayed}</div>;
}

/* ── Reveal wrapper ── */
function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Ticker strip ── */
function TickerStrip() {
  const items = [
    "Multi-Judge Consensus",
    "6-Axis Scoring",
    "Adversarial Probes",
    "AQVC Attestation",
    "Anti-Gaming Detection",
    "Ed25519 Signatures",
    "IRT Adaptive Testing",
    "MCP Protocol Native",
  ];
  const repeated = [...items, ...items];

  return (
    <div className="overflow-hidden bg-[#151515] py-4 border-y border-[#2a2a28] ticker-wrap">
      <div className="ticker-track flex gap-12 whitespace-nowrap">
        {repeated.map((item, i) => (
          <span
            key={i}
            className="text-[13px] font-display font-600 uppercase tracking-[0.2em] text-[#535862]"
          >
            {item}
            <span className="mx-6 text-[#E2754D]">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Page ── */
export default function LandingPage() {
  const { servers } = useScoresList({ limit: 5, sort: "score" });
  const completed = servers.filter((s) => s.status === "completed");
  const totalEvals = completed.length;
  const avgScore =
    totalEvals > 0
      ? Math.round(completed.reduce((sum, s) => sum + s.score, 0) / totalEvals)
      : 0;
  const passRate =
    totalEvals > 0
      ? Math.round(
          (completed.filter((s) => s.score >= 50).length / totalEvals) * 100
        )
      : 0;
  const expertCount = completed.filter((s) => s.tier === "expert").length;

  const scrambledWord = useTextScramble(WORDS, 3000);

  return (
    <div className="overflow-hidden">
      {/* ═══════════════════════════════════════
          SECTION 1 — HERO (full-bleed, dark, 100svh)
          ═══════════════════════════════════════ */}
      <section className="relative min-h-svh flex flex-col items-center justify-center bg-[#0E0E0C] noise-overlay">
        {/* Radial glow */}
        <div className="hero-glow absolute inset-0 pointer-events-none" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          {/* Animated wreath — more visible */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease }}
            className="mx-auto mb-10"
          >
            <LaurelWreath size={160} className="text-[#E2754D]/50 mx-auto" />
          </motion.div>

          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="uppercase tracking-[0.3em] text-[#717069] text-xs font-medium mb-6"
          >
            AI Agent Quality Verification
          </motion.p>

          {/* Brand — hero-level signal */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease }}
            className="font-display text-7xl md:text-[120px] font-800 text-[#F5F5F3] tracking-tight"
            style={{ letterSpacing: "-0.05em", lineHeight: "0.85" }}
          >
            LAUREUM
          </motion.h1>

          {/* Tagline with text scramble */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6, ease }}
            className="text-xl md:text-2xl text-[#A0A09C] mt-8 font-light leading-relaxed"
          >
            <span className="inline-block min-w-[140px] text-[#E2754D] font-display font-600">
              {scrambledWord}
            </span>{" "}
            AI agents before you pay.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6, ease }}
            className="mt-10"
          >
            <Link href="/evaluate">
              <button className="group bg-[#E2754D] hover:bg-[#d4623d] text-white px-10 py-4 text-sm font-semibold uppercase tracking-[0.15em] transition-all duration-300 rounded-sm inline-flex items-center gap-3 hover:gap-4 hover:shadow-[0_0_40px_rgba(226,117,77,0.3)]">
                Evaluate an Agent
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-5 h-8 rounded-full border-2 border-[#535862]/40 flex items-start justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-1.5 rounded-full bg-[#535862]"
            />
          </div>
        </motion.div>
      </section>

      {/* Ticker */}
      <TickerStrip />

      {/* ═══════════════════════════════════════
          SECTION 2 — STATS BAR (light)
          ═══════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#F5F5F3] section-border-top">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {[
                { label: "Agents Evaluated", value: totalEvals, suffix: "" },
                { label: "Average Score", value: avgScore, suffix: "/100" },
                { label: "Pass Rate", value: passRate, suffix: "%" },
                { label: "Expert Tier", value: expertCount, suffix: "" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-4xl md:text-5xl font-mono font-bold tabular-nums text-foreground">
                    <CountUp target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="mt-2 text-xs uppercase tracking-[0.15em] text-[#717069] font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 3 — WHAT WE DO (dark, no cards)
          ═══════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-[#0E0E0C]">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal>
            <p className="text-center uppercase tracking-[0.2em] text-[#717069] text-xs font-medium mb-4">
              What Laureum Does
            </p>
            <h2 className="text-3xl md:text-5xl font-display font-700 text-[#F5F5F3] text-center tracking-tight mb-16">
              Six dimensions of trust
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-x-12 gap-y-14">
            {[
              { icon: Shield, title: "Accuracy", desc: "Functional correctness of every tool response, validated by multiple LLM judges.", weight: "35%" },
              { icon: Fingerprint, title: "Safety", desc: "Adversarial probe resistance — injection, extraction, PII leakage, hallucination.", weight: "20%" },
              { icon: Zap, title: "Reliability", desc: "Consistent results across repeated evaluations and varied inputs.", weight: "15%" },
              { icon: Layers, title: "Process Quality", desc: "Error handling, input validation, response structure — the engineering dimension.", weight: "10%" },
              { icon: Award, title: "Schema Quality", desc: "Tool manifest completeness, documentation quality, type annotations.", weight: "10%" },
              { icon: Timer, title: "Latency", desc: "Response time under load, measured against tier-specific thresholds.", weight: "10%" },
            ].map((dim, i) => (
              <Reveal key={dim.title} delay={i * 0.08}>
                <div className="group">
                  <div className="flex items-center gap-3 mb-3">
                    <dim.icon className="h-5 w-5 text-[#E2754D]" />
                    <span className="text-[11px] font-mono text-[#535862] uppercase tracking-wider">{dim.weight}</span>
                  </div>
                  <h3 className="text-lg font-display font-600 text-[#F5F5F3] mb-2">{dim.title}</h3>
                  <p className="text-sm text-[#717069] leading-relaxed">{dim.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 4 — HOW IT WORKS (light)
          ═══════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-[#F5F5F3]">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal>
            <p className="text-center uppercase tracking-[0.2em] text-[#717069] text-xs font-medium mb-4">
              How It Works
            </p>
            <h2 className="text-3xl md:text-5xl font-display font-700 text-foreground text-center tracking-tight mb-16">
              Four steps to verified trust
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-4 gap-8 md:gap-6">
            {[
              { step: "01", title: "Connect", desc: "Paste any MCP server URL. We auto-detect SSE or Streamable HTTP." },
              { step: "02", title: "Discover", desc: "List all tools, validate schema, check documentation quality." },
              { step: "03", title: "Evaluate", desc: "Run functional tests per tool. Multiple LLM judges score independently." },
              { step: "04", title: "Attest", desc: "Generate 6-axis score, tier badge, and Ed25519-signed AQVC attestation." },
            ].map((item, i) => (
              <Reveal key={item.step} delay={i * 0.1}>
                <div>
                  <span className="text-5xl md:text-6xl font-display font-800 text-[#E5E3E0]" style={{ lineHeight: 1 }}>
                    {item.step}
                  </span>
                  <h3 className="text-lg font-display font-700 text-foreground mt-4 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#717069] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Connecting line */}
          <Reveal>
            <div className="hidden md:block mt-8">
              <div className="h-px bg-gradient-to-r from-transparent via-[#E5E3E0] to-transparent" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 5 — LEADERBOARD PREVIEW (dark)
          ═══════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-[#0E0E0C]">
        <div className="max-w-4xl mx-auto px-6">
          <Reveal>
            <p className="text-center uppercase tracking-[0.2em] text-[#717069] text-xs font-medium mb-4">
              Leaderboard
            </p>
            <h2 className="text-3xl md:text-5xl font-display font-700 text-[#F5F5F3] text-center tracking-tight mb-4">
              Top evaluated agents
            </h2>
            <p className="text-center text-[#717069] text-sm mb-12">
              {totalEvals > 0
                ? `${totalEvals} agents scored with multi-judge consensus.`
                : "Evaluate your first agent to appear here."}
            </p>
          </Reveal>

          {completed.length > 0 ? (
            <Reveal delay={0.1}>
              <div className="rounded-sm border border-[#2a2a28] overflow-hidden">
                {completed.slice(0, 5).map((server, i) => (
                  <Link key={server.id} href={`/evaluate?result=${server.id}`}>
                    <div className="flex items-center justify-between py-5 px-6 hover:bg-[#1a1a18] transition-colors duration-300 group cursor-pointer border-b border-[#1a1a18] last:border-0">
                      <div className="flex items-center gap-5">
                        <span className="text-lg font-display font-700 text-[#535862] w-8 text-center">
                          {i + 1}
                        </span>
                        <div>
                          <span className="text-base font-display font-600 text-[#F5F5F3] group-hover:text-[#E2754D] transition-colors">
                            {server.name}
                          </span>
                          <span className="text-xs text-[#535862] ml-3">
                            {server.tools_count} tools
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#535862] border border-[#2a2a28] px-2 py-0.5 rounded-sm">
                          {server.tier}
                        </span>
                        <ScoreGauge score={server.score} tier={server.tier} size={44} strokeWidth={3} showLabel={false} variant="dark" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Reveal>
          ) : (
            <Reveal delay={0.1}>
              <div className="text-center py-12 border border-[#2a2a28] rounded-sm">
                <p className="text-sm text-[#535862]">
                  No evaluations yet.{" "}
                  <Link href="/evaluate" className="text-[#E2754D] hover:underline">
                    Run your first evaluation
                  </Link>
                </p>
              </div>
            </Reveal>
          )}

          <Reveal delay={0.2}>
            <div className="text-center mt-8">
              <Link
                href="/leaderboard"
                className="inline-flex items-center gap-2 text-sm text-[#717069] hover:text-[#F5F5F3] transition-colors link-underline"
              >
                View full leaderboard <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 6 — WHAT YOU GET (light)
          ═══════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-[#F5F5F3]">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal>
            <p className="text-center uppercase tracking-[0.2em] text-[#717069] text-xs font-medium mb-4">
              What You Get
            </p>
            <h2 className="text-3xl md:text-5xl font-display font-700 text-foreground text-center tracking-tight mb-16">
              Proof your agent is trustworthy
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-12">
            <Reveal delay={0}>
              <div className="text-center">
                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 flex items-center justify-center bg-[#0E0E0C] rounded-sm">
                    <Award className="h-9 w-9 text-[#E2754D]" />
                  </div>
                </div>
                <h3 className="font-display font-700 text-lg mb-2">Embeddable Badge</h3>
                <p className="text-sm text-[#717069] leading-relaxed">
                  SVG badge with your score and tier. Embed in README, docs, or marketplace listings.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="text-center">
                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 flex items-center justify-center bg-[#0E0E0C] rounded-sm">
                    <Fingerprint className="h-9 w-9 text-[#E2754D]" />
                  </div>
                </div>
                <h3 className="font-display font-700 text-lg mb-2">Signed Attestation</h3>
                <p className="text-sm text-[#717069] leading-relaxed">
                  Ed25519-signed JWT in W3C Verifiable Credential format. Cryptographic proof of quality.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="text-center">
                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 flex items-center justify-center bg-[#0E0E0C] rounded-sm">
                    <Shield className="h-9 w-9 text-[#E2754D]" />
                  </div>
                </div>
                <h3 className="font-display font-700 text-lg mb-2">Tier Classification</h3>
                <p className="text-sm text-[#717069] leading-relaxed">
                  Expert, Proficient, Basic, or Failed. Clear quality signals for agent marketplaces.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Badge preview */}
          <Reveal delay={0.3}>
            <div className="mt-16 flex justify-center">
              <div className="hidden md:block">
                <LaurelBadge score={93} tier="expert" trustLevel="verified" size="lg" />
              </div>
              <div className="md:hidden">
                <LaurelBadge score={93} tier="expert" trustLevel="verified" size="md" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 7 — CTA (brand accent)
          ═══════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#E2754D] relative overflow-hidden">
        {/* Decorative wreath watermark */}
        <div className="absolute right-[-40px] top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
          <LaurelWreath size={300} className="text-white" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <Reveal>
            <h2 className="text-3xl md:text-5xl font-display font-800 text-white tracking-tight mb-6">
              Ready to verify your agent?
            </h2>
            <p className="text-lg text-white/70 mb-10">
              Free evaluation. Results in under 3 minutes.
            </p>
            <Link href="/evaluate">
              <button className="group bg-[#0E0E0C] text-white px-10 py-4 text-sm font-semibold uppercase tracking-[0.15em] hover:bg-[#1a1a18] transition-all duration-300 rounded-sm inline-flex items-center gap-3 hover:gap-4 hover:shadow-[0_0_40px_rgba(0,0,0,0.3)]">
                Start Evaluation
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER (dark)
          ═══════════════════════════════════════ */}
      <footer className="py-16 bg-[#0E0E0C] border-t border-[#1a1a18]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <LaurelLogo size={24} className="text-[#E2754D]" />
                <span className="font-display text-lg font-bold tracking-tight text-[#F5F5F3]">
                  Laureum
                </span>
              </Link>
              <p className="text-sm text-[#535862] max-w-xs">
                Pre-payment quality verification for AI agents.
              </p>
            </div>

            <div className="flex gap-12">
              <div>
                <p className="text-[11px] uppercase tracking-[0.15em] text-[#535862] font-medium mb-3">Product</p>
                <div className="flex flex-col gap-2">
                  <Link href="/evaluate" className="text-sm text-[#717069] hover:text-[#F5F5F3] transition-colors">Evaluate</Link>
                  <Link href="/leaderboard" className="text-sm text-[#717069] hover:text-[#F5F5F3] transition-colors">Leaderboard</Link>
                  <Link href="/battle" className="text-sm text-[#717069] hover:text-[#F5F5F3] transition-colors">Battle Arena</Link>
                  <Link href="/dashboard" className="text-sm text-[#717069] hover:text-[#F5F5F3] transition-colors">Dashboard</Link>
                </div>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.15em] text-[#535862] font-medium mb-3">Links</p>
                <div className="flex flex-col gap-2">
                  <a href="https://pypi.org/project/mcp-agenttrust/" target="_blank" rel="noopener" className="text-sm text-[#717069] hover:text-[#F5F5F3] transition-colors inline-flex items-center gap-1">
                    PyPI <ExternalLink className="h-3 w-3" />
                  </a>
                  <a href="https://github.com/assister-xyz/quality-oracle" target="_blank" rel="noopener" className="text-sm text-[#717069] hover:text-[#F5F5F3] transition-colors inline-flex items-center gap-1">
                    GitHub <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[#1a1a18] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#535862]">
              Laureum v1.0 — AI Agent Quality Verification
            </p>
            <p className="text-xs text-[#535862]">
              Built by{" "}
              <a
                href="https://assisterr.ai"
                target="_blank"
                rel="noopener"
                className="text-[#717069] hover:text-[#F5F5F3] transition-colors"
              >
                Assisterr
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
