"use client";

import { useEffect, useRef, useState } from "react";
import { WORDS } from "./womanWords";

// "nari" means woman. Every few seconds the word backspaces and retypes itself in another
// language, in its own script. Typing goes by grapheme clusters (Intl.Segmenter) so conjuncts
// and vowel signs never split. Decorative: the real h1 says "nari, meaning woman".


const graphemes = (s: string) => {
  const seg = typeof Intl !== "undefined" && "Segmenter" in Intl ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;
  return seg ? Array.from(seg.segment(s), (x) => x.segment) : Array.from(s);
};

const HOLD = 2600;
const TYPE = 120;
const ERASE = 70;

export function WomanTypewriter() {
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(WORDS[0].word);
  const [still, setStill] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time switch to the static version
      setStill(true);
      return;
    }
    let timer = 0;
    let visible = true;
    let idx = 0;
    let parts = graphemes(WORDS[0].word);
    let n = parts.length;
    let phase: "hold" | "erase" | "type" = "hold";

    const step = () => {
      if (!visible || document.hidden) {
        timer = window.setTimeout(step, 400);
        return;
      }
      if (phase === "hold") {
        phase = "erase";
        timer = window.setTimeout(step, ERASE);
      } else if (phase === "erase") {
        n -= 1;
        setShown(parts.slice(0, Math.max(0, n)).join(""));
        if (n <= 0) {
          idx = (idx + 1) % WORDS.length;
          parts = graphemes(WORDS[idx].word);
          setI(idx);
          phase = "type";
        }
        timer = window.setTimeout(step, n <= 0 ? 260 : ERASE);
      } else {
        n += 1;
        setShown(parts.slice(0, n).join(""));
        if (n >= parts.length) {
          phase = "hold";
          timer = window.setTimeout(step, HOLD);
        } else timer = window.setTimeout(step, TYPE);
      }
    };
    timer = window.setTimeout(step, HOLD);

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    if (box.current) io.observe(box.current);
    return () => {
      window.clearTimeout(timer);
      io.disconnect();
    };
  }, []);

  if (still) {
    return (
      <div aria-hidden="true" className="flex flex-col items-center">
        <span className="font-serif text-[clamp(5rem,15vw,12rem)] leading-[0.95] text-blue">nari</span>
        <span className="font-deva text-[clamp(3rem,8vw,6rem)] leading-[1.1] text-blue">नारी</span>
        <span className="mt-3 text-[1.05rem] text-ink">
          nari · <span className="font-deva">नारी</span> · it means woman
        </span>
      </div>
    );
  }

  const w = WORDS[i];
  return (
    <div ref={box} aria-hidden="true" className="flex flex-col items-center">
      <span
        dir={w.rtl ? "rtl" : "ltr"}
        className={`${w.font} flex min-h-[1.25em] items-center whitespace-nowrap text-[clamp(4.5rem,15vw,12rem)] leading-[1.15] text-blue`}
      >
        {shown}
        <span className="type-caret ml-[0.04em] inline-block h-[0.8em] w-[0.06em] translate-y-[0.02em] bg-red" />
      </span>
      <span className={`mt-1 min-h-[1.6em] text-[1.05rem] text-ink transition-opacity duration-300 ${shown === w.word ? "" : "opacity-0"}`}>
        <span dir={w.rtl ? "rtl" : "ltr"} className={w.font === "font-serif" ? "" : w.font}>
          {w.word}
        </span>{" "}
        · {w.caption}
      </span>
    </div>
  );
}
