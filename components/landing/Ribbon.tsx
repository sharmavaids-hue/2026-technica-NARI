// One thread through the whole landing page (ref 22): a watermelon ribbon that winds from the hero,
// past the score story and the pond, to "open nari". It draws itself as you scroll (CSS scroll
// timeline in globals.css, .ribbon-*); reduced motion shows it whole and still. Decorative.
// Hidden below 640px: a phone has no side margins to run in without crossing body text.

// Waypoints in page space: x 0–100 (% of width), y 0–1000 (‰ of page height, measured at laptop width:
// hero 0–85, noise 85–237, type band 237–308, peach 308–368, score story 368–611, pond 611–785,
// habits 785–850, get believed 850–908, trust 908–940, footer 940+).
// It runs down the side margins and crosses only in gaps or behind the big type (which sits above it).
const POINTS: [number, number][] = [
  [104, 12],
  [93, 40],
  [97, 64],
  [97, 150],
  [96, 232],
  [80, 252],
  [40, 278],
  [5, 300],
  [3, 334],
  [4, 364],
  [40, 371],
  [80, 375],
  [97, 392],
  [97, 600],
  [70, 612],
  [30, 616],
  [3, 640],
  [3, 780],
  [30, 788],
  [70, 790],
  [97, 800],
  [97, 904],
  [70, 910],
  [30, 911],
  [2, 924],
  [3, 954],
  [40, 962],
  [70, 960],
  [97, 978],
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
