export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="fc-a" x1="8" y1="6" x2="44" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#625BFF" />
        </linearGradient>
        <linearGradient id="fc-b" x1="10" y1="24" x2="40" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#625BFF" />
          <stop offset="1" stopColor="#4F48E6" />
        </linearGradient>
      </defs>
      <path d="M17 6h25c-3 5-8 8-14 8H14C9 14 12 6 17 6Z" fill="url(#fc-a)" />
      <path d="M13 21h22c-3 5-7 8-13 8h-7v8c0 4-3 7-6 7s-4-3-4-6V27c0-4 3-6 8-6Z" fill="url(#fc-b)" />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      <span className={`font-heading text-xl font-extrabold tracking-tight ${light ? "text-white" : "text-ink"}`}>
        FlowCopy
      </span>
    </span>
  );
}
