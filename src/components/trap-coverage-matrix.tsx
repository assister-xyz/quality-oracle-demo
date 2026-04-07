"use client";

/**
 * QO-048: Agent Trap Coverage Matrix
 *
 * Visualises Laureum's coverage of Google DeepMind's "AI Agent Traps"
 * taxonomy (Franklin et al., 2026 — SSRN-6372438).
 *
 * Maps each of the 6 attack categories to coverage % from QO-045 probes.
 */
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import type { AgentTrapCoverage } from "@/lib/api";

const CATEGORY_LABELS: Record<string, { name: string; description: string }> = {
  content_injection: {
    name: "Content Injection",
    description: "Hidden commands in HTML/CSS/metadata, dynamic cloaking, syntactic masking",
  },
  semantic_manipulation: {
    name: "Semantic Manipulation",
    description: "Authority bias, oversight evasion, persona hyperstition",
  },
  cognitive_state: {
    name: "Cognitive State",
    description: "RAG poisoning, latent memory poisoning, contextual learning traps",
  },
  behavioural_control: {
    name: "Behavioural Control",
    description: "Embedded jailbreaks, data exfiltration, sub-agent spawning",
  },
  systemic: {
    name: "Systemic",
    description: "Congestion traps, cascades, tacit collusion, compositional fragments, Sybil",
  },
  human_in_the_loop: {
    name: "Human-in-the-Loop",
    description: "Approval fatigue, social engineering via agent",
  },
};

interface Props {
  coverage: AgentTrapCoverage;
}

export function TrapCoverageMatrix({ coverage }: Props) {
  return (
    <section className="rounded-md border border-[#E5E3E0] bg-white p-6">
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#E2754D]" />
            <h3 className="font-display text-lg font-semibold">
              Agent Trap Coverage
            </h3>
          </div>
          <p className="text-xs leading-relaxed text-[#6B6964]">
            Mapped to <span className="font-mono">Franklin et al. 2026</span> &nbsp;·&nbsp;
            6 categories, {coverage.total_trap_types} attack types,&nbsp;
            {coverage.total_testable} testable
          </p>
        </div>
        <div className="text-right">
          <div className="font-mono text-3xl font-bold tabular-nums text-[#0E0E0C]">
            {coverage.coverage_pct}%
          </div>
          <div className="text-[10px] uppercase tracking-wider text-[#6B6964]">
            {coverage.total_covered}/{coverage.total_testable} covered
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(coverage.categories).map(([key, cat]) => {
          const meta = CATEGORY_LABELS[key] ?? { name: key, description: "" };
          const isFullyCovered = cat.coverage_pct >= 100;
          const isUncovered = cat.coverage_pct === 0;

          return (
            <div
              key={key}
              className="rounded-sm border border-[#E5E3E0] bg-[#FAFAF8] p-3 transition-colors hover:bg-white"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="text-xs font-semibold text-[#0E0E0C]">
                    {meta.name}
                  </div>
                  <div className="mt-0.5 text-[10px] leading-tight text-[#6B6964]">
                    {meta.description}
                  </div>
                </div>
                {isFullyCovered ? (
                  <ShieldCheck className="h-4 w-4 shrink-0 text-[#10b981]" />
                ) : isUncovered ? (
                  <ShieldAlert className="h-4 w-4 shrink-0 text-[#A0A09C]" />
                ) : (
                  <Shield className="h-4 w-4 shrink-0 text-[#E2754D]" />
                )}
              </div>

              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#6B6964]">
                  {cat.covered}/{cat.testable} traps
                </span>
                <span className="font-mono text-sm font-bold tabular-nums text-[#0E0E0C]">
                  {cat.coverage_pct}%
                </span>
              </div>

              <div className="h-1 overflow-hidden rounded-full bg-[#E5E3E0]">
                <div
                  className="h-full rounded-full bg-[#E2754D] transition-all duration-700"
                  style={{ width: `${cat.coverage_pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <footer className="mt-4 border-t border-[#E5E3E0] pt-3">
        <p className="text-[10px] leading-relaxed text-[#6B6964]">
          Source: <span className="font-mono">Franklin, Tomasev, Jacobs, Leibo, Osindero (Google DeepMind, 2026).</span>
          {" "}<a href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6372438" target="_blank" rel="noopener noreferrer" className="text-[#E2754D] hover:underline">&ldquo;AI Agent Traps&rdquo;</a>
          {" "}— first systematic taxonomy of 6 attack categories targeting autonomous AI agents.
        </p>
      </footer>
    </section>
  );
}
