import { type QualityTier, type TrustLevel } from "@/lib/mock-data";

/* Color mapping aligned with wreath reference images:
   Verified = Bronze, Certified = Silver, Audited = Gold */
const LEVEL_COLORS: Record<string, { primary: string; secondary: string; glow: string }> = {
  verified: { primary: "#C38133", secondary: "#8B5E2B", glow: "rgba(195,129,51,0.15)" },
  certified: { primary: "#A8A8A8", secondary: "#707070", glow: "rgba(168,168,168,0.12)" },
  audited: { primary: "#D4AF37", secondary: "#9A7B2C", glow: "rgba(212,175,55,0.15)" },
};

const TIER_FALLBACK: Record<string, { primary: string; secondary: string; glow: string }> = {
  expert: { primary: "#D4AF37", secondary: "#9A7B2C", glow: "rgba(212,175,55,0.15)" },
  proficient: { primary: "#A8A8A8", secondary: "#707070", glow: "rgba(168,168,168,0.12)" },
  basic: { primary: "#C38133", secondary: "#8B5E2B", glow: "rgba(195,129,51,0.15)" },
  failed: { primary: "#535862", secondary: "#3a3d44", glow: "rgba(83,88,98,0.1)" },
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
  const colors = trustLevel ? LEVEL_COLORS[trustLevel] : TIER_FALLBACK[tier] || TIER_FALLBACK.basic;
  const label = trustLevel ? LEVEL_LABELS[trustLevel] : tier.toUpperCase();

  const scale = size === "sm" ? 0.7 : size === "lg" ? 1.4 : 1;
  const w = Math.round(420 * scale);
  const h = Math.round(120 * scale);

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 420 120"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <defs>
        <radialGradient id={`glow-${tier}`} cx="15%" cy="50%" r="40%">
          <stop offset="0%" stopColor={colors.glow} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      {/* Background with subtle gradient */}
      <rect width="420" height="120" rx="4" fill="#0E0E0C" />
      <rect width="420" height="120" rx="4" fill="none" stroke={colors.primary} strokeWidth="1" opacity="0.25" />

      {/* Left accent stripe */}
      <rect x="0" y="0" width="4" height="120" rx="2" fill={colors.primary} opacity="0.7" />

      {/* Glow behind score */}
      <rect x="0" y="0" width="420" height="120" rx="4" fill={`url(#glow-${tier})`} />

      {/* Score wreath area — larger wreath behind score */}
      <g transform="translate(58, 60)">
        {/* Left branch */}
        <path d="M-2 28 C-8 20, -10 8, -4 -4" stroke={colors.primary} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />
        <ellipse cx="-8" cy="22" rx="5" ry="2.5" transform="rotate(-15 -8 22)" fill={colors.primary} opacity="0.5" />
        <ellipse cx="-10" cy="14" rx="4.5" ry="2.2" transform="rotate(-30 -10 14)" fill={colors.primary} opacity="0.4" />
        <ellipse cx="-9" cy="6" rx="4" ry="2" transform="rotate(-45 -9 6)" fill={colors.primary} opacity="0.3" />
        <ellipse cx="-6" cy="-1" rx="3.5" ry="1.8" transform="rotate(-60 -6 -1)" fill={colors.primary} opacity="0.2" />

        {/* Right branch */}
        <path d="M2 28 C8 20, 10 8, 4 -4" stroke={colors.primary} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />
        <ellipse cx="8" cy="22" rx="5" ry="2.5" transform="rotate(15 8 22)" fill={colors.primary} opacity="0.5" />
        <ellipse cx="10" cy="14" rx="4.5" ry="2.2" transform="rotate(30 10 14)" fill={colors.primary} opacity="0.4" />
        <ellipse cx="9" cy="6" rx="4" ry="2" transform="rotate(45 9 6)" fill={colors.primary} opacity="0.3" />
        <ellipse cx="6" cy="-1" rx="3.5" ry="1.8" transform="rotate(60 6 -1)" fill={colors.primary} opacity="0.2" />
      </g>

      {/* Score — large, bold, tier-colored */}
      <text
        x="58" y="58"
        textAnchor="middle"
        dominantBaseline="central"
        fill={colors.primary}
        fontSize="36"
        fontWeight="900"
        fontFamily="ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace"
      >
        {score}
      </text>

      {/* Vertical divider */}
      <line x1="110" y1="24" x2="110" y2="96" stroke={colors.primary} strokeWidth="1" opacity="0.2" />

      {/* Label — trust level or tier */}
      <text
        x="128" y="42"
        fill="#F5F5F3"
        fontSize="22"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.06em"
      >
        {label}
      </text>

      {/* Score / Tier detail */}
      <text
        x="128" y="66"
        fill={colors.primary}
        fontSize="13"
        fontWeight="600"
        fontFamily="ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace"
        letterSpacing="0.06em"
      >
        {score}/100  ·  {tier.toUpperCase()} TIER
      </text>

      {/* Brand */}
      <text
        x="128" y="90"
        fill="#535862"
        fontSize="10"
        fontWeight="600"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.2em"
      >
        VERIFIED BY LAUREUM.AI
      </text>

      {/* Right — laurel mark (larger, more visible) */}
      <g transform="translate(382, 60)" opacity="0.2">
        <path d="M-10 18 C-14 10, -12 0, -4 -8" stroke={colors.primary} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M10 18 C14 10, 12 0, 4 -8" stroke={colors.primary} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <ellipse cx="-8" cy="12" rx="4" ry="2" transform="rotate(-20 -8 12)" fill={colors.primary} />
        <ellipse cx="-10" cy="4" rx="3.5" ry="1.8" transform="rotate(-40 -10 4)" fill={colors.primary} />
        <ellipse cx="8" cy="12" rx="4" ry="2" transform="rotate(20 8 12)" fill={colors.primary} />
        <ellipse cx="10" cy="4" rx="3.5" ry="1.8" transform="rotate(40 10 4)" fill={colors.primary} />
        <circle cx="0" cy="-10" r="2.5" fill={colors.primary} />
      </g>
    </svg>
  );
}
