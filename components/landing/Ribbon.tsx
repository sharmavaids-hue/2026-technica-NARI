// One thread through the whole landing page (ref 22): a watermelon ribbon that winds from the hero,
// past the score story and the pond, to "open nari". It draws itself as you scroll (CSS scroll
// timeline in globals.css, .ribbon-*); reduced motion shows it whole and still. Decorative.
// Hidden below 640px: a phone has no side margins to run in without crossing body text.

// Waypoints in page space: x 0–100 (% of width), y 0–1000 (‰ of page height, measured at laptop width:
// hero 0–107, peach 107–191, score story 191–533, pond 533–779, habits 779–871, trust 871–915, footer 915+).
// It crosses sections in the open gaps and runs down the side margins, never across body text;
// the hero type and the footer's "nari" sit above it, so it slips behind them.
const POINTS: [number, number][] = [
  [104, 20],
  [86, 60],
  [60, 92],
  [42, 104],
  [6, 112],
  [3, 150],
  [4, 186],
  [30, 196],
  [72, 200],
  [97, 230],
  [97, 380],
  [96, 520],
  [70, 540],
  [30, 548],
  [3, 575],
  [3, 760],
  [30, 786],
  [70, 790],
  [97, 800],
  [97, 860],
  [70, 868],
  [30, 870],
  [2, 890],
  [3, 945],
  [40, 952],
  [70, 948],
  [97, 970],
  [101, 1010],
];

/** Catmull-Rom through the waypoints, as smooth cubic Béziers. */
function smoothPath(pts: [number, number][]) {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(2)} ${c1[1].toFixed(2)}, ${c2[0].toFixed(2)} ${c2[1].toFixed(2)}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

const D = smoothPath(POINTS);

export function Ribbon() {
  return (
    <svg
      aria-hidden="true"
      className="ribbon pointer-events-none absolute inset-0 z-[5] hidden h-full w-full sm:block"
      viewBox="0 0 100 1000"
      preserveAspectRatio="none"
    >
      {/* soft shadow so it reads as lying on top of the paper */}
      <path d={D} pathLength={1} className="ribbon-draw" fill="none" stroke="#1f2340" strokeOpacity="0.1" strokeWidth="var(--ribbon-w)" strokeLinecap="round" vectorEffect="non-scaling-stroke" transform="translate(0.25 2)" />
      <path d={D} pathLength={1} className="ribbon-draw" fill="none" stroke="#b83e4b" strokeWidth="var(--ribbon-w)" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      {/* lighter sheen along one edge, like satin catching light */}
      <path d={D} pathLength={1} className="ribbon-draw" fill="none" stroke="#e58a95" strokeOpacity="0.85" strokeWidth="var(--ribbon-sheen)" strokeLinecap="round" vectorEffect="non-scaling-stroke" transform="translate(-0.12 -1.2)" />
    </svg>
  );
}
