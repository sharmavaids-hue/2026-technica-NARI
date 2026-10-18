"use client";

import { useEffect, useMemo, useRef, useState, useTransition, type KeyboardEvent } from "react";
import { setPeriodDay } from "@/lib/actions/home";
import { addDays, weekdayMon0 } from "@/lib/date";
import type { Day, ISODate } from "@/lib/types";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@/components/ui/icons";
import { MonthCover, setCoverHidden, useCoverHidden } from "./covers/MonthCover";

const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const WEEKDAYS_LONG = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const monthOf = (d: ISODate) => d.slice(0, 7);
const monthFmt = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" });
function monthName(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return monthFmt.format(new Date(Date.UTC(y, m - 1, 1))).toLowerCase();
}
function shiftMonth(ym: string, n: number) {
  const [y, m] = ym.split("-").map(Number);
  const t = y * 12 + (m - 1) + n;
  return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, "0")}`;
}

type CalendarProps = {
  days: Day[];
  today: ISODate;
  selected: ISODate;
  onSelect: (date: ISODate) => void;
  nextPeriodLabel: string | null;
  gcalUrl: string | null;
};

export function Calendar({ days, today, selected, onSelect, nextPeriodLabel, gcalUrl }: CalendarProps) {
  const byDate = useMemo(() => new Map(days.map((d) => [d.date, d])), [days]);
  const minMonth = monthOf(days[0]?.date ?? today);
  const maxMonth = monthOf(days[days.length - 1]?.date ?? today);

  const [month, setMonth] = useState(monthOf(selected));
  const [focused, setFocused] = useState<ISODate>(selected);
  const [editing, setEditing] = useState(false);
  const coverHidden = useCoverHidden();
  const [status, setStatus] = useState("");
  const [pendingDate, setPendingDate] = useState<ISODate | null>(null);
  const [, startTransition] = useTransition();
  const cellRefs = useRef(new Map<ISODate, HTMLButtonElement>());
  const keyboardMove = useRef(false);

  // grid for the visible month: leading blanks + every date
  const first = `${month}-01`;
  const dates: ISODate[] = [];
  for (let d = first; monthOf(d) === month; d = addDays(d, 1)) dates.push(d);
  const blanks = weekdayMon0(first);

  const tabStop = monthOf(focused) === month ? focused : dates.includes(today) ? today : first;

  useEffect(() => {
    if (!keyboardMove.current) return;
    keyboardMove.current = false;
    cellRefs.current.get(focused)?.focus();
  }, [focused, month]);

  function moveTo(d: ISODate) {
    if (!byDate.has(d)) return;
    keyboardMove.current = true;
    setFocused(d);
    if (monthOf(d) !== month) setMonth(monthOf(d));
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, d: ISODate) {
    const step: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key in step) {
      e.preventDefault();
      moveTo(addDays(d, step[e.key]));
    } else if (e.key === "Home") {
      e.preventDefault();
      moveTo(addDays(d, -weekdayMon0(d)));
    } else if (e.key === "End") {
      e.preventDefault();
      moveTo(addDays(d, 6 - weekdayMon0(d)));
    }
  }

  function tap(day: Day) {
    setFocused(day.date);
    if (!editing) {
      onSelect(day.date);
      return;
    }
    if (day.date > today) return;
    const next = !day.isPeriod;
    setPendingDate(day.date);
    startTransition(async () => {
      const res = await setPeriodDay(day.date, next);
      setPendingDate(null);
      setStatus(res.ok ? `${day.ariaLabel.split(",")[0]} ${next ? "added to" : "removed from"} your period.` : (res.error ?? "that didn't save. try again?"));
    });
  }

  const canPrev = month > minMonth;
  const canNext = month < maxMonth;

  return (
    <section aria-labelledby="cal-month" className="rounded-card border border-line bg-card p-4 sm:p-6">
      {!coverHidden && <MonthCover key={month} month={month} />}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setMonth(shiftMonth(month, -1))}
            disabled={!canPrev}
            aria-label="previous month"
            className="flex size-11 items-center justify-center rounded-full border-[1.5px] border-ink disabled:opacity-30"
          >
            <ChevronLeftIcon size={18} />
          </button>
          <h2
            id="cal-month"
            aria-live="polite"
            className={coverHidden ? "min-w-[6.5ch] text-center font-serif text-[2.1rem] leading-none text-blue sm:text-[2.5rem]" : "sr-only"}
          >
            {monthName(month)}
          </h2>
          <button
            type="button"
            onClick={() => setMonth(shiftMonth(month, 1))}
            disabled={!canNext}
            aria-label="next month"
            className="flex size-11 items-center justify-center rounded-full border-[1.5px] border-ink disabled:opacity-30"
          >
            <ChevronRightIcon size={18} />
          </button>
        </div>
        <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setCoverHidden(!coverHidden)}
          className="min-h-11 px-1 text-sm font-bold text-blue underline underline-offset-4"
        >
          {coverHidden ? "show cover" : "hide cover"}
        </button>
        <Button
          variant={editing ? "solid-blue" : "outline"}
          aria-pressed={editing}
          onClick={() => {
            setEditing(!editing);
            setStatus(editing ? "done editing period days." : "editing period days. tap a day to add or remove it.");
          }}
        >
          {editing ? "done" : "edit period days"}
        </Button>
        </div>
      </div>

      {editing && (
        <p className="mt-3 rounded-[12px] bg-peach px-4 py-2.5 text-[0.95rem]">
          tap days to add or remove them from your period. days with pads logged stay.
        </p>
      )}

      <div role="grid" aria-labelledby="cal-month" className="mt-4">
        <div role="row" className="grid grid-cols-7">
          {WEEKDAYS.map((w, i) => (
            <span key={w} role="columnheader" aria-label={WEEKDAYS_LONG[i]} className="py-2 text-center text-sm font-bold text-muted">
              {w}
            </span>
          ))}
        </div>
        {Array.from({ length: Math.ceil((blanks + dates.length) / 7) }, (_, row) => (
          <div role="row" key={row} className="grid grid-cols-7">
            {Array.from({ length: 7 }, (_, col) => {
              const idx = row * 7 + col - blanks;
              const date = dates[idx];
              if (!date) return <span role="gridcell" key={col} />;
              const day = byDate.get(date);
              const n = Number(date.slice(8));
              if (!day) {
                return (
                  <span role="gridcell" key={col} className="flex h-14 items-center justify-center text-muted/50 sm:h-[4.5rem]">
                    {n}
                  </span>
                );
              }
              const isSelected = !editing && date === selected;
              const future = date > today;
              const lockedInEdit = editing && future;
              return (
                <span role="gridcell" key={col} className="flex items-center justify-center py-1">
                  <button
                    ref={(el) => {
                      if (el) cellRefs.current.set(date, el);
                      else cellRefs.current.delete(date);
                    }}
                    type="button"
                    tabIndex={date === tabStop ? 0 : -1}
                    aria-pressed={editing ? day.isPeriod : isSelected}
                    aria-disabled={lockedInEdit || undefined}
                    aria-busy={pendingDate === date || undefined}
                    aria-label={editing ? `${day.ariaLabel}${lockedInEdit ? ", future day" : day.isPeriod ? ", tap to remove" : ", tap to add"}` : day.ariaLabel}
                    onClick={() => !lockedInEdit && tap(day)}
                    onKeyDown={(e) => onKeyDown(e, date)}
                    className={`relative flex size-12 items-center justify-center rounded-[14px] sm:size-[3.75rem] ${
                      isSelected ? "bg-peach" : editing && !future ? "hover:bg-ink/5" : "hover:bg-ink/5"
                    } ${day.isToday ? "ring-2 ring-ink ring-inset" : ""} ${lockedInEdit ? "cursor-not-allowed opacity-40" : ""} ${
                      pendingDate === date ? "animate-pulse" : ""
                    }`}
                  >
                    {day.isPeriod ? (
                      <span
                        aria-hidden="true"
                        className="sphere pop-in flex size-10 items-center justify-center font-bold text-white sm:size-12"
                        style={{ ["--s" as string]: "48px", animationDelay: `${((day.periodDay ?? 1) - 1) * 90}ms` }}
                      >
                        {n}
                      </span>
                    ) : day.isPredicted ? (
                      <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-full border-2 border-dashed border-red font-bold text-red sm:size-12">
                        {n}
                      </span>
                    ) : (
                      <span aria-hidden="true" className={`flex size-10 items-center justify-center rounded-full font-bold sm:size-12 ${editing && !future ? "border border-dashed border-line" : ""}`}>
                        {n}
                      </span>
                    )}
                  </button>
                </span>
              );
            })}
          </div>
        ))}
      </div>

      <p role="status" className="sr-only">
        {status}
      </p>
      {editing && status && !status.startsWith("editing") && (
        <p aria-hidden="true" className="mt-2 text-sm text-muted">
          {status}
        </p>
      )}

      <ul aria-label="legend" className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[0.95rem]">
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="sphere inline-block size-4" style={{ ["--s" as string]: "16px" }} />
          period
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="inline-block size-4 rounded-full border-2 border-dashed border-red" />
          predicted
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="inline-block size-4 rounded-[5px] border-2 border-ink" />
          today
        </li>
      </ul>

      {nextPeriodLabel && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-line pt-5">
          <p>
            next period around <strong>{nextPeriodLabel}</strong>
          </p>
          {gcalUrl && (
            <ButtonLink href={gcalUrl} external variant="outline-blue">
              <PlusIcon size={18} />
              add to google calendar
            </ButtonLink>
          )}
        </div>
      )}
    </section>
  );
}
