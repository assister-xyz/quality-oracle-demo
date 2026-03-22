interface LaurelLogoProps {
  size?: number;
  className?: string;
}

export function LaurelLogo({ size = 24, className }: LaurelLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left branch — wider U-curve */}
      <path
        d="M8 27 C4 22, 5 14, 12 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right branch */}
      <path
        d="M24 27 C28 22, 27 14, 20 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Left leaves — bold, 3 leaves */}
      <ellipse cx="6.5" cy="23" rx="3.2" ry="1.6" transform="rotate(-15 6.5 23)" fill="currentColor" />
      <ellipse cx="5.5" cy="17.5" rx="3" ry="1.5" transform="rotate(-35 5.5 17.5)" fill="currentColor" />
      <ellipse cx="8" cy="12" rx="2.8" ry="1.4" transform="rotate(-55 8 12)" fill="currentColor" />

      {/* Right leaves — mirror */}
      <ellipse cx="25.5" cy="23" rx="3.2" ry="1.6" transform="rotate(15 25.5 23)" fill="currentColor" />
      <ellipse cx="26.5" cy="17.5" rx="3" ry="1.5" transform="rotate(35 26.5 17.5)" fill="currentColor" />
      <ellipse cx="24" cy="12" rx="2.8" ry="1.4" transform="rotate(55 24 12)" fill="currentColor" />

      {/* Top circle */}
      <circle cx="16" cy="6" r="1.8" fill="currentColor" />
    </svg>
  );
}

/* Hero-sized wreath — classic open U-shape */
export function LaurelWreath({ size = 160, className }: LaurelLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left branch — wider, rounder curve */}
      <path
        d="M40 135 C20 110, 22 70, 55 38"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right branch */}
      <path
        d="M120 135 C140 110, 138 70, 105 38"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Left leaves — 6 leaves along the curve */}
      <ellipse cx="38" cy="126" rx="11" ry="5" transform="rotate(-12 38 126)" fill="currentColor" opacity="0.9" />
      <ellipse cx="30" cy="110" rx="10.5" ry="4.8" transform="rotate(-22 30 110)" fill="currentColor" opacity="0.85" />
      <ellipse cx="26" cy="94" rx="10" ry="4.5" transform="rotate(-35 26 94)" fill="currentColor" opacity="0.8" />
      <ellipse cx="27" cy="78" rx="9.5" ry="4.2" transform="rotate(-48 27 78)" fill="currentColor" opacity="0.7" />
      <ellipse cx="33" cy="63" rx="9" ry="4" transform="rotate(-58 33 63)" fill="currentColor" opacity="0.6" />
      <ellipse cx="43" cy="50" rx="8" ry="3.5" transform="rotate(-68 43 50)" fill="currentColor" opacity="0.45" />

      {/* Right leaves — mirror */}
      <ellipse cx="122" cy="126" rx="11" ry="5" transform="rotate(12 122 126)" fill="currentColor" opacity="0.9" />
      <ellipse cx="130" cy="110" rx="10.5" ry="4.8" transform="rotate(22 130 110)" fill="currentColor" opacity="0.85" />
      <ellipse cx="134" cy="94" rx="10" ry="4.5" transform="rotate(35 134 94)" fill="currentColor" opacity="0.8" />
      <ellipse cx="133" cy="78" rx="9.5" ry="4.2" transform="rotate(48 133 78)" fill="currentColor" opacity="0.7" />
      <ellipse cx="127" cy="63" rx="9" ry="4" transform="rotate(58 127 63)" fill="currentColor" opacity="0.6" />
      <ellipse cx="117" cy="50" rx="8" ry="3.5" transform="rotate(68 117 50)" fill="currentColor" opacity="0.45" />

      {/* Top — two tips angled inward with a star between */}
      <circle cx="80" cy="34" r="3" fill="currentColor" opacity="0.7" />
    </svg>
  );
}
