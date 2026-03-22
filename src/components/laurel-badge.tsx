import { type QualityTier, type TrustLevel } from "@/lib/mock-data";
import Image from "next/image";

const LEVEL_COLORS: Record<string, string> = {
  verified: "#C38133",
  certified: "#A8A8A8",
  audited: "#D4AF37",
};

const TIER_FALLBACK_LEVEL: Record<string, TrustLevel> = {
  expert: "audited",
  proficient: "certified",
  basic: "verified",
  failed: "verified",
};

const WREATH_IMAGES: Record<string, string> = {
  verified: "/wreaths/verified.png",
  certified: "/wreaths/certified.png",
  audited: "/wreaths/audited.png",
};

interface LaurelBadgeProps {
  score: number;
  tier: QualityTier;
  trustLevel?: TrustLevel;
  size?: "sm" | "md" | "lg";
}

export function LaurelBadge({ score, tier, trustLevel, size = "md" }: LaurelBadgeProps) {
  // Wreath always matches score quality: expert=gold, proficient=silver, basic=bronze
  const level = TIER_FALLBACK_LEVEL[tier] || "verified";
  const color = LEVEL_COLORS[level];
  const wreathSrc = WREATH_IMAGES[level];

  const scale = size === "sm" ? 0.6 : size === "lg" ? 1.15 : 1;
  const h = Math.round(120 * scale);
  const wreathW = Math.round(120 * scale);

  return (
    <div
      className="inline-flex items-stretch rounded-sm overflow-hidden"
      style={{
        backgroundColor: "#0E0E0C",
        border: `1px solid ${color}25`,
        height: `${h}px`,
      }}
    >
      {/* Left accent stripe */}
      <div className="w-1 shrink-0" style={{ backgroundColor: color, opacity: 0.6 }} />

      {/* Wreath image — includes level text + LAUREUM.AI */}
      <div className="shrink-0 flex items-center justify-center" style={{ width: `${wreathW}px` }}>
        <Image
          src={wreathSrc}
          alt={level.toUpperCase()}
          width={wreathW}
          height={h}
          className="w-full h-full object-contain"
          unoptimized
        />
      </div>

      {/* Divider */}
      <div className="w-px shrink-0" style={{ backgroundColor: `${color}20` }} />

      {/* Score + tier info */}
      <div className="flex flex-col justify-center pl-5 pr-8">
        <span
          className="font-mono font-black tabular-nums"
          style={{
            color,
            fontSize: `${Math.round(36 * scale)}px`,
            lineHeight: 1,
          }}
        >
          {score}
        </span>
        <span
          className="font-medium uppercase tracking-wider mt-1"
          style={{
            color: "#535862",
            fontSize: `${Math.round(10 * scale)}px`,
            letterSpacing: "0.12em",
          }}
        >
          {tier} tier
        </span>
      </div>
    </div>
  );
}
