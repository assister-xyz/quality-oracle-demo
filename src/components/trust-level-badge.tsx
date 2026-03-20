import { TRUST_LEVEL_CONFIG, type TrustLevel } from "@/lib/mock-data";
import { LaurelIcon } from "@/components/laurel-icon";
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
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border",
        className
      )}
      style={{
        backgroundColor: config.bg,
        borderColor: config.border,
        color: config.color,
      }}
      title={config.description}
    >
      {showIcon && <LaurelIcon tier={level} size={14} />}
      {config.label}
    </span>
  );
}
