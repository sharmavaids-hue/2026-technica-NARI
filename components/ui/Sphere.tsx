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
      {/* liquid: height animates; the curved top is the meniscus */}
      <span
        className="absolute inset-x-0 bottom-0 transition-[height] duration-[1200ms] ease-[var(--ease-out-soft)]"
        style={{
          height: pct >= 100 ? "100%" : `${pct}%`,
          background: "radial-gradient(circle at 45% 20%, #cf5a67 0%, #b83e4b 50%, #8a2c38 100%)",
          borderRadius: pct >= 100 ? 0 : "50% 50% 0 0 / 10% 10% 0 0",
        }}
      />
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
