import { type QualityTier, type TrustLevel } from "@/lib/mock-data";

const TIER_COLORS: Record<string, { primary: string; secondary: string; bg: string }> = {
  expert: { primary: "#FFD700", secondary: "#B8860B", bg: "#FFD700" },
  proficient: { primary: "#C0C0C0", secondary: "#717069", bg: "#C0C0C0" },
  basic: { primary: "#C38133", secondary: "#8B5E14", bg: "#C38133" },
  failed: { primary: "#717069", secondary: "#535862", bg: "#717069" },
};

const LEVEL_LABELS: Record<TrustLevel, string> = {
  verified: "VERIFIED",
  certified: "CERTIFIED",
  audited: "AUDITED",
};

interface LaurelBadgeProps {
  score: number;
  tier: QualityTier;
  trustLevel?: TrustLevel;
  size?: "sm" | "md" | "lg";
}

export function LaurelBadge({ score, tier, trustLevel, size = "md" }: LaurelBadgeProps) {
  const colors = TIER_COLORS[tier] || TIER_COLORS.basic;
  const label = trustLevel ? LEVEL_LABELS[trustLevel] : tier.toUpperCase();

  const dimensions = {
    sm: { width: 160, height: 52, fontSize: 14, labelSize: 7, brandSize: 6 },
    md: { width: 240, height: 72, fontSize: 20, labelSize: 9, brandSize: 7 },
    lg: { width: 300, height: 88, fontSize: 26, labelSize: 11, brandSize: 9 },
  };

  const d = dimensions[size];

  return (
    <svg
      width={d.width}
      height={d.height}
      viewBox={`0 0 ${d.width} ${d.height}`}
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {/* Background */}
      <rect width={d.width} height={d.height} rx="8" fill="#0E0E0C" />

      {/* Left laurel branch */}
      <g transform={`translate(${d.height * 0.45}, ${d.height * 0.5})`} opacity="0.9">
        <path
          d={`M0 ${d.height * 0.3}c0-${d.height * 0.15} ${d.height * 0.06}-${d.height * 0.25} ${d.height * 0.15}-${d.height * 0.3}`}
          stroke={colors.primary}
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
        <ellipse cx={-3} cy={d.height * 0.12} rx="4" ry="7" fill={colors.primary} opacity="0.7" transform="rotate(-20)" />
        <ellipse cx={-1} cy={-d.height * 0.02} rx="3.5" ry="6" fill={colors.primary} opacity="0.6" transform="rotate(-35)" />
        <ellipse cx={2} cy={-d.height * 0.12} rx="3" ry="5.5" fill={colors.primary} opacity="0.5" transform="rotate(-50)" />
      </g>

      {/* Right laurel branch */}
      <g transform={`translate(${d.height * 0.45}, ${d.height * 0.5}) scale(-1,1)`} opacity="0.9">
        <path
          d={`M0 ${d.height * 0.3}c0-${d.height * 0.15} ${d.height * 0.06}-${d.height * 0.25} ${d.height * 0.15}-${d.height * 0.3}`}
          stroke={colors.primary}
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
        <ellipse cx={-3} cy={d.height * 0.12} rx="4" ry="7" fill={colors.primary} opacity="0.7" transform="rotate(-20)" />
        <ellipse cx={-1} cy={-d.height * 0.02} rx="3.5" ry="6" fill={colors.primary} opacity="0.6" transform="rotate(-35)" />
        <ellipse cx={2} cy={-d.height * 0.12} rx="3" ry="5.5" fill={colors.primary} opacity="0.5" transform="rotate(-50)" />
      </g>

      {/* Score circle */}
      <circle
        cx={d.height * 0.45}
        cy={d.height * 0.48}
        r={d.height * 0.26}
        fill="none"
        stroke={colors.primary}
        strokeWidth="2"
      />
      <text
        x={d.height * 0.45}
        y={d.height * 0.55}
        textAnchor="middle"
        fill={colors.primary}
        fontSize={d.fontSize}
        fontWeight="700"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {score}
      </text>

      {/* Label text */}
      <text
        x={d.height * 0.95}
        y={d.height * 0.38}
        fill="white"
        fontSize={d.fontSize * 0.7}
        fontWeight="700"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.05em"
      >
        {label}
      </text>

      {/* Brand */}
      <text
        x={d.height * 0.95}
        y={d.height * 0.58}
        fill={colors.primary}
        fontSize={d.brandSize}
        fontWeight="600"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.15em"
        opacity="0.8"
      >
        LAUREUM.AI
      </text>

      {/* Tier label */}
      <text
        x={d.height * 0.95}
        y={d.height * 0.76}
        fill="#717069"
        fontSize={d.brandSize}
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.08em"
      >
        {score}/100 {tier.toUpperCase()}
      </text>
    </svg>
  );
}
