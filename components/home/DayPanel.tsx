"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { saveDay } from "@/lib/actions/home";
import { formatShort } from "@/lib/date";
import type { Day, ISODate, Rating } from "@/lib/types";
import { DayBars } from "@/components/ui/Bars";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Chip";
import { RatingPicker } from "@/components/ui/RatingPicker";
import { CloseIcon } from "@/components/ui/icons";

/** "day 2 · 3 pads · 1 small clot · +23 pts" */
function summary(day: Day): string {
  const parts: string[] = [];
  if (day.periodDay) parts.push(`day ${day.periodDay}`);
  if (day.pads.length) parts.push(`${day.pads.length} pad${day.pads.length === 1 ? "" : "s"}`);
  const small = day.pads.filter((p) => p.clot === "small").length;
  const large = day.pads.filter((p) => p.clot === "large").length;
  if (small) parts.push(`${small} small clot${small === 1 ? "" : "s"}`);
  if (large) parts.push(`${large} large clot${large === 1 ? "" : "s"}`);
  if (day.padPoints) parts.push(`+${day.padPoints} pts`);
  if (!parts.length) return day.isPredicted ? "predicted period day" : "nothing logged";
  return parts.join(" · ");
}

type DayPanelProps = {
  day: Day | undefined;
  today: ISODate;
  /** "panel" = desktop peach card, "sheet" = inside the phone sheet (no card, no title) */
  variant?: "panel" | "sheet";
};

export function DayPanel({ day, today, variant = "panel" }: DayPanelProps) {
  const [editing, setEditing] = useState(false);
  if (!day) return null;

  const hasBars = day.bleeding > 0 || day.energy || day.discomfort || day.mood;
  const canEdit = day.date <= today;

  const body = (
    <>
      {variant === "panel" && (
        <div>
          <h2 className="font-serif text-[2.4rem] leading-none text-blue">{formatShort(day.date)}</h2>
          <p className="mt-1.5">{summary(day)}</p>
        </div>
      )}
      {variant === "sheet" && <p className="-mt-2">{summary(day)}</p>}

      {editing ? (
        <DayEditor key={day.date} day={day} onDone={() => setEditing(false)} />
      ) : (
        <>
          {hasBars ? (
            <div className="rounded-inner bg-card p-4 sm:p-5">
              <DayBars bleeding={day.bleeding} energy={day.energy} discomfort={day.discomfort} mood={day.mood} />
            </div>
          ) : (
            <p className="rounded-inner bg-card/70 p-4 text-muted">
              {day.date > today ? "this day hasn't happened yet." : "no check-in for this day yet."}
            </p>
          )}
          {day.activities.length > 0 && (
            <ul aria-label="activities" className="flex flex-wrap gap-2">
              {day.activities.map((a) => (
                <li key={a}>
                  <Tag>{a}</Tag>
                </li>
              ))}
            </ul>
          )}
          {canEdit && (
            <Button variant="outline" className="self-start" onClick={() => setEditing(true)}>
              edit this day
            </Button>
          )}
        </>
      )}
    </>
  );

  if (variant === "sheet") return <div className="flex flex-col gap-4">{body}</div>;
  return (
    <section aria-label={`details for ${formatShort(day.date)}`} className="halftone flex flex-col gap-4 rounded-card bg-peach p-5 sm:p-6">
      {body}
    </section>
  );
}

function DayEditor({ day, onDone }: { day: Day; onDone: () => void }) {
  const [energy, setEnergy] = useState<Rating | null>(day.energy);
  const [discomfort, setDiscomfort] = useState<Rating | null>(day.discomfort);
  const [mood, setMood] = useState<Rating | null>(day.mood);
  const [activities, setActivities] = useState<string[]>(day.activities);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function addActivity() {
    const a = draft.trim().toLowerCase();
    if (a && !activities.includes(a) && activities.length < 8) setActivities([...activities, a]);
    setDraft("");
  }

  function save() {
    startTransition(async () => {
      const res = await saveDay({ date: day.date, energy, discomfort, mood, activities });
      if (res.ok) onDone();
      else setError(res.error ?? "that didn't save. try again?");
    });
  }

  return (
    <div className="flex flex-col gap-5 rounded-inner bg-card p-4 sm:p-5">
      <RatingPicker kind="energy" value={energy} onChange={setEnergy} />
      <RatingPicker kind="discomfort" value={discomfort} onChange={setDiscomfort} />
      <RatingPicker kind="mood" value={mood} onChange={setMood} />
      <p className="text-sm text-muted">
        bleeding comes from your pads.{" "}
        <Link href="/app/pad" className="font-bold text-blue underline underline-offset-4">
          log one in pad check
        </Link>
      </p>

      <div className="flex flex-col gap-2">
        <label htmlFor={`act-${day.date}`} className="font-bold">
          what did you do?
        </label>
        {activities.length > 0 && (
          <ul aria-label="activities" className="flex flex-wrap gap-2">
            {activities.map((a) => (
              <li key={a}>
                <span className="inline-flex items-center rounded-pill border border-line bg-paper pl-3.5 text-[0.9rem]">
                  {a}
                  <button
                    type="button"
                    aria-label={`remove ${a}`}
                    onClick={() => setActivities(activities.filter((x) => x !== a))}
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
          <input
            id={`act-${day.date}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addActivity();
              }
            }}
            placeholder="studied, skipped the gym…"
            maxLength={40}
            className="min-h-11 min-w-0 flex-1 rounded-[12px] border-[1.5px] border-line bg-paper px-3"
          />
          <Button variant="outline" onClick={addActivity} disabled={!draft.trim()}>
            add
          </Button>
        </div>
      </div>

      {error && (
        <p role="alert" className="font-bold text-red">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <Button onClick={save} disabled={pending}>
          {pending ? "saving…" : "save this day"}
        </Button>
        <Button variant="outline" onClick={onDone} disabled={pending}>
          cancel
        </Button>
      </div>
    </div>
  );
}
