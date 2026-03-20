interface LaurelIconProps {
  tier: "verified" | "certified" | "audited";
  size?: number;
  className?: string;
}

const TIER_COLORS = {
  verified: "#C38133",
  certified: "#C0C0C0",
  audited: "#FFD700",
};

export function LaurelIcon({ tier, size = 20, className }: LaurelIconProps) {
  const color = TIER_COLORS[tier];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left branch */}
      <path
        d="M5 19c0-5 2.5-8.5 7-10"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="5.5" cy="15" rx="2" ry="3.5" transform="rotate(-15 5.5 15)" fill={color} opacity="0.85" />
      <ellipse cx="6.5" cy="11" rx="1.8" ry="3" transform="rotate(-30 6.5 11)" fill={color} opacity="0.7" />
      <ellipse cx="8.5" cy="8" rx="1.5" ry="2.8" transform="rotate(-45 8.5 8)" fill={color} opacity="0.55" />

      {/* Right branch */}
      <path
        d="M19 19c0-5-2.5-8.5-7-10"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="18.5" cy="15" rx="2" ry="3.5" transform="rotate(15 18.5 15)" fill={color} opacity="0.85" />
      <ellipse cx="17.5" cy="11" rx="1.8" ry="3" transform="rotate(30 17.5 11)" fill={color} opacity="0.7" />
      <ellipse cx="15.5" cy="8" rx="1.5" ry="2.8" transform="rotate(45 15.5 8)" fill={color} opacity="0.55" />

      {/* Top gem */}
      <circle cx="12" cy="5.5" r="1.5" fill={color} />
    </svg>
  );
}
