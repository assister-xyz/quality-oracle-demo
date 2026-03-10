import { Shield, ShieldCheck, ShieldPlus } from "lucide-react";
import { TRUST_LEVEL_CONFIG, type TrustLevel } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const ICONS: Record<TrustLevel, React.ElementType> = {
  verified: Shield,
  certified: ShieldCheck,
  audited: ShieldPlus,
};

interface TrustLevelBadgeProps {
  level: TrustLevel;
  className?: string;
  showIcon?: boolean;
}

export function TrustLevelBadge({ level, className, showIcon = true }: TrustLevelBadgeProps) {
  const config = TRUST_LEVEL_CONFIG[level];
  const Icon = ICONS[level];
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
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </span>
  );
}
