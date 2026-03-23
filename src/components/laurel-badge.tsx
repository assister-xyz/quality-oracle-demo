import { type QualityTier, type TrustLevel } from "@/lib/mock-data";

/*
 * Laureum Badge — pure SVG, Apple-quality design.
 *
 * Design principles (from OpenAI Frontend Skill + brand book):
 * - Single wreath SVG reused from hero, filled with tier color
 * - One accent color per tier: bronze/silver/gold
 * - Syne-style display font for labels, monospace for scores
 * - Dark bg, minimal elements, generous whitespace
 * - No PNG dependencies — pure SVG, scales to any size
 * - Consistent with landing page brand language
 */

const TIER_LEVEL: Record<string, TrustLevel> = {
  expert: "audited",
  proficient: "certified",
  basic: "verified",
  failed: "verified",
};

const LEVEL_CONFIG: Record<string, { color: string; label: string }> = {
  verified: { color: "#C38133", label: "VERIFIED" },
  certified: { color: "#A8A8A8", label: "CERTIFIED" },
  audited: { color: "#D4AF37", label: "AUDITED" },
};

/* Simplified wreath for badge context — fewer leaves, bolder, reads well at small size */
function BadgeWreath({ color }: { color: string }) {
  return (
    <>
      {/* Left stem */}
      <path d="M82 178 C40 155, 22 110, 55 42" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.2" />
      {/* Left outer — 6 bolder leaves */}
      <path d="M78 172 C66 167, 52 175, 48 182 C58 181, 72 175, 78 172Z" fill={color} opacity="0.9" />
      <path d="M64 155 C50 154, 34 164, 30 174 C42 170, 58 159, 64 155Z" fill={color} opacity="0.8" />
      <path d="M50 136 C36 138, 20 150, 18 160 C30 154, 44 142, 50 136Z" fill={color} opacity="0.7" />
      <path d="M40 116 C28 122, 16 138, 16 148 C26 138, 36 124, 40 116Z" fill={color} opacity="0.55" />
      <path d="M36 94 C26 102, 18 118, 20 128 C28 118, 34 102, 36 94Z" fill={color} opacity="0.4" />
      <path d="M44 60 C38 68, 34 82, 38 92 C42 82, 42 68, 44 60Z" fill={color} opacity="0.25" />
      {/* Left inner — 3 fill leaves */}
      <path d="M76 164 C74 156, 80 148, 88 144 C86 152, 78 162, 76 164Z" fill={color} opacity="0.45" />
      <path d="M60 142 C56 134, 60 124, 68 118 C68 128, 62 140, 60 142Z" fill={color} opacity="0.35" />
      <path d="M46 118 C44 110, 48 100, 56 94 C56 104, 48 116, 46 118Z" fill={color} opacity="0.25" />
      {/* Right stem */}
      <path d="M118 178 C160 155, 178 110, 145 42" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.2" />
      {/* Right outer — mirror */}
      <path d="M122 172 C134 167, 148 175, 152 182 C142 181, 128 175, 122 172Z" fill={color} opacity="0.9" />
      <path d="M136 155 C150 154, 166 164, 170 174 C158 170, 142 159, 136 155Z" fill={color} opacity="0.8" />
      <path d="M150 136 C164 138, 180 150, 182 160 C170 154, 156 142, 150 136Z" fill={color} opacity="0.7" />
      <path d="M160 116 C172 122, 184 138, 184 148 C174 138, 164 124, 160 116Z" fill={color} opacity="0.55" />
      <path d="M164 94 C174 102, 182 118, 180 128 C172 118, 166 102, 164 94Z" fill={color} opacity="0.4" />
      <path d="M156 60 C162 68, 166 82, 162 92 C158 82, 158 68, 156 60Z" fill={color} opacity="0.25" />
      {/* Right inner */}
      <path d="M124 164 C126 156, 120 148, 112 144 C114 152, 122 162, 124 164Z" fill={color} opacity="0.45" />
      <path d="M140 142 C144 134, 140 124, 132 118 C132 128, 138 140, 140 142Z" fill={color} opacity="0.35" />
      <path d="M154 118 C156 110, 152 100, 144 94 C144 104, 152 116, 154 118Z" fill={color} opacity="0.25" />
      {/* Bottom join */}
      <path d="M82 178 C90 184, 96 186, 100 186 C104 186, 110 184, 118 178" stroke={color} strokeWidth="2" fill="none" opacity="0.3" strokeLinecap="round" />
      <ellipse cx="100" cy="188" rx="4" ry="2.5" fill={color} opacity="0.4" />
    </>
  );
}

interface LaurelBadgeProps {
  score: number;
  tier: QualityTier;
  trustLevel?: TrustLevel;
  size?: "sm" | "md" | "lg";
}

export function LaurelBadge({ score, tier, trustLevel, size = "md" }: LaurelBadgeProps) {
  const level = trustLevel || TIER_LEVEL[tier] || "verified";
  const config = LEVEL_CONFIG[level];

  const scale = size === "sm" ? 0.7 : size === "lg" ? 1.2 : 1;
  const w = Math.round(340 * scale);
  const h = Math.round(140 * scale);
  const wreathSize = Math.round(120 * scale);

  const glowId = `glow-${tier}-${score}`;
  const wreathCx = Math.round(wreathSize / 2 + 8 * scale);
  const wreathCy = Math.round(h / 2);

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <defs>
        <radialGradient id={glowId} cx="30%" cy="50%" r="35%">
          <stop offset="0%" stopColor={config.color} stopOpacity="0.12" />
          <stop offset="100%" stopColor={config.color} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background */}
      <rect width={w} height={h} rx="4" fill="#0E0E0C" />
      <rect width={w} height={h} rx="4" fill="none" stroke={config.color} strokeWidth="0.5" opacity="0.12" />

      {/* Radial glow behind wreath */}
      <rect width={w} height={h} rx="4" fill={`url(#${glowId})`} />

      {/* Left accent stripe */}
      <rect x="0" y="0" width={Math.round(3 * scale)} height={h} rx="1.5" fill={config.color} opacity="0.5" />

      {/* Wreath — simplified for badge, scaled */}
      <g transform={`translate(${Math.round(8 * scale)}, ${Math.round(10 * scale)}) scale(${(wreathSize / 200).toFixed(3)})`}>
        <BadgeWreath color={config.color} />
      </g>

      {/* Divider */}
      <line
        x1={Math.round(wreathSize + 16 * scale)}
        y1={Math.round(24 * scale)}
        x2={Math.round(wreathSize + 16 * scale)}
        y2={h - Math.round(24 * scale)}
        stroke={config.color}
        strokeWidth="0.5"
        opacity="0.12"
      />

      {/* Score — monospace for precision, tier-colored */}
      <text
        x={Math.round(wreathSize + 34 * scale)}
        y={Math.round(68 * scale)}
        fill={config.color}
        fontSize={Math.round(52 * scale)}
        fontWeight="700"
        fontFamily="ui-monospace, 'SF Mono', 'Cascadia Code', 'Source Code Pro', Menlo, monospace"
        letterSpacing="-0.02em"
      >
        {score}
      </text>

      {/* Tier label */}
      <text
        x={Math.round(wreathSize + 36 * scale)}
        y={Math.round(90 * scale)}
        fill="#535862"
        fontSize={Math.round(10 * scale)}
        fontWeight="600"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.14em"
      >
        {tier.toUpperCase()} TIER
      </text>

      {/* Brand */}
      <text
        x={Math.round(wreathSize + 36 * scale)}
        y={Math.round(112 * scale)}
        fill="#3a3d44"
        fontSize={Math.round(8 * scale)}
        fontWeight="600"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.22em"
      >
        LAUREUM.AI
      </text>
    </svg>
  );
}
