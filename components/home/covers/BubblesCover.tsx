"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CoverDefs, Stitches, seeded } from "./art";

// "pop the bubbles": glossy jelly bubbles drift slowly up; popping one squishes it, bursts a few
// dots, and floats a kind note. Every bubble is a real button; "pop one" helps keyboard users.

const NOTES = [
  "drink some water",
  "you're doing great",
  "heat pad time?",
  "be gentle with yourself today",
  "stretch for 30 seconds",
  "a snack counts as self-care",
  "rest is productive too",
  "unclench your jaw",
  "you're allowed to cancel plans",
  "one slow breath in, out",
];

const TINTS = [
  ["#e58a95", "#b83e4b"],
  ["#fbebcf", "#e8bf7c"],
  ["#c7d0cc", "#6f817a"],
  ["#f2c9ce", "#c9505d"],
];

// colorway per month, so bubble months differ
const SKIES = [
  ["#eef0ec", "#d9e0dc"],
  ["#f7ecdf", "#f2dcc0"],
  ["#f3e6ea", "#e8cdd4"],
  ["#e9edf3", "#d3dbe6"],
];

type Bubble = { id: number; x: number; size: number; tint: number; dur: number; delay: number };
type Burst = { id: number; x: number; y: number; note: string; noteX: number };

export function BubblesCover({ month }: { month: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const m = Number(month.slice(5));
  const sky = SKIES[Math.floor(m / 3) % SKIES.length];

  const initial = useMemo<Bubble[]>(() => {
    const rnd = seeded(Number(month.replace("-", "")) * 7);
    return Array.from({ length: 9 }, (_, i) => ({
      id: i,
      x: 30 + (i / 9) * 64 + (rnd() - 0.5) * 6,
      size: 34 + rnd() * 34,
      tint: Math.floor(rnd() * TINTS.length),
      dur: 9 + rnd() * 7,
      delay: -rnd() * 14,
    }));
  }, [month]);

  const [bubbles, setBubbles] = useState(initial);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [popped, setPopped] = useState(0);
  const [said, setSaid] = useState("");
  const nextId = useRef(100);
  const box = useRef<HTMLDivElement>(null);

  // pause the drift while the cover is off screen
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle("bubbles-paused", !e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function pop(b: Bubble, el: HTMLElement | null) {
    const r = el?.getBoundingClientRect();
    const host = box.current?.getBoundingClientRect();
    const x = r && host ? r.left - host.left + r.width / 2 : (b.x / 100) * (host?.width ?? 300);
    const y = r && host ? r.top - host.top + r.height / 2 : (host?.height ?? 200) / 2;
    const note = NOTES[(popped + b.id) % NOTES.length];
    // keep the floating note inside the cover
    const half = Math.min(130, note.length * 4.2 + 16);
    const noteX = Math.min(Math.max(x, half), (host?.width ?? 300) - half);
    setBursts((all) => [...all.slice(-3), { id: nextId.current++, x, y, note, noteX }]);
    setPopped((n) => n + 1);
    setSaid(`popped. ${note}.`);
    // a new bubble rises from the bottom to take its place
    setBubbles((all) => all.map((x) => (x.id === b.id ? { ...x, id: nextId.current++, delay: 0 } : x)));
  }

  return (
    <div
      ref={box}
      role="group"
      aria-label="pop the bubbles. each one has a kind note inside."
      className="absolute inset-0 overflow-hidden"
      style={{ background: `radial-gradient(120% 140% at 70% 20%, ${sky[0]} 0%, ${sky[1]} 100%)` }}
    >
      <svg aria-hidden="true" className="absolute inset-0 size-full">
        <CoverDefs id={uid} />
        <rect x="56%" y="10%" width="24%" height="40%" rx="40" fill={`url(#${uid}-dots)`} opacity="0.6" />
        <rect x="6%" y="64%" width="16%" height="30%" rx="30" fill={`url(#${uid}-dots)`} opacity="0.45" />
        <Stitches x={20} y={16} r={-12} />
        <Stitches x={330} y={168} r={18} color="#26368e" />
      </svg>

      {bubbles.map((b) => {
        const [hi, lo] = TINTS[b.tint];
        return (
          <button
            key={b.id}
            type="button"
            aria-label="pop bubble"
            onClick={(e) => pop(b, e.currentTarget)}
            className="bubble absolute bottom-0 rounded-full"
            style={{
              left: `${b.x}%`,
              width: b.size,
              height: b.size,
              animationDuration: `${b.dur}s`,
              animationDelay: `${b.delay}s`,
              ["--rest" as string]: `${-20 - ((b.id * 37) % 110)}px`,
              background: `radial-gradient(circle at 32% 28%, rgb(255 255 255 / 0.95) 0%, rgb(255 255 255 / 0.3) 14%, transparent 30%),
                radial-gradient(circle at 70% 75%, rgb(180 210 255 / 0.35) 0%, transparent 40%),
                radial-gradient(circle at 45% 45%, ${hi} 0%, ${lo} 100%)`,
              boxShadow: `inset -3px -5px 10px rgb(31 35 64 / 0.18), inset 2px 3px 6px rgb(255 255 255 / 0.4)`,
            }}
          />
        );
      })}

      {bursts.map((p) => (
        <div
          key={p.id}
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{ left: p.x, top: p.y }}
        >
          <span className="pop-ring absolute size-10 rounded-full border-2 border-card" />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <span key={a} className="burst-dot absolute size-1.5 rounded-full bg-red" style={{ ["--a" as string]: `${a}deg` }} />
          ))}
          <span
            onAnimationEnd={() => setBursts((all) => all.filter((x) => x.id !== p.id))}
            style={{ left: p.noteX - p.x }}
            className="pop-note absolute -translate-x-1/2 whitespace-nowrap rounded-pill bg-card px-3 py-1 font-type text-[0.8rem] text-ink shadow-sm">
            {p.note}
          </span>
        </div>
      ))}

      <div className="absolute bottom-2.5 right-3 z-10 flex items-center gap-2 sm:bottom-4 sm:right-5">
        <span aria-hidden="true" className="font-type text-[0.8rem] text-ink/80">
          {popped} popped
        </span>
        <button
          type="button"
          onClick={() => {
            const b = bubbles[popped % bubbles.length];
            pop(b, box.current?.querySelectorAll<HTMLElement>(".bubble")[popped % bubbles.length] ?? null);
          }}
          className="sr-only-focusable min-h-11 rounded-pill bg-card px-3 text-sm font-bold text-blue"
        >
          pop one
        </button>
      </div>
      <p role="status" className="sr-only">
        {said}
      </p>
    </div>
  );
}
