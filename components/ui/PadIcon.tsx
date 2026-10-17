import type { Clot, Soak } from "@/lib/types";

/** Pad outline with a red stain that grows with soak level. Decorative: the label says it in words. */
export function PadIcon({ soak, size = 64 }: { soak: Soak; size?: number }) {
  const w = size * 0.8;
  const h = size * 1.5;
  return (
    <svg width={w} height={h} viewBox="0 0 40 75" aria-hidden="true" focusable="false">
      <rect x="2" y="2" width="36" height="71" rx="18" fill="#fbf8f2" stroke="#1f2340" strokeWidth="2.2" />
      {soak === "light" && <ellipse cx="20" cy="37.5" rx="5" ry="6" fill="#b83e4b" />}
      {soak === "moderate" && <ellipse cx="20" cy="37.5" rx="11" ry="18" fill="#b83e4b" />}
      {soak === "full" && <rect x="6.5" y="6.5" width="27" height="62" rx="13.5" fill="#b83e4b" />}
    </svg>
  );
}

/** Clot size as a circle: none = empty dashed ring, small = dashed ring, large = solid ring (quarter-sized). */
export function ClotIcon({ clot, size = 28 }: { clot: Clot; size?: number }) {
  if (clot === "none") return null;
  const r = clot === "small" ? 9 : 13;
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" aria-hidden="true" focusable="false">
      <circle
        cx="15"
        cy="15"
        r={r}
        fill="none"
        stroke="#1f2340"
        strokeWidth="2"
        strokeDasharray={clot === "small" ? "3 3" : undefined}
      />
    </svg>
  );
}
