import { type QualityTier, type TrustLevel } from "@/lib/mock-data";
import Image from "next/image";

/* Color mapping: Verified=Bronze, Certified=Silver, Audited=Gold */
const LEVEL_COLORS: Record<string, { primary: string; secondary: string }> = {
  verified: { primary: "#C38133", secondary: "#8B5E2B" },
  certified: { primary: "#A8A8A8", secondary: "#707070" },
  audited: { primary: "#D4AF37", secondary: "#9A7B2C" },
};

const TIER_FALLBACK: Record<string, { primary: string; secondary: string }> = {
  expert: { primary: "#D4AF37", secondary: "#9A7B2C" },
  proficient: { primary: "#A8A8A8", secondary: "#707070" },
  basic: { primary: "#C38133", secondary: "#8B5E2B" },
  failed: { primary: "#535862", secondary: "#3a3d44" },
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
  const height = Math.round(140 * scale);
  const wreathSize = Math.round(120 * scale);

  return (
    <div
      className="inline-flex items-center rounded-sm overflow-hidden"
      style={{
        backgroundColor: "#0E0E0C",
        border: `1px solid ${colors.primary}30`,
        height: `${height}px`,
      }}
    >
      {/* Left accent stripe */}
      <div
        className="w-1 self-stretch shrink-0"
        style={{ backgroundColor: colors.primary, opacity: 0.7 }}
      />

      {/* Wreath + Score area */}
      <div className="relative flex items-center justify-center shrink-0" style={{ width: `${wreathSize}px`, height: `${height}px` }}>
        {/* Real wreath image */}
        <Image
          src={wreathSrc}
          alt=""
          width={wreathSize}
          height={wreathSize}
          className="absolute inset-0 w-full h-full object-contain opacity-60"
          style={{ filter: "brightness(0.9)" }}
          unoptimized
        />
        {/* Score overlay */}
        <span
          className="relative z-10 font-mono font-black tabular-nums"
          style={{
            color: colors.primary,
            fontSize: `${Math.round(32 * scale)}px`,
            textShadow: `0 0 20px ${colors.primary}40`,
          }}
        >
          {score}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px self-stretch mx-1" style={{ backgroundColor: `${colors.primary}25` }} />

      {/* Text section */}
      <div className="pr-6 pl-2 py-3 flex flex-col justify-center min-w-0">
        <span
          className="font-bold tracking-wider"
          style={{
            color: "#F5F5F3",
            fontSize: `${Math.round(18 * scale)}px`,
            letterSpacing: "0.06em",
          }}
        >
          {label}
        </span>
        <span
          className="font-mono font-semibold"
          style={{
            color: colors.primary,
            fontSize: `${Math.round(12 * scale)}px`,
            letterSpacing: "0.06em",
            marginTop: "2px",
          }}
        >
          {score}/100 · {tier.toUpperCase()} TIER
        </span>
        <span
          className="font-semibold"
          style={{
            color: "#535862",
            fontSize: `${Math.round(9 * scale)}px`,
            letterSpacing: "0.2em",
            marginTop: "4px",
          }}
        >
          VERIFIED BY LAUREUM.AI
        </span>
      </div>
    </div>
  );
}
