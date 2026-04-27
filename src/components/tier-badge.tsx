import { TIER_CONFIG, type QualityTier } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface TierBadgeProps {
  tier: QualityTier | string;
  className?: string;
}

// Defensive fallback for unrecognised tier values. Backend has been seen
// returning eval_mode strings (verified / certified / audited) in the
// tier field for some skill evals — without this guard the static
// prerender of /report/april-2026 crashed with "Cannot read properties
// of undefined (reading 'bg')". Render as neutral pill instead.
const FALLBACK_CONFIG = {
  bg: "rgba(83,88,98,0.08)",
  border: "rgba(83,88,98,0.2)",
  color: "#535862",
  label: "—",
};

export function TierBadge({ tier, className }: TierBadgeProps) {
  const known = TIER_CONFIG[tier as QualityTier];
  const config = known ?? {
    ...FALLBACK_CONFIG,
    label: typeof tier === "string" && tier.length ? tier : "—",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider border",
        className
      )}
      style={{
        backgroundColor: config.bg,
        borderColor: config.border,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  );
}
