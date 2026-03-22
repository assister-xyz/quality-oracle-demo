import { TRUST_LEVEL_CONFIG, type TrustLevel } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface TrustLevelBadgeProps {
  level: TrustLevel;
  className?: string;
  showIcon?: boolean;
}

export function TrustLevelBadge({ level, className, showIcon = true }: TrustLevelBadgeProps) {
  const config = TRUST_LEVEL_CONFIG[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider border border-[#E2754D]/20 bg-[#E2754D]/5 text-[#E2754D]",
        className
      )}
      title={config.description}
    >
      {config.label}
    </span>
  );
}
