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

/* Wreath SVG paths extracted from hero LaurelWreath — same exact shape */
function WreathPaths({ color }: { color: string }) {
  return (
    <>
      {/* Left stem */}
      <path d="M82 178 C40 155, 22 110, 55 42" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.25" />
      {/* Left outer */}
      <path d="M78 172 C68 168, 56 174, 52 180 C60 180, 72 176, 78 172Z" fill={color} opacity="0.85" />
      <path d="M68 160 C56 158, 42 166, 38 174 C48 172, 62 164, 68 160Z" fill={color} opacity="0.8" />
      <path d="M56 146 C44 146, 30 156, 26 164 C36 160, 50 150, 56 146Z" fill={color} opacity="0.75" />
      <path d="M46 130 C34 132, 20 144, 18 152 C28 146, 40 136, 46 130Z" fill={color} opacity="0.65" />
      <path d="M38 114 C28 118, 16 132, 14 140 C24 132, 34 120, 38 114Z" fill={color} opacity="0.55" />
      <path d="M34 98 C24 104, 16 118, 16 126 C24 118, 30 104, 34 98Z" fill={color} opacity="0.45" />
      <path d="M38 66 C32 72, 28 86, 30 94 C34 86, 36 72, 38 66Z" fill={color} opacity="0.3" />
      <path d="M55 42 C50 46, 48 56, 50 64 C54 56, 54 46, 55 42Z" fill={color} opacity="0.2" />
      {/* Left inner */}
      <path d="M80 168 C78 162, 84 154, 90 152 C88 158, 82 166, 80 168Z" fill={color} opacity="0.4" />
      <path d="M70 154 C66 148, 70 140, 76 136 C76 144, 72 152, 70 154Z" fill={color} opacity="0.35" />
      <path d="M58 138 C54 132, 56 124, 62 118 C64 126, 60 136, 58 138Z" fill={color} opacity="0.3" />
      <path d="M48 122 C44 116, 46 108, 52 102 C54 110, 50 120, 48 122Z" fill={color} opacity="0.25" />
      {/* Right stem */}
      <path d="M118 178 C160 155, 178 110, 145 42" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.25" />
      {/* Right outer */}
      <path d="M122 172 C132 168, 144 174, 148 180 C140 180, 128 176, 122 172Z" fill={color} opacity="0.85" />
      <path d="M132 160 C144 158, 158 166, 162 174 C152 172, 138 164, 132 160Z" fill={color} opacity="0.8" />
      <path d="M144 146 C156 146, 170 156, 174 164 C164 160, 150 150, 144 146Z" fill={color} opacity="0.75" />
      <path d="M154 130 C166 132, 180 144, 182 152 C172 146, 160 136, 154 130Z" fill={color} opacity="0.65" />
      <path d="M162 114 C172 118, 184 132, 186 140 C176 132, 166 120, 162 114Z" fill={color} opacity="0.55" />
      <path d="M166 98 C176 104, 184 118, 184 126 C176 118, 170 104, 166 98Z" fill={color} opacity="0.45" />
      <path d="M162 66 C168 72, 172 86, 170 94 C166 86, 164 72, 162 66Z" fill={color} opacity="0.3" />
      <path d="M145 42 C150 46, 152 56, 150 64 C146 56, 146 46, 145 42Z" fill={color} opacity="0.2" />
      {/* Right inner */}
      <path d="M120 168 C122 162, 116 154, 110 152 C112 158, 118 166, 120 168Z" fill={color} opacity="0.4" />
      <path d="M130 154 C134 148, 130 140, 124 136 C124 144, 128 152, 130 154Z" fill={color} opacity="0.35" />
      <path d="M142 138 C146 132, 144 124, 138 118 C136 126, 140 136, 142 138Z" fill={color} opacity="0.3" />
      <path d="M152 122 C156 116, 154 108, 148 102 C146 110, 150 120, 152 122Z" fill={color} opacity="0.25" />
      {/* Bottom join */}
      <path d="M82 178 C88 182, 94 184, 100 184 C106 184, 112 182, 118 178" stroke={color} strokeWidth="1.2" fill="none" opacity="0.3" strokeLinecap="round" />
      <ellipse cx="100" cy="186" rx="3.5" ry="2" fill={color} opacity="0.4" />
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

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {/* Background */}
      <rect width={w} height={h} rx="4" fill="#0E0E0C" />
      <rect width={w} height={h} rx="4" fill="none" stroke={config.color} strokeWidth="0.5" opacity="0.15" />

      {/* Left accent stripe */}
      <rect x="0" y="0" width={Math.round(3 * scale)} height={h} rx="1.5" fill={config.color} opacity="0.5" />

      {/* Wreath — scaled and positioned */}
      <g transform={`translate(${Math.round(8 * scale)}, ${Math.round(10 * scale)}) scale(${(wreathSize / 200).toFixed(3)})`}>
        <WreathPaths color={config.color} />
      </g>

      {/* Divider */}
      <line
        x1={Math.round(wreathSize + 16 * scale)}
        y1={Math.round(20 * scale)}
        x2={Math.round(wreathSize + 16 * scale)}
        y2={h - Math.round(20 * scale)}
        stroke={config.color}
        strokeWidth="0.5"
        opacity="0.15"
      />

      {/* Score — large, mono, tier-colored */}
      <text
        x={Math.round(wreathSize + 32 * scale)}
        y={Math.round(62 * scale)}
        fill={config.color}
        fontSize={Math.round(48 * scale)}
        fontWeight="800"
        fontFamily="'Syne', system-ui, sans-serif"
      >
        {score}
      </text>

      {/* Tier label */}
      <text
        x={Math.round(wreathSize + 34 * scale)}
        y={Math.round(86 * scale)}
        fill="#535862"
        fontSize={Math.round(11 * scale)}
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
        letterSpacing={`${(0.12 * scale).toFixed(2)}em`}
      >
        {tier.toUpperCase()} TIER
      </text>

      {/* Brand */}
      <text
        x={Math.round(wreathSize + 34 * scale)}
        y={Math.round(110 * scale)}
        fill="#3a3d44"
        fontSize={Math.round(9 * scale)}
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
        letterSpacing={`${(0.2 * scale).toFixed(2)}em`}
      >
        LAUREUM.AI
      </text>
    </svg>
  );
}
