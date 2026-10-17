import { Sphere } from "./Sphere";

/** "nari." with the glossy sphere as the period. Size is the font size in px. */
export function Wordmark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`inline-flex items-baseline font-serif leading-none text-blue ${className}`}
      style={{ fontSize: size }}
    >
      <span aria-hidden="true">nari</span>
      <Sphere size={Math.round(size * 0.3)} className="ml-[0.04em]" />
      <span className="sr-only">nari</span>
    </span>
  );
}
