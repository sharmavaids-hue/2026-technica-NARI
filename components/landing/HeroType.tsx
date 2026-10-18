"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Each letter its own span, so the cursor can nudge it. */
function Letters({ text }: { text: string }) {
  return (
    <>
      {Array.from(text).map((ch, i) =>
        ch === " " ? (
          <span key={i} className="inline-block w-[0.22em]" />
        ) : (
          <span key={i} data-l className="inline-block will-change-transform">
            {ch}
          </span>
        ),
      )}
    </>
  );
}

/**
 * Full-bleed editorial hero (ref 21): one straight line edge to edge, one italic line riding a wave,
 * then a small "know your" next to a giant "flow" that runs off the edge.
 * Letters near a mouse cursor push away, lean and swell on a spring. Decorative: the h1 says it in words.
 */
export function HeroType() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const letters = Array.from(el.querySelectorAll<HTMLElement>("[data-l]"));
    const state = letters.map(() => ({ x: 0, y: 0, s: 1, r: 0, vx: 0, vy: 0, vs: 0, vr: 0 }));
    let centers: { x: number; y: number }[] = [];
    let mouse: { x: number; y: number } | null = null;
    let raf = 0;
    let running = false;

    const measure = () => {
      // measure without the current nudge so centers stay stable
      centers = letters.map((l) => {
        const b = l.getBoundingClientRect();
        return { x: b.left + b.width / 2 + window.scrollX, y: b.top + b.height / 2 + window.scrollY };
      });
    };

    const tick = () => {
      let moving = false;
      const R = 170;
      letters.forEach((l, i) => {
        const c = centers[i];
        const st = state[i];
        let tx = 0, ty = 0, ts = 1, tr = 0;
        if (mouse && c) {
          const dx = c.x - mouse.x;
          const dy = c.y - mouse.y;
          const d = Math.hypot(dx, dy);
          if (d < R) {
            const k = Math.pow(1 - d / R, 2);
            tx = (dx / (d || 1)) * 16 * k;
            ty = (dy / (d || 1)) * 16 * k;
            ts = 1 + 0.14 * k;
            tr = Math.max(-1, Math.min(1, dx / R)) * 7 * k;
          }
        }
        // underdamped spring: a little overshoot, then settles
        for (const [p, v, t] of [["x", "vx", tx], ["y", "vy", ty], ["s", "vs", ts], ["r", "vr", tr]] as const) {
          st[v] = (st[v] + (t - st[p]) * 0.16) * 0.72;
          st[p] += st[v];
          if (Math.abs(st[v]) > 0.002 || Math.abs(t - st[p]) > 0.002) moving = true;
        }
        l.style.transform = `translate(${st.x.toFixed(2)}px, ${st.y.toFixed(2)}px) rotate(${st.r.toFixed(2)}deg) scale(${st.s.toFixed(3)})`;
      });
      if (moving || mouse) raf = requestAnimationFrame(tick);
      else running = false;
    };
    const kick = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mouse = { x: e.pageX, y: e.pageY };
      kick();
    };
    const onLeave = () => {
      mouse = null;
      kick();
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    // fonts can land after first paint
    document.fonts?.ready.then(measure);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const line = (cls: string, delay: number, children: ReactNode) => (
    <div className={`hero-rise ${cls}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );

  return (
    <div ref={root} aria-hidden="true" className="relative z-10 -mx-4 select-none font-serif text-blue sm:-mx-10">
      {line(
        "whitespace-nowrap text-center text-[19.4vw] leading-[0.82] tracking-[-0.035em]",
        0,
        <Letters text="know your flow" />,
      )}

      {line(
        "mt-[0.5vw]",
        140,
        <svg viewBox="0 0 1000 140" className="-ml-[16%] block h-auto w-[132%] overflow-visible sm:ml-0 sm:w-full">
          <path id="hero-wave" d="M -20 112 C 170 52, 330 50, 500 88 S 840 130, 1020 60" fill="none" />
          <text className="fill-blue italic" style={{ fontSize: 104, letterSpacing: "-0.02em" }}>
            <textPath href="#hero-wave" startOffset="50%" textAnchor="middle">
              trust your body
            </textPath>
          </text>
        </svg>,
      )}

      {line(
        "-mt-[2vw] flex items-end justify-end whitespace-nowrap leading-[0.8]",
        280,
        <>
          <span className="mb-[3vw] mr-[2.5vw] flex flex-col text-right text-[9vw] italic sm:text-[6.8vw] leading-[0.92] tracking-[-0.02em]">
            <span className="block">
              <Letters text="know" />
            </span>
            <span className="block">
              <Letters text="your" />
            </span>
          </span>
          <span className="-mr-[10vw] text-[36vw] tracking-[-0.045em] sm:-mr-[8vw] sm:text-[26vw]">
            <Letters text="flow" />
          </span>
        </>,
      )}
    </div>
  );
}
