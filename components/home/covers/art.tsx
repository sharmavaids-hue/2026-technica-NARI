// Shared hand-made art for the calendar month covers: rough painted edges (SVG turbulence +
// displacement), halftone dot patches, little stitch marks, pad-shaped lily pads, and the
// one-line girl on her pad floatie. Everything is decorative (aria-hidden by the caller).

import type { ReactNode } from "react";

/** Filters and patterns, prefixed so several covers can share a page. */
export function CoverDefs({ id, dot = "#1f2340" }: { id: string; dot?: string }) {
  return (
    <defs>
      {/* wobbly, painted edge */}
      <filter id={`${id}-rough`} x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="7" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      {/* painted look: wobbly edge, then a soft dry-brush grain that only darkens (never punches holes) */}
      <filter id={`${id}-paint`} x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="3" result="edge" />
        <feDisplacementMap in="SourceGraphic" in2="edge" scale="4" xChannelSelector="R" yChannelSelector="G" result="shape" />
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="11" result="grain" />
        <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0.12  0 0 0 0 0.13  0 0 0 0 0.25  0 0 0 0.42 -0.15" result="speck" />
        <feComposite in="speck" in2="shape" operator="in" result="speckIn" />
        <feMerge>
          <feMergeNode in="shape" />
          <feMergeNode in="speckIn" />
        </feMerge>
      </filter>
      <pattern id={`${id}-dots`} width="5" height="5" patternUnits="userSpaceOnUse">
        <circle cx="2.5" cy="2.5" r="0.9" fill={dot} opacity="0.22" />
      </pattern>
    </defs>
  );
}

/** Two short hand-drawn ticks, like the stitch marks around a planner sticker. */
export function Stitches({ x, y, r = 0, color = "#b83e4b" }: { x: number; y: number; r?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`} stroke={color} strokeWidth="1.6" strokeLinecap="round">
      <path d="M0 0 l2 9" />
      <path d="M5 -1 l2 9" />
    </g>
  );
}

/** A lily pad that is a pad: rounded body with little wings, lighter core, halftone patch. */
export function LilyPad({ id, fill, core, w = 70 }: { id: string; fill: string; core: string; w?: number }) {
  const h = w * 0.4;
  return (
    <g>
      <g transform="translate(3 5)" opacity="0.13" filter={`url(#${id}-rough)`}>
        <ellipse cx={w / 2} cy={h * 0.02} rx={w * 0.17} ry={h * 0.36} fill="#1f2340" />
        <ellipse cx={w / 2} cy={h * 0.98} rx={w * 0.17} ry={h * 0.36} fill="#1f2340" />
        <rect x="0" y="0" width={w} height={h} rx={h / 2} fill="#1f2340" />
      </g>
      <g filter={`url(#${id}-paint)`}>
        <ellipse cx={w / 2} cy={h * 0.02} rx={w * 0.17} ry={h * 0.36} fill={fill} />
        <ellipse cx={w / 2} cy={h * 0.98} rx={w * 0.17} ry={h * 0.36} fill={fill} />
        <rect x="0" y="0" width={w} height={h} rx={h / 2} fill={fill} />
        <rect x={w * 0.14} y={h * 0.26} width={w * 0.72} height={h * 0.48} rx={h * 0.24} fill={core} />
      </g>
      <rect x={w * 0.5} y={h * 0.1} width={w * 0.42} height={h * 0.8} rx={h * 0.3} fill={`url(#${id}-dots)`} />
    </g>
  );
}

/** Little white water flower: a few soft petals. */
export function Flower({ s = 1 }: { s?: number }) {
  return (
    <g transform={`scale(${s})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy="-4" rx="2.4" ry="4.4" fill="#fbf8f2" transform={`rotate(${a})`} />
      ))}
      <circle r="1.8" fill="#f7dcad" />
    </g>
  );
}

/**
 * The one-line girl resting on a pad floatie, seen from above, head to the right.
 * viewBox 0 0 140 70. Drawn as a few long ink strokes so it reads like a single-line drawing.
 */
export function FloatieGirl({ id, children }: { id: string; children?: ReactNode }) {
  return (
    <svg viewBox="0 0 140 70" className="block size-full overflow-visible">
      {/* floatie shadow on the water */}
      <g transform="translate(4 6)" opacity="0.14" filter={`url(#${id}-rough)`}>
        <ellipse cx="70" cy="14" rx="17" ry="12" fill="#1f2340" />
        <ellipse cx="70" cy="56" rx="17" ry="12" fill="#1f2340" />
        <rect x="6" y="15" width="128" height="40" rx="20" fill="#1f2340" />
      </g>
      {/* pad floatie */}
      <g filter={`url(#${id}-paint)`}>
        <ellipse cx="70" cy="14" rx="17" ry="12" fill="#fbf8f2" />
        <ellipse cx="70" cy="56" rx="17" ry="12" fill="#fbf8f2" />
        <rect x="6" y="15" width="128" height="40" rx="20" fill="#fbf8f2" />
      </g>
      <rect x="18" y="23" width="104" height="24" rx="12" fill="none" stroke="#d6cbb9" strokeWidth="1.3" strokeDasharray="4 3" />
      {/* the girl, one ink line at a time: legs, arms, body, head */}
      <path d="M92 31.5 C84 30.6 72 31 64.5 32.4 C61.5 33.4 61.5 37.6 64.5 38.6 C72 40 84 40.4 92 39.6 Z" fill="#b83e4b" />
      <g fill="none" stroke="#1f2340" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M63 33.5 C54 32 46 30.5 39 29.6 C31 28.6 24 27.6 17 27" />
        <path d="M63 37.5 C54 39 46 40.6 39 41.6 C31 42.6 24 43.4 17 44" />
        <path d="M17 27 C14.5 26.4 13.4 28.6 15.6 29.6 M17 44 C14.5 44.6 13.4 42.4 15.6 41.4" />
        <path d="M100 31.6 C88 29.6 72 30 63.5 32 C59.5 33.2 59.5 37.8 63.5 39 C72 41 88 41.4 100 39.4" />
        <path d="M95 32 C90 26 85 21 78 17.5 C75.5 16.4 74 18 75.6 19.6" />
        <path d="M95 39 C90 45 85 49.5 78 53 C75.5 54.2 74 52.6 75.6 51" />
        <circle cx="108" cy="35.5" r="7.6" />
      </g>
      <path d="M107.6 27.6 C115.5 27.4 119.4 31.6 119.4 36.4 C119.4 41.2 116.2 44.6 111.2 44 C114.6 40 114.4 31.6 107.6 27.6 Z" fill="#1f2340" />
      {children}
    </svg>
  );
}

/** Small deterministic random generator so each month's scene is stable. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
