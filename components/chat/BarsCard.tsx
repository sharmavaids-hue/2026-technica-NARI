"use client";

import { useState, useTransition } from "react";
import type { ChatCard, Rating } from "@/lib/types";
import { DayBars } from "@/components/ui/Bars";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Chip";
import { RatingPicker } from "@/components/ui/RatingPicker";
import { CheckIcon, CloseIcon } from "@/components/ui/icons";

type Bars = Extract<ChatCard, { type: "bars" }>;
type Values = { energy: Rating | null; discomfort: Rating | null; mood: Rating | null; activities: string[] };

type BarsCardProps = {
  title: string;
  card: Bars;
  onConfirm: (values: Values) => Promise<void>;
};

/** "got it. here's what i heard:" with looks right / adjust. Gemini failed → opens straight into adjust. */
export function BarsCard({ title, card, onConfirm }: BarsCardProps) {
  const [adjusting, setAdjusting] = useState(card.manual && !card.confirmed);
  const [v, setV] = useState<Values>({
    energy: card.energy,
    discomfort: card.discomfort,
    mood: card.mood,
    activities: card.activities,
  });
  const [pending, startTransition] = useTransition();

  const confirm = (values: Values) => startTransition(() => onConfirm(values));

  return (
    <div className="flex w-full max-w-[24rem] flex-col gap-4 rounded-[22px] border border-line bg-card p-5">
      <p className="font-bold">{title}</p>

      {adjusting && !card.confirmed ? (
        <>
          <RatingPicker kind="energy" value={v.energy} onChange={(energy) => setV({ ...v, energy })} />
          <RatingPicker kind="discomfort" value={v.discomfort} onChange={(discomfort) => setV({ ...v, discomfort })} />
          <RatingPicker kind="mood" value={v.mood} onChange={(mood) => setV({ ...v, mood })} />
          {v.activities.length > 0 && (
            <ul aria-label="activities" className="flex flex-wrap gap-2">
              {v.activities.map((a) => (
                <li key={a}>
                  <span className="inline-flex items-center rounded-pill border border-line bg-paper pl-3.5 text-[0.9rem]">
                    {a}
                    <button
                      type="button"
                      aria-label={`remove ${a}`}
                      onClick={() => setV({ ...v, activities: v.activities.filter((x) => x !== a) })}
                      className="inline-flex size-9 items-center justify-center rounded-full"
                    >
                      <CloseIcon size={14} />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <Button onClick={() => confirm(v)} disabled={pending}>
              {pending ? "saving…" : "save"}
            </Button>
            {!card.manual && (
              <Button variant="outline" onClick={() => setAdjusting(false)} disabled={pending}>
                cancel
              </Button>
            )}
          </div>
        </>
      ) : (
        <>
          <DayBars bleeding={null} energy={card.energy} discomfort={card.discomfort} mood={card.mood} kinds={["energy", "discomfort", "mood"]} compact />
          {card.activities.length > 0 && (
            <ul aria-label="activities" className="flex flex-wrap gap-2">
              {card.activities.map((a) => (
                <li key={a}>
                  <Tag className="border border-line">{a}</Tag>
                </li>
              ))}
            </ul>
          )}
          {card.confirmed ? (
            <p className="flex items-center gap-1.5 font-bold text-mustard">
              <CheckIcon size={16} strokeWidth={2.5} />
              saved to your calendar
            </p>
          ) : (
            <div className="flex gap-2">
              <Button onClick={() => confirm(v)} disabled={pending}>
                {pending ? "saving…" : "looks right"}
              </Button>
              <Button variant="outline" onClick={() => setAdjusting(true)} disabled={pending}>
                adjust
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
