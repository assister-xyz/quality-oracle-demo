"use client";

/**
 * QO-048: OWASP Triple-Aligned Coverage Badge
 *
 * Static display of Laureum's OWASP coverage:
 * - LLM Top 10 (8/10)
 * - Agentic Top 10 (9/10)
 * - MCP Top 10 (8/10)
 *
 * Sourced from QO-025, QO-035, QO-036 implementations.
 */
import { Shield, CheckCircle2 } from "lucide-react";

interface OwaspList {
  key: string;
  name: string;
  short: string;
  covered: number;
  total: number;
  description: string;
}

const OWASP_LISTS: OwaspList[] = [
  {
    key: "llm",
    name: "OWASP Top 10 for LLM Applications",
    short: "LLM",
    covered: 8,
    total: 10,
    description: "Prompt injection, output handling, training poisoning, model DoS, supply chain, info disclosure, plugin design, agency, overreliance, logging",
  },
  {
    key: "agentic",
    name: "OWASP Top 10 for Agentic Applications",
    short: "Agentic",
    covered: 9,
    total: 10,
    description: "Goal hijack, tool exploitation, identity abuse, supply chain, code execution, memory poisoning, inter-agent comms, cascading failures, human exploitation, rogue agents",
  },
  {
    key: "mcp",
    name: "OWASP MCP Top 10",
    short: "MCP",
    covered: 8,
    total: 10,
    description: "Token mismanagement, privilege escalation, tool poisoning, supply chain, command injection, intent flow subversion, auth, audit, shadow servers, context injection",
  },
];

export function OwaspCoverageBadge() {
  const tripleAligned = OWASP_LISTS.every((l) => l.covered >= 7);
  const totalCovered = OWASP_LISTS.reduce((sum, l) => sum + l.covered, 0);
  const totalPossible = OWASP_LISTS.reduce((sum, l) => sum + l.total, 0);

  return (
    <section className="rounded-md border border-[#E5E3E0] bg-white p-6">
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#E2754D]" />
            <h3 className="font-display text-lg font-semibold">
              OWASP Coverage
            </h3>
            {tripleAligned && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[#E2754D]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#E2754D]">
                <CheckCircle2 className="h-3 w-3" />
                Triple-Aligned
              </span>
            )}
          </div>
          <p className="text-xs text-[#6B6964]">
            Probes mapped to all three OWASP Top 10 lists for AI agent security
          </p>
        </div>
        <div className="text-right">
          <div className="font-mono text-3xl font-bold tabular-nums text-[#0E0E0C]">
            {totalCovered}/{totalPossible}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-[#6B6964]">
            risks covered
          </div>
        </div>
      </header>

      <div className="space-y-2.5">
        {OWASP_LISTS.map((list) => {
          const pct = (list.covered / list.total) * 100;
          return (
            <div key={list.key} className="rounded-sm border border-[#E5E3E0] bg-[#FAFAF8] p-3">
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-sm bg-[#0E0E0C] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-[#F5F5F3]">
                    {list.short}
                  </span>
                  <span className="text-xs font-medium text-[#0E0E0C]">
                    {list.name}
                  </span>
                </div>
                <span className="font-mono text-sm font-bold tabular-nums text-[#0E0E0C]">
                  {list.covered}/{list.total}
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-[#E5E3E0]">
                <div
                  className="h-full rounded-full bg-[#E2754D] transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <footer className="mt-4 border-t border-[#E5E3E0] pt-3">
        <p className="text-[10px] leading-relaxed text-[#6B6964]">
          OWASP = Open Worldwide Application Security Project. Coverage updated as new probes ship in QO-025, QO-035, QO-036.
          Implementations: 25 adversarial probe types across 9 of 10 Agentic risks, 8 of 10 LLM risks, 8 of 10 MCP risks.
        </p>
      </footer>
    </section>
  );
}
