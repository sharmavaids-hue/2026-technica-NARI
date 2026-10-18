"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { CoverDefs, FloatieGirl, Flower, LilyPad, Stitches, seeded } from "./art";

// four colorways for the pink sea, picked by month so consecutive swim months differ
const WAYS = [
  { water: ["#f6d9dc", "#f2c9ce"], pads: [["#93a29d", "#b5c1bc"], ["#f7dcad", "#fbebcf"], ["#dfe5dc", "#fbf8f2"]] },
  { water: ["#f8e1dc", "#f3cdc9"], pads: [["#f7dcad", "#fbebcf"], ["#93a29d", "#c7d0cc"], ["#fbf8f2", "#f3ede3"]] },
  { water: ["#f6dade", "#efc4cb"], pads: [["#b9b48f", "#d9d5b8"], ["#fbf8f2", "#f1ebe0"], ["#93a29d", "#b5c1bc"]] },
  { water: ["#f7dfe0", "#f1cbd0"], pads: [["#9fb0b6", "#c4ced1"], ["#f7dcad", "#fbebcf"], ["#dfe5dc", "#fbf8f2"]] },
];

type Pad = { x: number; y: number; r: number; w: number; tone: number; flower: boolean };
type Ripple = { id: number; x: number; y: number };

export function SwimCover({ month }: { month: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const m = Number(month.slice(5));
  const way = WAYS[Math.floor(m / 3) % WAYS.length];

  // stable scatter of lily pads for this month
  const pads = useMemo<Pad[]>(() => {
    const rnd = seeded(Number(month.replace("-", "")));
    return Array.from({ length: 7 }, (_, i) => ({
      x: 0.32 + (i / 7) * 0.62 + (rnd() - 0.5) * 0.06,
      y: 0.15 + rnd() * 0.7,
      r: rnd() * 70 - 35,
      w: 54 + rnd() * 30,
      tone: Math.floor(rnd() * 3),
      flower: rnd() > 0.55,
    }));
  }, [month]);

  const box = useRef<HTMLDivElement>(null);
  const girl = useRef<HTMLDivElement>(null);
  const padEls = useRef<(HTMLDivElement | null)[]>([]);
  const target = useRef({ x: 0.62, y: 0.5 });
  const pos = useRef({ x: 0.62, y: 0.5, a: 0, vx: 0, vy: 0 });
  const lastInput = useRef(0);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const rippleId = useRef(0);

  useEffect(() => {
    const el = box.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let running = true;
    let prev = performance.now();
    let lastRipple = 0;
    const offs = pads.map(() => ({ x: 0, y: 0 }));

    const tick = (now: number) => {
      const dt = Math.min(48, now - prev) / 16.67;
      prev = now;
      const { width: W, height: H } = el.getBoundingClientRect();
      const p = pos.current;

      // drift somewhere calm on her own after a few quiet seconds
      if (now - lastInput.current > 4000 && Math.hypot(target.current.x - p.x, target.current.y - p.y) < 0.02) {
        target.current = { x: 0.35 + Math.random() * 0.5, y: 0.3 + Math.random() * 0.45 };
        lastInput.current = now - 1500;
      }

      // soft spring toward the target
      const ax = (target.current.x - p.x) * 0.0016 * W;
      const ay = (target.current.y - p.y) * 0.0016 * H;
      p.vx = (p.vx + ax * dt) * Math.pow(0.9, dt);
      p.vy = (p.vy + ay * dt) * Math.pow(0.9, dt);
      p.x += (p.vx * dt) / W;
      p.y += (p.vy * dt) / H;
      const speed = Math.hypot(p.vx, p.vy);
      if (speed > 0.25) {
        const want = (Math.atan2(p.vy, p.vx) * 180) / Math.PI;
        let d = ((want - p.a + 540) % 360) - 180;
        d = Math.max(-6, Math.min(6, d * 0.08 * dt));
        p.a += d;
      }
      const gx = p.x * W;
      const gy = p.y * H;
      // heading left: mirror her instead of turning her upside down
      const a = ((p.a % 360) + 540) % 360 - 180;
      const flip = Math.abs(a) > 90;
      const shown = flip ? a - 180 * Math.sign(a) : a;
      if (girl.current) girl.current.style.transform = `translate(${gx}px, ${gy}px) translate(-50%, -50%) rotate(${shown}deg) scaleX(${flip ? -1 : 1})`;

      // ripples trail behind while she moves
      if (speed > 0.6 && now - lastRipple > 260) {
        lastRipple = now;
        const id = ++rippleId.current;
        setRipples((r) => [...r.slice(-5), { id, x: gx, y: gy }]);
      }

      // lily pads bob and get nudged out of her way
      pads.forEach((pad, i) => {
        const node = padEls.current[i];
        if (!node) return;
        const px = pad.x * W;
        const py = pad.y * H;
        const dx = px - gx;
        const dy = py - gy;
        const dist = Math.hypot(dx, dy) || 1;
        const reach = 85;
        const push = dist < reach ? ((reach - dist) / reach) * 22 : 0;
        const o = offs[i];
        o.x += ((dx / dist) * push - o.x) * 0.08 * dt;
        o.y += ((dy / dist) * push - o.y) * 0.08 * dt;
        const bob = Math.sin(now / 1500 + i * 1.7) * 1.6;
        node.style.transform = `translate(${px + o.x}px, ${py + o.y + bob}px) translate(-50%, -50%) rotate(${pad.r + o.x * 0.6}deg)`;
      });

      if (running) raf = requestAnimationFrame(tick);
    };

    // only animate while the cover is on screen
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) {
        running = true;
        prev = performance.now();
        raf = requestAnimationFrame(tick);
      } else if (!e.isIntersecting) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(el);
    raf = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [pads]);

  function aim(e: PointerEvent<HTMLDivElement>) {
    // mouse: follow the cursor; touch/pen: follow while pressed or dragging
    if (e.pointerType !== "mouse" && e.buttons === 0 && e.type === "pointermove") return;
    const r = e.currentTarget.getBoundingClientRect();
    target.current = {
      x: Math.min(0.94, Math.max(0.06, (e.clientX - r.left) / r.width)),
      y: Math.min(0.88, Math.max(0.12, (e.clientY - r.top) / r.height)),
    };
    lastInput.current = performance.now();
  }

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const step: Record<string, [number, number]> = { ArrowLeft: [-0.08, 0], ArrowRight: [0.08, 0], ArrowUp: [0, -0.14], ArrowDown: [0, 0.14] };
    const s = step[e.key];
    if (!s) return;
    e.preventDefault();
    target.current = {
      x: Math.min(0.94, Math.max(0.06, target.current.x + s[0])),
      y: Math.min(0.88, Math.max(0.12, target.current.y + s[1])),
    };
    lastInput.current = performance.now();
  }

  return (
    <div
      ref={box}
      role="group"
      aria-roledescription="mini game"
      aria-label="swim with her. move your cursor, tap, or use the arrow keys and she swims there."
      tabIndex={0}
      onPointerMove={aim}
      onPointerDown={aim}
      onKeyDown={onKey}
      className="swim-cover absolute inset-0 touch-none overflow-hidden"
      style={{ background: `radial-gradient(120% 140% at 70% 30%, ${way.water[0]} 0%, ${way.water[1]} 100%)` }}
    >
      {/* still water details: ripple rings, halftone patch, stitches */}
      <svg aria-hidden="true" className="absolute inset-0 size-full" preserveAspectRatio="none">
        <CoverDefs id={uid} dot="#b83e4b" />
        <rect x="58%" y="8%" width="22%" height="38%" rx="40" fill={`url(#${uid}-dots)`} opacity="0.7" />
        <rect x="8%" y="62%" width="18%" height="30%" rx="30" fill={`url(#${uid}-dots)`} opacity="0.5" />
      </svg>
      <svg aria-hidden="true" className="absolute inset-0 size-full">
        <CoverDefs id={`${uid}b`} />
        <g fill="none" stroke="#fbf8f2" strokeWidth="1.3" opacity="0.75">
          <ellipse cx="78%" cy="30%" rx="38" ry="12" />
          <ellipse cx="78%" cy="30%" rx="62" ry="20" opacity="0.6" />
          <ellipse cx="44%" cy="78%" rx="30" ry="9" />
          <ellipse cx="44%" cy="78%" rx="52" ry="16" opacity="0.6" />
        </g>
        <Stitches x={18} y={14} r={-12} />
        <Stitches x={330} y={168} r={18} />
      </svg>

      {/* trailing ripples */}
      {ripples.map((r) => (
        <span
          key={r.id}
          aria-hidden="true"
          onAnimationEnd={() => setRipples((all) => all.filter((x) => x.id !== r.id))}
          className="swim-ripple pointer-events-none absolute size-8 rounded-[50%] border-[1.5px] border-card/80"
          style={{ left: r.x, top: r.y }}
        />
      ))}

      {/* lily pads (positioned by the animation loop; static fallback via percentages) */}
      {pads.map((p, i) => (
        <div
          key={i}
          ref={(n) => {
            padEls.current[i] = n;
          }}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0"
          style={{ transform: `translate(${p.x * 100}cqw, ${p.y * 100}cqh) translate(-50%, -50%) rotate(${p.r}deg)` }}
        >
          <svg width={p.w + 8} height={p.w * 0.4 + 16} viewBox={`-4 -8 ${p.w + 8} ${p.w * 0.4 + 16}`} className="overflow-visible">
            <LilyPad id={uid} fill={way.pads[p.tone][0]} core={way.pads[p.tone][1]} w={p.w} />
            {p.flower && (
              <g transform={`translate(${p.w * 0.78} ${p.w * 0.08})`}>
                <Flower s={1.1} />
              </g>
            )}
          </svg>
        </div>
      ))}

      {/* her */}
      <div
        ref={girl}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 h-[4.6rem] w-[9.2rem] sm:h-[6rem] sm:w-[12rem]"
        style={{ transform: "translate(62cqw, 50cqh) translate(-50%, -50%)" }}
      >
        <svg className="absolute size-0" aria-hidden="true">
          <CoverDefs id={`${uid}g`} />
        </svg>
        <FloatieGirl id={`${uid}g`} />
      </div>
    </div>
  );
}
