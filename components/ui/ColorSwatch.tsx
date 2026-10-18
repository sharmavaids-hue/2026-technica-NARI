import { COLOR_SWATCH } from "@/components/padColorMeaning";
import type { PadColor } from "@/lib/types";

/** Small flat swatch for a pad color. Decorative: the word always sits next to it. */
export function ColorSwatch({ color, size = 18 }: { color: PadColor | null; size?: number }) {
  const fill = color ? COLOR_SWATCH[color] : null;
  if (!fill) {
    return (
      <span
        aria-hidden="true"
        className="inline-block shrink-0 rounded-full border-[1.5px] border-dashed border-muted"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0 rounded-full ring-1 ring-ink/15"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${fill[0]} 0 50%, ${fill[1]} 50% 100%)` }}
    />
  );
}
