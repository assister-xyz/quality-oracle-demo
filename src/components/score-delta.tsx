"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { RadarWithNA } from "@/components/radar-with-na";

interface ScoreDeltaProps {
  /** Skill-activated axes (foreground). */
  activatedAxes: Record<string, number>;
  /** Baseline (no-skill) axes (background dashed). */
  baselineAxes?: Record<string, number>;
  /** N/A axes greyed in radar. */
  naAxes?: string[];
  /** Score delta vs baseline (positive = improvement). */
  delta?: number | null;
  baselineScore?: number | null;
  activatedScore: number;
}

/**
 * Differential overlay: renders two overlapping radars (skill activated vs
 * baseline) with the +Δ callout on each axis where the gap exceeds 5 pts.
 */
export function ScoreDelta({
  activatedAxes,
  baselineAxes,
  naAxes = [],
  delta,
  baselineScore,
  activatedScore,
}: ScoreDeltaProps) {
  const showDelta = baselineAxes && delta != null;
  const trend = delta == null ? "flat" : delta > 0 ? "up" : delta < 0 ? "down" : "flat";

  const axisDeltas = baselineAxes
    ? Object.entries(activatedAxes).map(([key, v]) => ({
        key,
        delta: v - (baselineAxes[key] ?? 0),
      }))
    : [];

  const significant = axisDeltas.filter((a) => Math.abs(a.delta) >= 5);

  return (
    <div className="bg-white border border-[#0E0E0C]/8 rounded-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-display font-600 uppercase tracking-wider text-[#717069]">
            Differential
          </h3>
          <p className="text-xs text-[#717069] mt-1">
            Activated skill vs baseline (no-skill)
          </p>
        </div>
        {showDelta && delta != null && (
          <DeltaBadge delta={delta} trend={trend} baseline={baselineScore} activated={activatedScore} />
        )}
      </div>

      <RadarWithNA
        axes={activatedAxes}
        naAxes={naAxes}
        compareAxes={baselineAxes}
        height={280}
      />

      {significant.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {significant.map((d) => (
            <span
              key={d.key}
              className={`px-2 py-1 rounded-sm font-mono ${
                d.delta > 0
                  ? "bg-[#E2754D]/10 text-[#E2754D] border border-[#E2754D]/30"
                  : "bg-[#9e3b3b]/10 text-[#9e3b3b] border border-[#9e3b3b]/30"
              }`}
            >
              {d.key} {d.delta > 0 ? "+" : ""}
              {d.delta.toFixed(1)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function DeltaBadge({
  delta,
  trend,
  baseline,
  activated,
}: {
  delta: number;
  trend: "up" | "down" | "flat";
  baseline?: number | null;
  activated: number;
}) {
  const Icon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const tone =
    trend === "up"
      ? "text-[#E2754D] border-[#E2754D]/30 bg-[#E2754D]/8"
      : trend === "down"
      ? "text-[#9e3b3b] border-[#9e3b3b]/30 bg-[#9e3b3b]/8"
      : "text-[#535862] border-[#535862]/30 bg-[#535862]/8";
  return (
    <div className={`px-3 py-1.5 border rounded-sm font-mono text-sm flex items-center gap-2 ${tone}`}>
      <Icon className="h-4 w-4" />
      <span>
        {delta > 0 ? "+" : ""}
        {delta.toFixed(1)}
      </span>
      {baseline != null && (
        <span className="text-xs opacity-70">
          ({baseline.toFixed(0)} → {activated})
        </span>
      )}
    </div>
  );
}
