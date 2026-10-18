import type { Clot, PadColor, Score } from "@/lib/types";
import { COLOR_MEANING, COLOR_WORDS, LARGE_CLOT_ASK, MEANING_SOURCE } from "@/components/padColorMeaning";
import { ColorSwatch } from "@/components/ui/ColorSwatch";
import { ScoreExplainer } from "@/components/ui/ScoreExplainer";

/** "what this color usually means": rule-based copy, shown after she picks a color. */
export function ColorMeaning({ color, clot, score }: { color: PadColor; clot: Clot; score: Score }) {
  const m = COLOR_MEANING[color];
  const asks = [m.ask, clot === "large" ? LARGE_CLOT_ASK : null].filter(Boolean) as string[];
  return (
    <section aria-labelledby="meaning-title" aria-live="polite" className="halftone flex flex-col gap-3 rounded-inner bg-peach p-5">
      <h3 id="meaning-title" className="flex items-center gap-2.5 font-bold">
        <ColorSwatch color={color} size={20} />
        what {COLOR_WORDS[color]} usually means
      </h3>
      <p>{m.usually}</p>
      {asks.map((a) => (
        <p key={a} className="font-bold text-blue">
          {a}
        </p>
      ))}
      <p className="text-[0.95rem]">
        color alone is rarely a concern for doctors. what matters more: how often you&apos;re changing pads, big clots, and how you feel.
      </p>
      <div className="flex flex-wrap items-center justify-between gap-x-4">
        <p className="text-sm text-ink/75">{MEANING_SOURCE}</p>
        <ScoreExplainer score={score} className="text-sm" />
      </div>
    </section>
  );
}
