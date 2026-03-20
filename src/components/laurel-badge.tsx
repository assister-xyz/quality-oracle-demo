import { type QualityTier, type TrustLevel } from "@/lib/mock-data";

const TIER_COLORS: Record<string, string> = {
  expert: "#FFD700",
  proficient: "#C0C0C0",
  basic: "#C38133",
  failed: "#717069",
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
  const color = TIER_COLORS[tier] || TIER_COLORS.basic;
  const label = trustLevel ? LEVEL_LABELS[trustLevel] : tier.toUpperCase();

  const scale = size === "sm" ? 0.65 : size === "lg" ? 1.2 : 1;
  const w = Math.round(280 * scale);
  const h = Math.round(80 * scale);

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 280 80"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {/* Background */}
      <rect width="280" height="80" rx="10" fill="#0E0E0C" />

      {/* Left laurel branch */}
      <g transform="translate(40, 40)">
        <path d="M-2 18 C-4 12, -8 8, -14 4" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <ellipse cx="-6" cy="14" rx="3" ry="6" transform="rotate(-25 -6 14)" fill={color} opacity="0.8" />
        <ellipse cx="-10" cy="8" rx="2.5" ry="5.5" transform="rotate(-40 -10 8)" fill={color} opacity="0.65" />
        <ellipse cx="-13" cy="2" rx="2" ry="5" transform="rotate(-55 -13 2)" fill={color} opacity="0.5" />
        <ellipse cx="-14" cy="-5" rx="1.8" ry="4" transform="rotate(-65 -14 -5)" fill={color} opacity="0.4" />
      </g>

      {/* Right laurel branch */}
      <g transform="translate(40, 40)">
        <path d="M2 18 C4 12, 8 8, 14 4" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <ellipse cx="6" cy="14" rx="3" ry="6" transform="rotate(25 6 14)" fill={color} opacity="0.8" />
        <ellipse cx="10" cy="8" rx="2.5" ry="5.5" transform="rotate(40 10 8)" fill={color} opacity="0.65" />
        <ellipse cx="13" cy="2" rx="2" ry="5" transform="rotate(55 13 2)" fill={color} opacity="0.5" />
        <ellipse cx="14" cy="-5" rx="1.8" ry="4" transform="rotate(65 14 -5)" fill={color} opacity="0.4" />
      </g>

      {/* Score circle */}
      <circle cx="40" cy="38" r="19" fill="none" stroke={color} strokeWidth="2" />
      <text
        x="40" y="44"
        textAnchor="middle"
        fill={color}
        fontSize="18"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {score}
      </text>

      {/* Divider line */}
      <line x1="72" y1="16" x2="72" y2="64" stroke={color} strokeWidth="1" opacity="0.2" />

      {/* Label */}
      <text
        x="84" y="32"
        fill="white"
        fontSize="16"
        fontWeight="700"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.08em"
      >
        {label}
      </text>

      {/* Brand */}
      <text
        x="84" y="48"
        fill={color}
        fontSize="9"
        fontWeight="600"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.18em"
        opacity="0.7"
      >
        LAUREUM.AI
      </text>

      {/* Score / Tier */}
      <text
        x="84" y="62"
        fill="#535862"
        fontSize="9"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.06em"
      >
        {score}/100 &middot; {tier.toUpperCase()}
      </text>
    </svg>
  );
}
