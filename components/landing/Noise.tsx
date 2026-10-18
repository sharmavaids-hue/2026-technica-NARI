// "the noise" (ref 25): a dense collage of cut-out word scraps, the scary internet things girls
// read at 2am. As you scroll the collage parts like curtains around the girl floating calmly on
// her pad raft. CSS scroll-driven (globals.css, .noise-*); reduced motion shows it parted, still.

import { CoverDefs, FloatieGirl, seeded } from "@/components/home/covers/art";

const LOUD = [
  "is this normal", "clots??", "heavy?", "just cramps", "you're overreacting", "brown blood??", "2am", "should i worry",
  "cystic pregnancy?", "it's all in your head", "soaked through", "drink more water", "normal for some girls",
  "endometriosis?", "wait it out", "every hour?", "my mom said", "pcos?", "ignore it", "too much?", "dizzy",
  "doctor didn't listen", "stress", "hormones", "spotting", "anemia?", "worst cramps ever", "7 days??", "large clots",
  "ER or wait?", "don't google it", "is it bad", "low iron", "why so tired", "everyone gets them", "toughen up",
];
const FILLER = [
  "the", "you", "and", "maybe", "also", "just", "very", "often", "always", "never", "people", "said", "probably",
  "some", "honestly", "can", "if", "when", "feel", "body", "again", "it", "still", "or", "so", "really", "today",
];
const PAPER = ["#fbf8f2", "#f3ede3", "#ece4d6", "#ffffff", "#f6efe2", "#e9e1d3"];
const FONTS = ["font-serif", "font-sans font-bold", "font-type", "font-serif italic", "font-sans"];

type Scrap = { t: string; loud: boolean; font: string; size: number; rot: number; bg: string };

function scraps(seed: number, n: number): Scrap[] {
  const rnd = seeded(seed);
  return Array.from({ length: n }, (_, i) => {
    const loud = i % 3 === 0;
    const t = loud ? LOUD[Math.floor(rnd() * LOUD.length)] : FILLER[Math.floor(rnd() * FILLER.length)];
    return {
      t,
      loud,
      font: FONTS[Math.floor(rnd() * FONTS.length)],
      size: loud ? 1.05 + rnd() * 0.9 : 0.8 + rnd() * 0.5,
      rot: rnd() * 7 - 3.5,
      bg: PAPER[Math.floor(rnd() * PAPER.length)],
    };
  });
}

const LEFT = scraps(25, 260);
const RIGHT = scraps(52, 260);

function Half({ items, side }: { items: Scrap[]; side: "left" | "right" }) {
  return (
    <div
      aria-hidden="true"
      className={`noise-half noise-${side} absolute inset-y-0 flex w-[56%] flex-wrap content-start gap-x-1 gap-y-1.5 overflow-hidden px-2 py-3 ${
        side === "left" ? "left-0 justify-end" : "right-0 justify-start"
      }`}
    >
      {items.map((s, i) => (
        <span
          key={i}
          className={`inline-block px-1.5 leading-tight text-ink shadow-[0_1px_0_rgb(31_35_64/0.08)] ${s.font} ${s.loud ? "" : "opacity-70"}`}
          style={{ fontSize: `${s.size}rem`, transform: `rotate(${s.rot}deg)`, background: s.bg }}
        >
          {s.t}
        </span>
      ))}
    </div>
  );
}

export function Noise() {
  return (
    <section aria-labelledby="noise-title" className="noise relative">
      <div className="noise-sticky relative h-dvh overflow-hidden bg-[#e6dccc]">
        <Half items={LEFT} side="left" />
        <Half items={RIGHT} side="right" />

        {/* calm in the middle: her on the pad raft, and the one line that matters */}
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 px-6">
          <div aria-hidden="true" className="noise-girl relative aspect-[2] w-[min(70vw,360px)] -rotate-6">
            <svg className="absolute size-0">
              <CoverDefs id="noise" />
            </svg>
            <FloatieGirl id="noise" />
          </div>
          <h2
            id="noise-title"
            className="noise-line rounded-[10px] bg-paper px-5 py-3 text-center font-serif text-[clamp(2rem,5vw,3.6rem)] leading-[1.02] text-blue shadow-[0_10px_30px_-18px_rgb(31_35_64/0.5)]"
          >
            the internet is loud.
            <br />
            <em>nari is calm.</em>
          </h2>
        </div>
      </div>
    </section>
  );
}
