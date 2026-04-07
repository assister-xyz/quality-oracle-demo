"use client";

/**
 * QO-048: Cost & Token Breakdown (QO-017 output)
 *
 * Shows total cost in USD + token breakdown by provider for transparency.
 */
import { Zap } from "lucide-react";
import type { TokenUsage } from "@/lib/api";

interface Props {
  tokenUsage?: TokenUsage | null;
  costUsd?: number | null;
}

export function CostBreakdown({ tokenUsage, costUsd }: Props) {
  if (!tokenUsage && !costUsd) return null;

  const totalIn = tokenUsage?.total_input_tokens ?? 0;
  const totalOut = tokenUsage?.total_output_tokens ?? 0;
  const total = totalIn + totalOut;
  const providers = Object.entries(tokenUsage?.by_provider ?? {});

  return (
    <section className="rounded-md border border-[#E5E3E0] bg-white p-6">
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-[#E2754D]" />
          <h3 className="font-display text-lg font-semibold">Cost & Tokens</h3>
        </div>
        {costUsd != null && (
          <div className="text-right">
            <div className="font-mono text-2xl font-bold tabular-nums text-[#0E0E0C]">
              ${costUsd.toFixed(4)}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-[#6B6964]">
              total cost
            </div>
          </div>
        )}
      </header>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-sm bg-[#FAFAF8] p-3">
          <div className="text-[10px] uppercase tracking-wider text-[#6B6964]">Input tokens</div>
          <div className="font-mono text-lg font-bold tabular-nums text-[#0E0E0C]">
            {totalIn.toLocaleString()}
          </div>
        </div>
        <div className="rounded-sm bg-[#FAFAF8] p-3">
          <div className="text-[10px] uppercase tracking-wider text-[#6B6964]">Output tokens</div>
          <div className="font-mono text-lg font-bold tabular-nums text-[#0E0E0C]">
            {totalOut.toLocaleString()}
          </div>
        </div>
        <div className="rounded-sm bg-[#FAFAF8] p-3">
          <div className="text-[10px] uppercase tracking-wider text-[#6B6964]">Total</div>
          <div className="font-mono text-lg font-bold tabular-nums text-[#0E0E0C]">
            {total.toLocaleString()}
          </div>
        </div>
      </div>

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
