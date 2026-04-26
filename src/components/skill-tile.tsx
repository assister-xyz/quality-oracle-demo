"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { TierBadge } from "@/components/tier-badge";
import { RadarWithNA } from "@/components/radar-with-na";
import type { MarketplaceListItem } from "@/lib/marketplace";
import type { QualityTier } from "@/lib/mock-data";

interface SkillTileProps {
  item: MarketplaceListItem;
  marketplaceSlug: string;
  /** Surface the R5 risk score badge in the tile corner. */
  showRisk?: boolean;
}

/**
 * One tile in the marketplace grid. Click → /marketplace/{slug}/{skill}.
 */
export function SkillTile({ item, marketplaceSlug, showRisk = true }: SkillTileProps) {
  const lastEval = item.last_eval_at
    ? new Date(item.last_eval_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "—";

  const isHighRisk = item.r5_risk_score >= 7.0;

  return (
    <Link
      href={`/marketplace/${marketplaceSlug}/${item.slug}`}
      className="group block"
      data-testid="skill-tile"
      data-skill-id={item.id}
    >
      <Card className="hover:shadow-lg transition-shadow hover:border-[#E2754D]/40 h-full">
        <CardContent className="px-5">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <div className="font-semibold text-[#0E0E0C] group-hover:text-[#E2754D] transition-colors">
                {item.name}
              </div>
              {item.category && (
                <div className="text-xs uppercase tracking-wider text-[#717069] mt-0.5">
                  {item.category}
                </div>
              )}
            </div>
            <TierBadge tier={item.tier as QualityTier} />
          </div>

          <div className="flex items-center justify-between gap-4 my-3">
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-3xl font-bold text-[#0E0E0C]">{item.score}</span>
              <span className="text-sm text-[#717069]">/100</span>
            </div>
            {showRisk && (
              <div
                className={`text-xs px-2 py-1 rounded-sm font-mono ${
                  isHighRisk
                    ? "bg-[#9e3b3b]/10 text-[#9e3b3b] border border-[#9e3b3b]/30"
                    : "bg-[#535862]/8 text-[#535862] border border-[#535862]/20"
                }`}
                title={`R5 risk score (0-10, higher = riskier)`}
              >
                R5 {item.r5_risk_score.toFixed(1)}
              </div>
            )}
          </div>

          {/* Mini radar */}
          <div className="-mx-2 my-1">
            <RadarWithNA axes={item.axes} naAxes={["latency"]} height={140} />
          </div>

          <div className="flex items-center justify-between text-xs text-[#717069] mt-2 pt-2 border-t border-[#0E0E0C]/5">
            <span>Last eval: {lastEval}</span>
            {item.delta_vs_baseline != null && (
              <span
                className={item.delta_vs_baseline >= 0 ? "text-[#0E0E0C]" : "text-[#9e3b3b]"}
              >
                {item.delta_vs_baseline >= 0 ? "+" : ""}
                {item.delta_vs_baseline.toFixed(1)} vs baseline
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
