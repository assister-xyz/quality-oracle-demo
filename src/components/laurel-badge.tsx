import { type QualityTier, type TrustLevel } from "@/lib/mock-data";
import Image from "next/image";

const LEVEL_COLORS: Record<string, { primary: string }> = {
  verified: { primary: "#C38133" },
  certified: { primary: "#A8A8A8" },
  audited: { primary: "#D4AF37" },
};

const TIER_FALLBACK: Record<string, { primary: string }> = {
  expert: { primary: "#D4AF37" },
  proficient: { primary: "#A8A8A8" },
  basic: { primary: "#C38133" },
  failed: { primary: "#535862" },
};

const LEVEL_LABELS: Record<TrustLevel, string> = {
  verified: "VERIFIED",
  certified: "CERTIFIED",
  audited: "AUDITED",
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
  const colors = trustLevel ? LEVEL_COLORS[trustLevel] : TIER_FALLBACK[tier] || TIER_FALLBACK.basic;
  const label = trustLevel ? LEVEL_LABELS[trustLevel] : tier.toUpperCase();
  const wreathSrc = trustLevel ? WREATH_IMAGES[trustLevel] : WREATH_IMAGES.verified;

  const scale = size === "sm" ? 0.65 : size === "lg" ? 1.2 : 1;
  const h = Math.round(130 * scale);
  const wreathW = Math.round(130 * scale);

  return (
    <div
      className="inline-flex items-stretch rounded-sm overflow-hidden"
      style={{
        backgroundColor: "#0E0E0C",
        border: `1px solid ${colors.primary}25`,
        height: `${h}px`,
      }}
    >
      {/* Left accent stripe */}
      <div
        className="w-1 shrink-0"
        style={{ backgroundColor: colors.primary, opacity: 0.6 }}
      />

      {/* Wreath image — clean, no score overlay */}
      <div className="shrink-0 flex items-center justify-center" style={{ width: `${wreathW}px` }}>
        <Image
          src={wreathSrc}
          alt={label}
          width={wreathW}
          height={h}
          className="w-full h-full object-contain"
          style={{ opacity: 0.85 }}
          unoptimized
        />
      </div>

      {/* Divider */}
      <div className="w-px shrink-0" style={{ backgroundColor: `${colors.primary}20` }} />

      {/* Text section */}
      <div className="flex flex-col justify-center pl-5 pr-8">
        <span
          className="font-display font-800 tracking-wider"
          style={{
            color: "#F5F5F3",
            fontSize: `${Math.round(20 * scale)}px`,
            letterSpacing: "0.08em",
          }}
        >
          {label}
        </span>
        <div className="flex items-baseline gap-3 mt-1">
          <span
            className="font-mono font-bold"
            style={{
              color: colors.primary,
              fontSize: `${Math.round(22 * scale)}px`,
            }}
          >
            {score}
          </span>
          <span
            className="font-medium uppercase tracking-wider"
            style={{
              color: "#535862",
              fontSize: `${Math.round(10 * scale)}px`,
              letterSpacing: "0.12em",
            }}
          >
            {tier} tier
          </span>
        </div>
        <span
          className="mt-2 font-medium"
          style={{
            color: "#3a3d44",
            fontSize: `${Math.round(8 * scale)}px`,
            letterSpacing: "0.2em",
          }}
        >
          LAUREUM.AI
        </span>
      </div>
    </div>
  );
}
