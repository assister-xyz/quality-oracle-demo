import { type QualityTier, type TrustLevel } from "@/lib/mock-data";

const TIER_COLORS: Record<string, { primary: string; secondary: string }> = {
  expert: { primary: "#FFD700", secondary: "#B8860B" },
  proficient: { primary: "#C0C0C0", secondary: "#808080" },
  basic: { primary: "#C38133", secondary: "#8B5E2B" },
  failed: { primary: "#717069", secondary: "#535862" },
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

  const scale = size === "sm" ? 0.7 : size === "lg" ? 1.4 : 1;
  const w = Math.round(360 * scale);
  const h = Math.round(100 * scale);

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 360 100"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {/* Background */}
      <rect width="360" height="100" rx="3" fill="#0E0E0C" />
      <rect width="360" height="100" rx="3" fill="none" stroke={colors.primary} strokeWidth="0.5" opacity="0.15" />

      {/* Left accent stripe */}
      <rect x="0" y="0" width="3" height="100" rx="1.5" fill={colors.primary} opacity="0.6" />

      {/* Laurel wreath — left branch */}
      <g transform="translate(46, 50)">
        <path d="M0 22 C-2 16, -4 8, -2 0" stroke={colors.primary} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
        <ellipse cx="-5" cy="18" rx="4" ry="2" transform="rotate(-20 -5 18)" fill={colors.primary} opacity="0.7" />
        <ellipse cx="-6" cy="11" rx="3.5" ry="1.8" transform="rotate(-35 -6 11)" fill={colors.primary} opacity="0.55" />
        <ellipse cx="-5" cy="4" rx="3" ry="1.5" transform="rotate(-50 -5 4)" fill={colors.primary} opacity="0.4" />
      </g>

      {/* Laurel wreath — right branch */}
      <g transform="translate(46, 50)">
        <path d="M0 22 C2 16, 4 8, 2 0" stroke={colors.primary} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
        <ellipse cx="5" cy="18" rx="4" ry="2" transform="rotate(20 5 18)" fill={colors.primary} opacity="0.7" />
        <ellipse cx="6" cy="11" rx="3.5" ry="1.8" transform="rotate(35 6 11)" fill={colors.primary} opacity="0.55" />
        <ellipse cx="5" cy="4" rx="3" ry="1.5" transform="rotate(50 5 4)" fill={colors.primary} opacity="0.4" />
      </g>

      {/* Score */}
      <text
        x="46" y="52"
        textAnchor="middle"
        dominantBaseline="central"
        fill={colors.primary}
        fontSize="24"
        fontWeight="800"
        fontFamily="ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace"
      >
        {score}
      </text>

      {/* Divider */}
      <line x1="88" y1="20" x2="88" y2="80" stroke={colors.primary} strokeWidth="0.5" opacity="0.15" />

      {/* Tier label */}
      <text
        x="104" y="36"
        fill="#F5F5F3"
        fontSize="18"
        fontWeight="700"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.08em"
      >
        {label}
      </text>

      {/* Score detail */}
      <text
        x="104" y="55"
        fill={colors.primary}
        fontSize="11"
        fontWeight="500"
        fontFamily="ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace"
        letterSpacing="0.04em"
      >
        {score}/100 · {tier.toUpperCase()} TIER
      </text>

      {/* Brand */}
      <text
        x="104" y="74"
        fill="#535862"
        fontSize="9"
        fontWeight="600"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.2em"
      >
        VERIFIED BY LAUREUM.AI
      </text>

      {/* Right side — small laurel mark */}
      <g transform="translate(330, 50)" opacity="0.15">
        <path d="M-6 10 C-6 4, -3 -2, 0 -6" stroke={colors.primary} strokeWidth="1.5" fill="none" />
        <path d="M6 10 C6 4, 3 -2, 0 -6" stroke={colors.primary} strokeWidth="1.5" fill="none" />
        <circle cx="0" cy="-8" r="2" fill={colors.primary} />
      </g>
    </svg>
  );
}
