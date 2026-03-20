interface LaurelLogoProps {
  size?: number;
  className?: string;
}

export function LaurelLogo({ size = 18, className }: LaurelLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left laurel branch */}
      <path
        d="M4 21c0-6 3-10.5 8-12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M5 17c-1.5-1.5-2-3.5-1.5-5 1.5 0.5 2.5 2 2.5 4" fill="currentColor" opacity="0.9" />
      <path d="M6 14c-1.5-1.8-1.5-4 -0.5-5.5 1.5 0.8 2 2.5 1.5 4.5" fill="currentColor" opacity="0.8" />
      <path d="M7.5 11c-1-2-0.5-4 1-5.5 1 1 1.2 3 0.2 4.8" fill="currentColor" opacity="0.7" />
      <path d="M9.5 8.5c-0.5-2 0.5-3.8 2-4.5 0.5 1.2 0.3 3-0.8 4.2" fill="currentColor" opacity="0.6" />

      {/* Right laurel branch */}
      <path
        d="M20 21c0-6-3-10.5-8-12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M19 17c1.5-1.5 2-3.5 1.5-5-1.5 0.5-2.5 2-2.5 4" fill="currentColor" opacity="0.9" />
      <path d="M18 14c1.5-1.8 1.5-4 0.5-5.5-1.5 0.8-2 2.5-1.5 4.5" fill="currentColor" opacity="0.8" />
      <path d="M16.5 11c1-2 0.5-4-1-5.5-1 1-1.2 3-0.2 4.8" fill="currentColor" opacity="0.7" />
      <path d="M14.5 8.5c0.5-2-0.5-3.8-2-4.5-0.5 1.2-0.3 3 0.8 4.2" fill="currentColor" opacity="0.6" />

      {/* Top gem/star */}
      <circle cx="12" cy="4" r="1.2" fill="currentColor" />
    </svg>
  );
}
