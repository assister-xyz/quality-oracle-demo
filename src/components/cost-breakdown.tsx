"use client";

/**
 * QO-048 / QO-051: Cost & CPCR Breakdown.
 *
 * Shows CPCR as the headline number (LayerLens/PinchBench-compatible),
 * with raw USD + token detail below. shadow_cpcr uses paid-API market
 * rates so free-tier evals remain comparable on the public leaderboard.
 */
import { useState } from "react";
import { HelpCircle, Zap } from "lucide-react";
import type { CPCRScores, TokenUsage } from "@/lib/api";

interface Props {
  tokenUsage?: TokenUsage | null;
  costUsd?: number | null;
  shadowCostUsd?: number | null;
  cpcr?: CPCRScores | null;
}

function formatCpcr(value: number | null | undefined): string {
  if (value == null) return "—";
  if (value === 0) return "$0.000000";
  // Scale to significant digits for very small CPCRs
  if (value < 0.000001) return `$${value.toExponential(2)}`;
  return `$${value.toFixed(6)}`;
}

export function CostBreakdown({ tokenUsage, costUsd, shadowCostUsd, cpcr }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!tokenUsage && !costUsd && !cpcr) return null;

  const totalIn = tokenUsage?.total_input_tokens ?? 0;
  const totalOut = tokenUsage?.total_output_tokens ?? 0;
  const total = totalIn + totalOut;
  const providers = Object.entries(tokenUsage?.by_provider ?? {});
  // Headline is shadow_cpcr — canonical public value (free-tier safe).
  const headline = cpcr?.shadow_cpcr ?? cpcr?.cpcr ?? null;
  const threshold = cpcr?.correct_threshold ?? 70;

  return (
    <section
      className="rounded-md border border-[#E5E3E0] bg-white p-6"
      data-testid="cost-breakdown"
    >
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-[#E2754D]" />
          <h3 className="font-display text-lg font-semibold">Cost per Correct Response</h3>
        </div>
        {headline !== null && (
          <div className="text-right">
            <div
              className="font-mono text-3xl font-bold tabular-nums text-[#0E0E0C]"
              data-testid="cpcr-headline"
            >
              {formatCpcr(headline)}
            </div>
            <div className="flex items-center justify-end gap-1 text-[10px] uppercase tracking-wider text-[#6B6964]">
              per correct response
              <button
                type="button"
                aria-label="CPCR formula"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onFocus={() => setShowTooltip(true)}
                onBlur={() => setShowTooltip(false)}
                className="relative"
              >
                <HelpCircle className="h-3 w-3 text-[#6B6964]" />
                {showTooltip && (
                  <span className="absolute bottom-full right-0 mb-2 w-64 rounded-sm border border-[#E5E3E0] bg-white p-2 text-left text-[10px] font-normal leading-relaxed text-[#0E0E0C] shadow-md">
                    <strong>Shadow CPCR</strong> = shadow_cost_usd / correct_count.
                    A response counts as correct when the judge score ≥ {threshold}.
                    Shadow uses paid-API market rates so free-tier evals stay comparable.
                  </span>
                )}
              </button>
            </div>
          </div>
        )}
      </header>

      {cpcr && (
        <div
          className="mb-4 grid grid-cols-3 gap-3"
          data-testid="cpcr-variants"
        >
          <div className="rounded-sm bg-[#FAFAF8] p-3">
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#6B6964]">
              Binary
            </div>
            <div
              className="font-mono text-base font-bold tabular-nums text-[#0E0E0C]"
              data-testid="cpcr-binary"
            >
              {formatCpcr(cpcr.cpcr)}
            </div>
            <div className="mt-0.5 text-[9px] text-[#6B6964]">
              cost / {cpcr.correct_count ?? 0} correct
            </div>
          </div>
          <div className="rounded-sm bg-[#FAFAF8] p-3">
            <div className="text-[10px] uppercase tracking-wider text-[#6B6964]">Weighted</div>
            <div
              className="font-mono text-base font-bold tabular-nums text-[#0E0E0C]"
              data-testid="cpcr-weighted"
            >
              {formatCpcr(cpcr.weighted_cpcr)}
            </div>
            <div className="mt-0.5 text-[9px] text-[#6B6964]">partial credit</div>
          </div>
          <div className="rounded-sm bg-[#E2754D]/5 p-3 ring-1 ring-[#E2754D]/20">
            <div className="text-[10px] uppercase tracking-wider text-[#E2754D]">
              Shadow · public rate
            </div>
            <div
              className="font-mono text-base font-bold tabular-nums text-[#0E0E0C]"
              data-testid="cpcr-shadow"
            >
              {formatCpcr(cpcr.shadow_cpcr)}
            </div>
            <div className="mt-0.5 text-[9px] text-[#6B6964]">market rate</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-3 border-t border-[#E5E3E0] pt-4">
        {costUsd != null && (
          <div className="rounded-sm bg-[#FAFAF8] p-3">
            <div className="text-[10px] uppercase tracking-wider text-[#6B6964]">Total cost</div>
            <div className="font-mono text-base font-bold tabular-nums text-[#0E0E0C]">
              ${costUsd.toFixed(4)}
            </div>
          </div>
        )}
        {shadowCostUsd != null && (
          <div className="rounded-sm bg-[#FAFAF8] p-3">
            <div className="text-[10px] uppercase tracking-wider text-[#6B6964]">Shadow cost</div>
            <div className="font-mono text-base font-bold tabular-nums text-[#0E0E0C]">
              ${shadowCostUsd.toFixed(4)}
            </div>
          </div>
        )}
        <div className="rounded-sm bg-[#FAFAF8] p-3">
          <div className="text-[10px] uppercase tracking-wider text-[#6B6964]">Input tokens</div>
          <div className="font-mono text-base font-bold tabular-nums text-[#0E0E0C]">
            {totalIn.toLocaleString()}
          </div>
        </div>
        <div className="rounded-sm bg-[#FAFAF8] p-3">
          <div className="text-[10px] uppercase tracking-wider text-[#6B6964]">Output tokens</div>
          <div className="font-mono text-base font-bold tabular-nums text-[#0E0E0C]">
            {totalOut.toLocaleString()}
          </div>
        </div>
      </div>
      {total > 0 && (
        <div className="mt-2 text-right text-[10px] text-[#6B6964]">
          {total.toLocaleString()} total tokens
        </div>
      )}

      {providers.length > 0 && (
        <div className="mt-4 border-t border-[#E5E3E0] pt-3">
          <div className="mb-2 text-[10px] uppercase tracking-wider text-[#6B6964]">
            By provider
          </div>
          <div className="space-y-1.5">
            {providers.map(([provider, stats]) => (
              <div key={provider} className="flex items-center justify-between text-xs">
                <span className="font-medium capitalize text-[#0E0E0C]">{provider}</span>
                <span className="font-mono text-[#6B6964]">
                  {stats.calls} calls · {(stats.input + stats.output).toLocaleString()} tokens
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tokenUsage?.optimization && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-[#6B6964]">
          <span className="rounded-full bg-[#E2754D]/10 px-2 py-0.5 text-[#E2754D]">
            {tokenUsage.optimization.llm_calls ?? 0} LLM calls
          </span>
          {(tokenUsage.optimization.fuzzy_routed ?? 0) > 0 && (
            <span className="rounded-full bg-[#10b981]/10 px-2 py-0.5 text-[#10b981]">
              {tokenUsage.optimization.fuzzy_routed} fuzzy-routed
            </span>
          )}
          {(tokenUsage.optimization.cache_hits ?? 0) > 0 && (
            <span className="rounded-full bg-[#3b82f6]/10 px-2 py-0.5 text-[#3b82f6]">
              {tokenUsage.optimization.cache_hits} cache hits
            </span>
          )}
        </div>
      )}
    </section>
  );
}
