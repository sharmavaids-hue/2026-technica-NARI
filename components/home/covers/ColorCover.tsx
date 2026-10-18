"use client";

import { useEffect, useId, useState, type KeyboardEvent } from "react";
import { CoverDefs, Stitches } from "./art";

// "color me calm": a one-line drawing for the month. Pick a swatch, tap (or Enter on) a region to
// fill it with painted, grainy color. Erase, start over. Saved per month on this device.

type Region = { id: string; label: string; d: string };

const TEACUP: Region[] = [
  { id: "steam", label: "steam", d: "M112 52 C100 40 116 30 106 16 C122 26 112 40 126 50 Z" },
  { id: "tea", label: "tea", d: "M70 86 C70 80 160 80 160 86 C160 92 70 92 70 86 Z" },
  { id: "cup", label: "teacup", d: "M70 88 C72 130 92 150 115 150 C138 150 158 130 160 88 C140 96 90 96 70 88 Z" },
  { id: "handle", label: "cup handle", d: "M158 100 C182 98 184 128 156 130 L156 122 C172 120 172 108 158 108 Z" },
  { id: "saucer", label: "saucer", d: "M48 152 C70 166 160 166 182 152 C170 146 60 146 48 152 Z" },
  { id: "cap", label: "bottle cap", d: "M252 34 L284 34 L284 46 L252 46 Z" },
  { id: "neck", label: "bottle neck", d: "M256 46 L280 46 L284 70 L252 70 Z" },
  { id: "bottle", label: "hot water bottle", d: "M240 66 C252 60 284 60 296 66 C304 70 306 80 306 92 L306 150 C306 166 230 166 230 150 L230 92 C230 80 232 70 240 66 Z" },
  { id: "heart", label: "heart on the bottle", d: "M268 128 C252 116 248 100 260 98 C266 97 268 102 268 104 C268 102 270 97 276 98 C288 100 284 116 268 128 Z" },
];

const TULIPS: Region[] = [
  { id: "t1", label: "left tulip", d: "M92 70 C80 50 86 30 96 40 C100 26 112 26 114 40 C124 30 128 52 116 70 C110 80 98 80 92 70 Z" },
  { id: "t2", label: "middle tulip", d: "M168 52 C156 32 162 12 172 22 C176 8 188 8 190 22 C200 12 204 34 192 52 C186 62 174 62 168 52 Z" },
  { id: "t3", label: "right tulip", d: "M244 72 C232 52 238 32 248 42 C252 28 264 28 266 42 C276 32 280 54 268 72 C262 82 250 82 244 72 Z" },
  { id: "leaf1", label: "left leaf", d: "M150 130 C120 120 110 100 112 92 C132 98 148 112 156 128 Z" },
  { id: "leaf2", label: "right leaf", d: "M206 128 C214 110 232 100 250 96 C250 108 236 124 206 134 Z" },
  { id: "vase", label: "vase", d: "M146 134 C140 150 144 172 156 182 L208 182 C220 172 224 150 216 134 Z" },
  { id: "table", label: "table", d: "M60 182 L304 182 L310 192 L54 192 Z" },
];

// stems + details drawn as ink lines only (not colorable)
const TEACUP_LINES = "M116 58 C110 50 120 44 114 36";
const TULIPS_LINES = "M104 78 C112 100 140 120 170 136 M180 60 C182 90 182 110 182 136 M256 80 C246 100 220 120 196 136";

const ART = [
  { name: "teacup and hot water bottle", regions: TEACUP, lines: TEACUP_LINES },
  { name: "tulips in a vase", regions: TULIPS, lines: TULIPS_LINES },
];

const SWATCHES = [
  { name: "watermelon", hex: "#b83e4b" },
  { name: "peach", hex: "#f7dcad" },
  { name: "morning blue", hex: "#93a29d" },
  { name: "royal blue", hex: "#26368e" },
  { name: "mustard", hex: "#736428" },
];

const keyFor = (month: string) => `nari.coloring.${month}`;

function load(month: string): Record<string, string> {
  try {
    return JSON.parse(window.localStorage.getItem(keyFor(month)) || "{}");
  } catch {
    return {};
  }
}

export function ColorCover({ month }: { month: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const m = Number(month.slice(5));
  const art = ART[Math.floor(m / 3) % ART.length];
  const [fills, setFills] = useState<Record<string, string>>({});
  const [brush, setBrush] = useState<string | null>(SWATCHES[0].hex);
  const [said, setSaid] = useState("");

  // her saved coloring for this month (localStorage is only readable after mount)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restore saved coloring once on mount
    setFills(load(month));
  }, [month]);

  function save(next: Record<string, string>) {
    setFills(next);
    try {
      window.localStorage.setItem(keyFor(month), JSON.stringify(next));
    } catch {
      // storage blocked: coloring still works for this visit
    }
  }

  function paint(r: Region) {
    const next = { ...fills };
    if (brush) next[r.id] = brush;
    else delete next[r.id];
    save(next);
    const sw = SWATCHES.find((s) => s.hex === brush);
    setSaid(brush ? `${r.label} colored ${sw?.name}.` : `${r.label} erased.`);
  }

  const onKey = (e: KeyboardEvent<SVGPathElement>, r: Region) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      paint(r);
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "radial-gradient(120% 140% at 30% 20%, #fbf8f2 0%, #f1ebe0 100%)" }}>
      <svg aria-hidden="true" className="absolute inset-0 size-full">
        <CoverDefs id={uid} />
        <rect x="4%" y="8%" width="22%" height="40%" rx="30" fill={`url(#${uid}-dots)`} opacity="0.5" />
        <Stitches x={22} y={16} r={-12} />
      </svg>

      <svg
        viewBox="0 0 360 200"
        role="group"
        aria-label={`color me calm: ${art.name}. pick a color, then press a part of the drawing.`}
        className="absolute left-[30%] top-1 h-[54%] w-[44%] sm:inset-y-1 sm:left-[32%] sm:h-auto sm:w-[40%]"
      >
        <defs>
          <filter id={`${uid}-grain`} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5" result="g" />
            <feColorMatrix in="g" type="matrix" values="0 0 0 0 0.12  0 0 0 0 0.13  0 0 0 0 0.25  0 0 0 0.35 -0.1" result="s" />
            <feComposite in="s" in2="SourceGraphic" operator="in" result="si" />
            <feMerge>
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="si" />
            </feMerge>
          </filter>
        </defs>
        {art.regions.map((r) => (
          <path
            key={r.id}
            d={r.d}
            role="button"
            tabIndex={0}
            aria-label={`${r.label}${fills[r.id] ? `, ${SWATCHES.find((s) => s.hex === fills[r.id])?.name ?? "colored"}` : ", not colored"}`}
            onClick={() => paint(r)}
            onKeyDown={(e) => onKey(e, r)}
            filter={fills[r.id] ? `url(#${uid}-grain)` : undefined}
            className="color-region cursor-pointer outline-none"
            style={{ fill: fills[r.id] ?? "transparent" }}
            stroke="#1f2340"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        ))}
        <path d={art.lines} fill="none" stroke="#1f2340" strokeWidth="1.8" strokeLinecap="round" pointerEvents="none" />
      </svg>

      {/* palette */}
      <div className="absolute bottom-1.5 right-1.5 z-10 flex flex-col items-end gap-0.5 sm:bottom-3 sm:right-4 sm:gap-1">
        <div role="radiogroup" aria-label="colors" className="flex">
          {SWATCHES.map((s) => (
            <button
              key={s.hex}
              type="button"
              role="radio"
              aria-checked={brush === s.hex}
              aria-label={s.name}
              onClick={() => setBrush(s.hex)}
              className={`flex size-11 items-center justify-center rounded-full ${brush === s.hex ? "ring-2 ring-ink ring-offset-2 ring-offset-card" : ""}`}
            >
              <span className="size-6 rounded-full border border-ink/30 sm:size-7" style={{ background: s.hex }} />
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            role="radio"
            aria-checked={brush === null}
            onClick={() => setBrush(null)}
            className={`min-h-11 rounded-pill px-3 font-type text-[0.75rem] ${brush === null ? "bg-ink text-white" : "bg-card text-ink"}`}
          >
            erase
          </button>
          <button
            type="button"
            onClick={() => {
              save({});
              setSaid("started over.");
            }}
            className="min-h-8 rounded-pill bg-card px-2.5 font-type text-[0.75rem] text-ink"
          >
            start over
          </button>
        </div>
      </div>
      <p role="status" className="sr-only">
        {said}
      </p>
    </div>
  );
}
