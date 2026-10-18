"use client";

import { useState } from "react";
import { formatShort } from "@/lib/date";
import type { HomeData, ISODate } from "@/lib/types";
import { Dialog } from "@/components/ui/Dialog";
import { PatternNote, SignalCard } from "@/components/ui/SignalCard";
import { Calendar } from "./Calendar";
import { DayPanel } from "./DayPanel";
import { ScoreCard } from "./ScoreCard";

function Headline({ data }: { data: HomeData }) {
  const { periodDay, daysUntilNext } = data;
  if (periodDay) {
    return (
      <>
        day {periodDay} of your <em>period.</em>
      </>
    );
  }
  if (daysUntilNext === 0) {
    return (
      <>
        your period&apos;s due <em>today.</em>
      </>
    );
  }
  if (daysUntilNext !== null && daysUntilNext > 0) {
    return (
      <>
        period in about {daysUntilNext} <em>{daysUntilNext === 1 ? "day." : "days."}</em>
      </>
    );
  }
  return (
    <>
      hi{data.profile.name ? `, ${data.profile.name}` : ""}. <em>welcome in.</em>
    </>
  );
}

export function HomeView({ data }: { data: HomeData }) {
  const [selected, setSelected] = useState<ISODate>(data.today);
  const [sheetOpen, setSheetOpen] = useState(false);
  const day = data.days.find((d) => d.date === selected);
  const urgent = data.signals.filter((s) => s.state === "urgent");
  const otherSignals = data.signals.filter((s) => s.state !== "urgent");

  function select(date: ISODate) {
    setSelected(date);
    // phones get the slide-up sheet; laptops show the side panel
    if (!window.matchMedia("(min-width: 1024px)").matches) setSheetOpen(true);
  }

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-4 pb-10 pt-6 sm:px-8 lg:gap-7 lg:pt-10">
      {/* get help now skips everything else */}
      {urgent.map((s) => (
        <SignalCard key={s.id} signal={s} />
      ))}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-muted">{data.todayLabel}</p>
          <h1 className="mt-1 font-serif text-[clamp(2.9rem,7vw,4.6rem)] leading-[0.95] text-blue">
            <Headline data={data} />
          </h1>
        </div>
        <ScoreCard score={data.score} className="self-start lg:min-w-[290px]" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-start">
        <Calendar
          days={data.days}
          today={data.today}
          selected={selected}
          onSelect={select}
          nextPeriodLabel={data.nextPeriodLabel}
          gcalUrl={data.gcalUrl}
        />

        <div className="flex flex-col gap-5">
          <div className="hidden lg:block">
            <DayPanel key={selected} day={day} today={data.today} />
          </div>
          {data.patterns.map((p) => (
            <PatternNote key={p.id} pattern={p} />
          ))}
          {otherSignals.map((s) => (
            <SignalCard key={s.id} signal={s} />
          ))}
        </div>
      </div>

      <Dialog open={sheetOpen} onClose={() => setSheetOpen(false)} variant="sheet" tone="peach" title={formatShort(selected)}>
        <DayPanel key={selected} day={day} today={data.today} variant="sheet" />
      </Dialog>
    </div>
  );
}
