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

  const scale = size === "sm" ? 0.65 : size === "lg" ? 1.3 : 1;
  const w = Math.round(300 * scale);
  const h = Math.round(88 * scale);

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 300 88"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {/* Background with subtle border */}
      <rect width="300" height="88" rx="4" fill="#0E0E0C" />
      <rect width="300" height="88" rx="4" fill="none" stroke={color} strokeWidth="0.5" opacity="0.2" />

      {/* Left laurel branch */}
      <g transform="translate(44, 44)">
        <path d="M-1 20 C-3 14, -7 9, -13 5" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <ellipse cx="-5" cy="16" rx="2.5" ry="5.5" transform="rotate(-20 -5 16)" fill={color} opacity="0.85" />
        <ellipse cx="-8" cy="10" rx="2.2" ry="5" transform="rotate(-35 -8 10)" fill={color} opacity="0.7" />
        <ellipse cx="-11" cy="4" rx="2" ry="4.5" transform="rotate(-50 -11 4)" fill={color} opacity="0.55" />
        <ellipse cx="-13" cy="-3" rx="1.6" ry="3.8" transform="rotate(-62 -13 -3)" fill={color} opacity="0.4" />
      </g>

      {/* Right laurel branch */}
      <g transform="translate(44, 44)">
        <path d="M1 20 C3 14, 7 9, 13 5" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <ellipse cx="5" cy="16" rx="2.5" ry="5.5" transform="rotate(20 5 16)" fill={color} opacity="0.85" />
        <ellipse cx="8" cy="10" rx="2.2" ry="5" transform="rotate(35 8 10)" fill={color} opacity="0.7" />
        <ellipse cx="11" cy="4" rx="2" ry="4.5" transform="rotate(50 11 4)" fill={color} opacity="0.55" />
        <ellipse cx="13" cy="-3" rx="1.6" ry="3.8" transform="rotate(62 13 -3)" fill={color} opacity="0.4" />
      </g>

      {/* Score circle with ring */}
      <circle cx="44" cy="42" r="20" fill="none" stroke={color} strokeWidth="1.5" opacity="0.3" />
      <circle cx="44" cy="42" r="16" fill="none" stroke={color} strokeWidth="2" />
      <text
        x="44" y="48"
        textAnchor="middle"
        fill={color}
        fontSize="17"
        fontWeight="800"
        fontFamily="ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace"
      >
        {score}
      </text>

      {/* Divider */}
      <line x1="78" y1="16" x2="78" y2="72" stroke={color} strokeWidth="0.5" opacity="0.15" />

      {/* Label — trust level or tier */}
      <text
        x="92" y="34"
        fill="#F5F5F3"
        fontSize="15"
        fontWeight="700"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.1em"
      >
        {label}
      </text>

      {/* Brand */}
      <text
        x="92" y="50"
        fill={color}
        fontSize="8.5"
        fontWeight="600"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.2em"
        opacity="0.6"
      >
        LAUREUM.AI
      </text>

      {/* Score / Tier detail */}
      <text
        x="92" y="66"
        fill="#535862"
        fontSize="9"
        fontFamily="ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace"
        letterSpacing="0.04em"
      >
        {score}/100 · {tier.toUpperCase()}
      </text>
    </svg>
  );
}
