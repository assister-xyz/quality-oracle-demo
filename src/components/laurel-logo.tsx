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
      <path d="M8 27 C4 22, 5 14, 12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M24 27 C28 22, 27 14, 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <ellipse cx="6.5" cy="23" rx="3.2" ry="1.6" transform="rotate(-15 6.5 23)" fill="currentColor" />
      <ellipse cx="5.5" cy="17.5" rx="3" ry="1.5" transform="rotate(-35 5.5 17.5)" fill="currentColor" />
      <ellipse cx="8" cy="12" rx="2.8" ry="1.4" transform="rotate(-55 8 12)" fill="currentColor" />
      <ellipse cx="25.5" cy="23" rx="3.2" ry="1.6" transform="rotate(15 25.5 23)" fill="currentColor" />
      <ellipse cx="26.5" cy="17.5" rx="3" ry="1.5" transform="rotate(35 26.5 17.5)" fill="currentColor" />
      <ellipse cx="24" cy="12" rx="2.8" ry="1.4" transform="rotate(55 24 12)" fill="currentColor" />
      <circle cx="16" cy="6" r="1.8" fill="currentColor" />
    </svg>
  );
}

/*
 * Hero wreath — realistic laurel wreath SVG.
 *
 * Key differences from previous version:
 * - Leaves are pointed (leaf-shaped paths, not ellipses)
 * - Branches curve outward more (wide U-shape, not parallel columns)
 * - Leaves angle AWAY from the stem (fanning outward like a real laurel)
 * - Bottom has a proper crossing/joining point
 * - Graduated leaf sizes: large at bottom, small at tips
 */
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
      {/* ── LEFT BRANCH ── */}
      {/* Main stem — wide sweeping curve */}
      <path
        d="M82 178 C40 155, 22 110, 55 42"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.3"
      />

      {/* Left outer leaves — pointed leaf shapes fanning outward */}
      <path d="M78 172 C68 168, 56 174, 52 180 C60 180, 72 176, 78 172Z" fill="currentColor" opacity="0.9" />
      <path d="M68 160 C56 158, 42 166, 38 174 C48 172, 62 164, 68 160Z" fill="currentColor" opacity="0.9" />
      <path d="M56 146 C44 146, 30 156, 26 164 C36 160, 50 150, 56 146Z" fill="currentColor" opacity="0.85" />
      <path d="M46 130 C34 132, 20 144, 18 152 C28 146, 40 136, 46 130Z" fill="currentColor" opacity="0.8" />
      <path d="M38 114 C28 118, 16 132, 14 140 C24 132, 34 120, 38 114Z" fill="currentColor" opacity="0.75" />
      <path d="M34 98 C24 104, 16 118, 16 126 C24 118, 30 104, 34 98Z" fill="currentColor" opacity="0.65" />
      <path d="M34 82 C26 88, 20 102, 22 110 C28 102, 32 88, 34 82Z" fill="currentColor" opacity="0.55" />
      <path d="M38 66 C32 72, 28 86, 30 94 C34 86, 36 72, 38 66Z" fill="currentColor" opacity="0.45" />
      <path d="M46 52 C40 58, 38 70, 40 78 C44 70, 44 58, 46 52Z" fill="currentColor" opacity="0.35" />
      <path d="M55 42 C50 46, 48 56, 50 64 C54 56, 54 46, 55 42Z" fill="currentColor" opacity="0.25" />

      {/* Left inner leaves — shorter, fill volume */}
      <path d="M80 168 C78 162, 84 154, 90 152 C88 158, 82 166, 80 168Z" fill="currentColor" opacity="0.5" />
      <path d="M70 154 C66 148, 70 140, 76 136 C76 144, 72 152, 70 154Z" fill="currentColor" opacity="0.45" />
      <path d="M58 138 C54 132, 56 124, 62 118 C64 126, 60 136, 58 138Z" fill="currentColor" opacity="0.4" />
      <path d="M48 122 C44 116, 46 108, 52 102 C54 110, 50 120, 48 122Z" fill="currentColor" opacity="0.35" />
      <path d="M40 106 C38 100, 40 92, 46 86 C48 94, 42 104, 40 106Z" fill="currentColor" opacity="0.3" />
      <path d="M38 88 C36 82, 40 74, 46 70 C46 78, 40 86, 38 88Z" fill="currentColor" opacity="0.25" />

      {/* ── RIGHT BRANCH ── (mirror) */}
      <path
        d="M118 178 C160 155, 178 110, 145 42"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.3"
      />

      {/* Right outer leaves */}
      <path d="M122 172 C132 168, 144 174, 148 180 C140 180, 128 176, 122 172Z" fill="currentColor" opacity="0.9" />
      <path d="M132 160 C144 158, 158 166, 162 174 C152 172, 138 164, 132 160Z" fill="currentColor" opacity="0.9" />
      <path d="M144 146 C156 146, 170 156, 174 164 C164 160, 150 150, 144 146Z" fill="currentColor" opacity="0.85" />
      <path d="M154 130 C166 132, 180 144, 182 152 C172 146, 160 136, 154 130Z" fill="currentColor" opacity="0.8" />
      <path d="M162 114 C172 118, 184 132, 186 140 C176 132, 166 120, 162 114Z" fill="currentColor" opacity="0.75" />
      <path d="M166 98 C176 104, 184 118, 184 126 C176 118, 170 104, 166 98Z" fill="currentColor" opacity="0.65" />
      <path d="M166 82 C174 88, 180 102, 178 110 C172 102, 168 88, 166 82Z" fill="currentColor" opacity="0.55" />
      <path d="M162 66 C168 72, 172 86, 170 94 C166 86, 164 72, 162 66Z" fill="currentColor" opacity="0.45" />
      <path d="M154 52 C160 58, 162 70, 160 78 C156 70, 156 58, 154 52Z" fill="currentColor" opacity="0.35" />
      <path d="M145 42 C150 46, 152 56, 150 64 C146 56, 146 46, 145 42Z" fill="currentColor" opacity="0.25" />

      {/* Right inner leaves */}
      <path d="M120 168 C122 162, 116 154, 110 152 C112 158, 118 166, 120 168Z" fill="currentColor" opacity="0.5" />
      <path d="M130 154 C134 148, 130 140, 124 136 C124 144, 128 152, 130 154Z" fill="currentColor" opacity="0.45" />
      <path d="M142 138 C146 132, 144 124, 138 118 C136 126, 140 136, 142 138Z" fill="currentColor" opacity="0.4" />
      <path d="M152 122 C156 116, 154 108, 148 102 C146 110, 150 120, 152 122Z" fill="currentColor" opacity="0.35" />
      <path d="M160 106 C162 100, 160 92, 154 86 C152 94, 158 104, 160 106Z" fill="currentColor" opacity="0.3" />
      <path d="M162 88 C164 82, 160 74, 154 70 C154 78, 160 86, 162 88Z" fill="currentColor" opacity="0.25" />

      {/* ── BOTTOM JOIN ── crossing point where branches meet */}
      <path d="M82 178 C88 182, 94 184, 100 184 C106 184, 112 182, 118 178" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round" />
      <path d="M86 176 C84 182, 88 186, 94 186 C90 182, 86 178, 86 176Z" fill="currentColor" opacity="0.6" />
      <path d="M114 176 C116 182, 112 186, 106 186 C110 182, 114 178, 114 176Z" fill="currentColor" opacity="0.6" />
      <ellipse cx="100" cy="186" rx="4" ry="2.5" fill="currentColor" opacity="0.5" />
    </svg>
  );
}
