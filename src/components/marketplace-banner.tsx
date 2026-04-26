"use client";

import { motion } from "framer-motion";
import { LaurelIcon } from "@/components/laurel-icon";
import type { MarketplaceListResponse } from "@/lib/marketplace";

interface MarketplaceBannerProps {
  data: MarketplaceListResponse;
  /** Pretty-printed name of the marketplace, e.g. "SendAI". */
  displayName: string;
  /** Number of skills with negative score deltas in the last batch. */
  recentlyRegressed?: number;
}

const ease = [0.45, 0.02, 0.09, 0.98] as const;

/**
 * Stats strip that anchors the public scorecard. Shows skill count, average
 * score, recently-regressed count, and the "scored under" provenance tagline
 * (per QO-053-H §"activation provider transparency").
 */
export function MarketplaceBanner({
  data,
  displayName,
  recentlyRegressed,
}: MarketplaceBannerProps) {
  const regressed =
    recentlyRegressed ??
    data.items.filter((it) => (it.delta_vs_baseline ?? 0) < -1).length;

  return (
    <div className="bg-[#0E0E0C] pt-24 pb-12 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="uppercase tracking-[0.2em] text-[#717069] text-xs font-medium mb-3"
        >
          Public Scorecard
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
          className="text-3xl md:text-5xl font-display font-700 text-[#F5F5F3] tracking-tight"
        >
          {displayName} <span className="text-[#E2754D]">Skills</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.2 }}
          className="mt-4 text-[#A0A09C] max-w-3xl text-base"
        >
          Continuously evaluated against R5 §12 attack vectors and 6-axis
          quality scoring. Scored under{" "}
          <span className="text-[#F5F5F3] font-mono text-sm">Llama-3.1-8B</span>{" "}
          activation; Claude Code activation available at Audited tier.
        </motion.p>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.3 }}
          className="mt-8 flex flex-wrap gap-x-10 gap-y-4"
        >
          <Stat label="Skills" value={data.total.toString()} />
          <Stat label="Avg Score" value={`${data.avg_score}/100`} />
          <Stat
            label="Top Risks"
            value={`${data.top_risks.length}`}
            valueClass="text-[#E2754D]"
          />
          <Stat label="Recently Regressed" value={regressed.toString()} />
          <div className="flex items-center gap-2 text-[#A0A09C] text-sm">
            <LaurelIcon tier="audited" size={20} />
            <span>Last batch: {new Date(data.generated_at).toUTCString().slice(0, 22)}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Stat({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div>
      <div className={`font-mono text-2xl text-[#F5F5F3] ${valueClass ?? ""}`}>{value}</div>
      <div className="text-xs uppercase tracking-wider text-[#717069] mt-1">{label}</div>
    </div>
  );
}
