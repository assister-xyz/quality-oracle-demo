interface LaurelLogoProps {
  size?: number;
  className?: string;
}

/* Small logo for navbar — simple, bold, works at 20px */
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
      {/* Left branch */}
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
      {/* Left leaves */}
      <ellipse cx="6.5" cy="23" rx="3.2" ry="1.6" transform="rotate(-15 6.5 23)" fill="currentColor" />
      <ellipse cx="5.5" cy="17.5" rx="3" ry="1.5" transform="rotate(-35 5.5 17.5)" fill="currentColor" />
      <ellipse cx="8" cy="12" rx="2.8" ry="1.4" transform="rotate(-55 8 12)" fill="currentColor" />
      {/* Right leaves */}
      <ellipse cx="25.5" cy="23" rx="3.2" ry="1.6" transform="rotate(15 25.5 23)" fill="currentColor" />
      <ellipse cx="26.5" cy="17.5" rx="3" ry="1.5" transform="rotate(35 26.5 17.5)" fill="currentColor" />
      <ellipse cx="24" cy="12" rx="2.8" ry="1.4" transform="rotate(55 24 12)" fill="currentColor" />
      {/* Top circle */}
      <circle cx="16" cy="6" r="1.8" fill="currentColor" />
    </svg>
  );
}

/* Hero wreath — detailed, lush laurel wreath that matches the brand reference images.
   More leaves, rounder shape, thicker branches, gradient-like opacity progression. */
export function LaurelWreath({ size = 200, className }: LaurelLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left main stem */}
      <path
        d="M50 170 C30 140, 28 95, 60 45"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      {/* Right main stem */}
      <path
        d="M150 170 C170 140, 172 95, 140 45"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />

      {/* ── LEFT BRANCH LEAVES ── (8 leaves, outer side) */}
      <ellipse cx="42" cy="158" rx="14" ry="6" transform="rotate(-8 42 158)" fill="currentColor" opacity="0.95" />
      <ellipse cx="36" cy="143" rx="13.5" ry="5.8" transform="rotate(-18 36 143)" fill="currentColor" opacity="0.9" />
      <ellipse cx="32" cy="128" rx="13" ry="5.5" transform="rotate(-28 32 128)" fill="currentColor" opacity="0.85" />
      <ellipse cx="30" cy="112" rx="12.5" ry="5.2" transform="rotate(-38 30 112)" fill="currentColor" opacity="0.8" />
      <ellipse cx="31" cy="96" rx="12" ry="5" transform="rotate(-48 31 96)" fill="currentColor" opacity="0.7" />
      <ellipse cx="36" cy="80" rx="11" ry="4.5" transform="rotate(-56 36 80)" fill="currentColor" opacity="0.6" />
      <ellipse cx="44" cy="66" rx="10" ry="4" transform="rotate(-64 44 66)" fill="currentColor" opacity="0.5" />
      <ellipse cx="54" cy="54" rx="9" ry="3.5" transform="rotate(-72 54 54)" fill="currentColor" opacity="0.4" />

      {/* LEFT BRANCH — inner leaves (smaller, fill the gap) */}
      <ellipse cx="50" cy="152" rx="10" ry="4.5" transform="rotate(10 50 152)" fill="currentColor" opacity="0.6" />
      <ellipse cx="46" cy="138" rx="9.5" ry="4.2" transform="rotate(0 46 138)" fill="currentColor" opacity="0.55" />
      <ellipse cx="42" cy="122" rx="9" ry="4" transform="rotate(-10 42 122)" fill="currentColor" opacity="0.5" />
      <ellipse cx="40" cy="106" rx="8.5" ry="3.8" transform="rotate(-20 40 106)" fill="currentColor" opacity="0.45" />
      <ellipse cx="42" cy="90" rx="8" ry="3.5" transform="rotate(-30 42 90)" fill="currentColor" opacity="0.35" />
      <ellipse cx="48" cy="76" rx="7" ry="3" transform="rotate(-40 48 76)" fill="currentColor" opacity="0.3" />

      {/* ── RIGHT BRANCH LEAVES ── (8 leaves, outer side — mirror) */}
      <ellipse cx="158" cy="158" rx="14" ry="6" transform="rotate(8 158 158)" fill="currentColor" opacity="0.95" />
      <ellipse cx="164" cy="143" rx="13.5" ry="5.8" transform="rotate(18 164 143)" fill="currentColor" opacity="0.9" />
      <ellipse cx="168" cy="128" rx="13" ry="5.5" transform="rotate(28 168 128)" fill="currentColor" opacity="0.85" />
      <ellipse cx="170" cy="112" rx="12.5" ry="5.2" transform="rotate(38 170 112)" fill="currentColor" opacity="0.8" />
      <ellipse cx="169" cy="96" rx="12" ry="5" transform="rotate(48 169 96)" fill="currentColor" opacity="0.7" />
      <ellipse cx="164" cy="80" rx="11" ry="4.5" transform="rotate(56 164 80)" fill="currentColor" opacity="0.6" />
      <ellipse cx="156" cy="66" rx="10" ry="4" transform="rotate(64 156 66)" fill="currentColor" opacity="0.5" />
      <ellipse cx="146" cy="54" rx="9" ry="3.5" transform="rotate(72 146 54)" fill="currentColor" opacity="0.4" />

      {/* RIGHT BRANCH — inner leaves */}
      <ellipse cx="150" cy="152" rx="10" ry="4.5" transform="rotate(-10 150 152)" fill="currentColor" opacity="0.6" />
      <ellipse cx="154" cy="138" rx="9.5" ry="4.2" transform="rotate(0 154 138)" fill="currentColor" opacity="0.55" />
      <ellipse cx="158" cy="122" rx="9" ry="4" transform="rotate(10 158 122)" fill="currentColor" opacity="0.5" />
      <ellipse cx="160" cy="106" rx="8.5" ry="3.8" transform="rotate(20 160 106)" fill="currentColor" opacity="0.45" />
      <ellipse cx="158" cy="90" rx="8" ry="3.5" transform="rotate(30 158 90)" fill="currentColor" opacity="0.35" />
      <ellipse cx="152" cy="76" rx="7" ry="3" transform="rotate(40 152 76)" fill="currentColor" opacity="0.3" />

      {/* Bottom join — small decorative elements where branches meet */}
      <ellipse cx="90" cy="172" rx="6" ry="3" transform="rotate(15 90 172)" fill="currentColor" opacity="0.7" />
      <ellipse cx="110" cy="172" rx="6" ry="3" transform="rotate(-15 110 172)" fill="currentColor" opacity="0.7" />
      <circle cx="100" cy="176" r="3" fill="currentColor" opacity="0.5" />
    </svg>
  );
}
