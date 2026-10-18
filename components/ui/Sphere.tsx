import type { CSSProperties } from "react";

type SphereProps = {
  /** diameter in px */
  size: number;
  /** with a soft cast shadow underneath */
  shadow?: boolean;
  className?: string;
  /** decorative by default; pass a label when the sphere means something on its own */
  label?: string;
};

/** Nari's glossy watermelon sphere. The identity object: logo dot, period days, avatar. */
export function Sphere({ size, shadow = false, className = "", label }: SphereProps) {
  const style = { width: size, height: size, "--s": `${size}px` } as CSSProperties;
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };

  if (!shadow) return <span className={`sphere inline-block shrink-0 ${className}`} style={style} {...a11y} />;

  return (
    <span className={`relative inline-block shrink-0 ${className}`} style={{ width: size, height: size }} {...a11y}>
      <span
        className="sphere-shadow absolute left-[12%] w-[90%]"
        style={{ height: size * 0.22, top: size * 0.9 }}
      />
      <span className="sphere absolute inset-0" style={style} />
    </span>
  );
}

type ScoreSphereProps = {
  size: number;
  /** 0–1, how full the sphere is (score / 100, capped) */
  fill: number;
  className?: string;
};

/**
 * Watermelon liquid with a soft wave on top. Twice as wide as its box so it can slosh sideways;
 * the slosh plays once when it mounts (a new level remounts it), never on its own.
 */
export function WaveLiquid() {
  return (
    <svg className="liquid-wave absolute -left-1/2 -top-[7%] h-[107%] w-[200%]" viewBox="0 0 400 107" preserveAspectRatio="none">
      <defs>
        <linearGradient id="liquid-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cf5a67" />
          <stop offset="0.45" stopColor="#b83e4b" />
          <stop offset="1" stopColor="#8a2c38" />
        </linearGradient>
      </defs>
      <path
        d="M0 7 C 25 1, 50 1, 75 7 S 125 13, 150 7 S 200 1, 225 7 S 275 13, 300 7 S 350 1, 375 7 S 400 10, 400 10 V 107 H 0 Z"
        fill="url(#liquid-fill)"
      />
      <path
        d="M0 7 C 25 1, 50 1, 75 7 S 125 13, 150 7 S 200 1, 225 7 S 275 13, 300 7 S 350 1, 375 7"
        fill="none"
        stroke="#e58a95"
        strokeWidth="1.6"
        opacity="0.8"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * The period score sphere: glass globe that fills with red toward 100.
 * Purely visual; the number and state words always sit next to it.
 */
export function ScoreSphere({ size, fill, className = "" }: ScoreSphereProps) {
  const pct = Math.max(0, Math.min(1, fill)) * 100;
  return (
    <span
      aria-hidden="true"
      className={`relative inline-block shrink-0 overflow-hidden rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: "radial-gradient(circle at 38% 30%, #f3ede3 0%, #e6ddcf 60%, #d7ccba 100%)",
        boxShadow: `inset ${-size * 0.05}px ${-size * 0.06}px ${size * 0.14}px rgb(31 35 64 / 0.12)`,
      }}
    >
      {/* liquid: the level rises with a spring; the wave sloshes when the level changes, then settles */}
      <span
        className="liquid-level absolute inset-0"
        style={{ transform: `translateY(${pct >= 100 ? -6 : 100 - pct}%)` }}
      >
        <WaveLiquid key={Math.round(pct)} />
      </span>
      {/* gloss on top of everything */}
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 24%, rgb(255 255 255 / 0.75) 0%, rgb(255 255 255 / 0.2) 12%, transparent 26%)",
          boxShadow: `inset ${-size * 0.04}px ${-size * 0.07}px ${size * 0.12}px rgb(70 14 24 / 0.22)`,
        }}
      />
    </span>
  );
}
