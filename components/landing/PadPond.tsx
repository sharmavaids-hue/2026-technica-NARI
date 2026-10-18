// The pad pond (ref 23, Nari's version): soft pink water, lily pads that are pads, and the one-line
// girl resting on her pad floatie. Same art as the calendar "swim with her" cover, so the landing page
// and the app feel like one world. Pinned scroll scene, CSS scroll-driven only (globals.css, .pond-*);
// reduced motion or no support shows a still scene with her in the middle.

import { CoverDefs, FloatieGirl, Flower, LilyPad, Stitches, seeded } from "@/components/home/covers/art";

const TONES: [string, string][] = [
  ["#93a29d", "#b5c1bc"],
  ["#f7dcad", "#fbebcf"],
  ["#dfe5dc", "#fbf8f2"],
  ["#b9c4bf", "#dfe5dc"],
];

// pads scattered around the edges, leaving the middle lane for her and the corners for the words
const rnd = seeded(20261018);
const PADS = Array.from({ length: 22 }, (_, i) => {
  const lane = i % 2 === 0 ? 0.06 + rnd() * 0.26 : 0.68 + rnd() * 0.28;
  return {
    x: (i / 22) * 100 + (rnd() - 0.5) * 5,
    y: lane * 100,
    r: rnd() * 80 - 40,
    w: 70 + rnd() * 70,
    tone: Math.floor(rnd() * TONES.length),
    flower: rnd() > 0.6,
    bob: (rnd() > 0.5 ? 1 : -1) * (4 + rnd() * 6),
  };
}).filter((p) => !(p.x < 48 && p.y < 36) && !(p.x > 52 && p.y > 74) && p.y < 82);

export function PadPond() {
  return (
    <section aria-labelledby="pond-title" className="pond relative">
      <div className="pond-sticky relative h-dvh overflow-hidden" style={{ background: "radial-gradient(130% 120% at 30% 20%, #f6d9dc 0%, #f2c9ce 100%)" }}>
        <svg aria-hidden="true" className="absolute size-0">
          <CoverDefs id="pond" dot="#b83e4b" />
        </svg>

        {/* still water: ripple rings + halftone patches */}
        <svg aria-hidden="true" className="absolute inset-0 size-full">
          <rect x="62%" y="6%" width="26%" height="26%" rx="60" fill="url(#pond-dots)" opacity="0.6" />
          <rect x="6%" y="70%" width="22%" height="22%" rx="50" fill="url(#pond-dots)" opacity="0.45" />
          <g fill="none" stroke="#fbf8f2" strokeWidth="1.4" opacity="0.7">
            <ellipse cx="18%" cy="40%" rx="70" ry="22" />
            <ellipse cx="18%" cy="40%" rx="120" ry="38" opacity="0.6" />
            <ellipse cx="80%" cy="62%" rx="60" ry="19" />
            <ellipse cx="80%" cy="62%" rx="104" ry="33" opacity="0.6" />
          </g>
          <Stitches x={40} y={40} r={-14} />
          <Stitches x={900} y={560} r={16} />
        </svg>

        {/* lily pads that are pads */}
        {PADS.map((p, i) => (
          <div
            key={i}
            aria-hidden="true"
            className="pond-pad absolute"
            style={{ left: `${p.x}%`, top: `${p.y}%`, ["--bob" as string]: `${p.bob}px`, ["--r" as string]: `${p.r}deg`, ["--w" as string]: p.w + 10 }}
          >
            <svg
              viewBox={`-5 -10 ${p.w + 10} ${p.w * 0.4 + 20}`}
              className="h-auto w-[calc(var(--w)*0.62px)] overflow-visible sm:w-[calc(var(--w)*1px)]"
            >
              <LilyPad id="pond" fill={TONES[p.tone][0]} core={TONES[p.tone][1]} w={p.w} />
              {p.flower && (
                <g transform={`translate(${p.w * 0.8} ${p.w * 0.06})`}>
                  <Flower s={1.4} />
                </g>
              )}
            </svg>
          </div>
        ))}

        {/* her, drifting across as you scroll */}
        <div aria-hidden="true" className="pond-girl absolute left-0 top-[52%] w-[min(34vw,420px)] min-w-[220px]">
          <span className="pond-ring absolute left-1/2 top-1/2 aspect-[2.4] w-[120%] rounded-[50%] border-[1.5px] border-card/80" />
          <span className="pond-ring pond-ring-2 absolute left-1/2 top-1/2 aspect-[2.4] w-[120%] rounded-[50%] border-[1.5px] border-card/70" />
          <div className="relative aspect-[2]">
            <FloatieGirl id="pond" />
          </div>
        </div>

        {/* caption: real text */}
        <div className="relative z-10 flex h-full flex-col justify-between px-5 py-14 sm:px-10 sm:py-20">
          <h2 id="pond-title" className="max-w-[12ch] font-serif text-[clamp(3rem,8vw,7rem)] leading-[0.9] tracking-[-0.02em] text-blue">
            nari keeps you <em>afloat.</em>
          </h2>
          <p className="max-w-[30rem] self-end text-right text-[1.1rem] leading-relaxed text-ink">
            log a pad, check in, breathe. nari does the math and tells you, gently, when it&apos;s worth a doctor chat.
          </p>
        </div>
      </div>
    </section>
  );
}
