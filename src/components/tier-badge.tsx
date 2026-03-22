import { TIER_CONFIG, type QualityTier } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface TierBadgeProps {
  tier: QualityTier;
  className?: string;
}

export function TierBadge({ tier, className }: TierBadgeProps) {
  const config = TIER_CONFIG[tier];
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
