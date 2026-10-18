"use client";

import { useState } from "react";
import { formatMonthDay } from "@/lib/date";
import type { DoctorData } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PatternNote, SignalCard } from "@/components/ui/SignalCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { PrintIcon } from "@/components/ui/icons";
import { ScoreExplainer } from "@/components/ui/ScoreExplainer";

const cell = (v: number | null) => (v === null ? "–" : `${v}/5`);

export function DoctorView({ data }: { data: DoctorData }) {
  const [status, setStatus] = useState("");
  const { period } = data;
  const maxPoints = Math.max(1, ...data.padsPerDay.map((p) => p.points));

  async function copy(text: string, what: string) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(`${what} copied.`);
      return true;
    } catch {
      setStatus(`couldn't copy automatically. the ${what} is shown below.`);
      return false;
    }
  }

  async function book() {
    await copy(data.visitReason, "visit reason");
    window.open(data.bookingUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mx-auto flex w-full max-w-[980px] flex-col gap-6 px-4 pb-10 pt-6 sm:px-8 lg:pt-10 print:max-w-none print:p-0">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-muted print:hidden">your numbers, in words doctors already use.</p>
          <h1 className="mt-1 font-serif text-[clamp(2.9rem,7vw,4.6rem)] leading-[0.95] text-blue">
            for your <em>doctor.</em>
          </h1>
        </div>
        <div className="no-print flex flex-wrap gap-3">
          <Button onClick={book}>book at UMD Health Center</Button>
          <Button variant="outline" onClick={() => window.print()}>
            <PrintIcon size={18} />
            save as pdf
          </Button>
        </div>
      </div>
      <p role="status" className="no-print -mt-2 min-h-6 font-bold text-mustard">
        {status}
      </p>

      <Card as="article" aria-labelledby="summary-title" className="flex flex-col gap-8 p-5 sm:p-8 print:border-0 print:p-0">
        <header className="flex flex-col gap-1 border-b border-line pb-5">
          <h2 id="summary-title" className="font-serif text-[2.2rem] leading-tight text-blue">
            {data.name ? `${data.name}'s` : "my"} period summary
          </h2>
          <p className="text-muted">
            prepared {data.generatedOn} with nari. a record to discuss, not a diagnosis.
          </p>
        </header>

        {!period ? (
          <p>no period logged yet. log a few pads and check-ins, and this page fills itself in.</p>
        ) : (
          <>
            <dl className="msg-in grid gap-5 sm:grid-cols-3" style={{ animationDelay: "80ms" }}>
              <div className="flex flex-col gap-1.5">
                <dt className="flex items-center gap-3 text-muted">
                  PBAC score
                  <ScoreExplainer score={data.score} className="-my-3 text-sm" />
                </dt>
                <dd className="font-serif text-6xl leading-none text-red">{data.score.value}</dd>
                <dd>
                  <StatusPill state={data.score.state} label={data.score.label} className="text-sm" />
                </dd>
              </div>
              <div className="flex flex-col gap-1.5">
                <dt className="text-muted">{period.isCurrent ? "this period" : "last period"}</dt>
                <dd className="font-serif text-4xl leading-none text-blue">
                  {formatMonthDay(period.start)} – {formatMonthDay(period.end)}
                </dd>
                <dd>
                  {period.length} day{period.length === 1 ? "" : "s"}
                  {period.isCurrent ? ", still going" : ""}
                </dd>
              </div>
              <div className="flex flex-col gap-1.5">
                <dt className="text-muted">most pads in one day</dt>
                <dd className="font-serif text-6xl leading-none text-blue">{data.maxPadsInADay}</dd>
              </div>
            </dl>

            <section aria-labelledby="say-title" className="msg-in halftone rounded-card bg-peach p-6 print:break-inside-avoid" style={{ animationDelay: "200ms" }}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 id="say-title" className="font-bold text-lg">
                  what to say
                </h3>
                <Button variant="outline" className="no-print" onClick={() => copy(data.script, "script")}>
                  copy the words
                </Button>
              </div>
              <blockquote className="mt-3 font-serif text-[1.75rem] leading-snug text-ink">&ldquo;{data.script}&rdquo;</blockquote>
              <p className="mt-4 text-[0.95rem]">
                <span className="font-bold">visit reason: </span>
                {data.visitReason}
              </p>
            </section>

            <section aria-labelledby="pads-title" className="msg-in flex flex-col gap-3 print:break-inside-avoid" style={{ animationDelay: "320ms" }}>
              <h3 id="pads-title" className="font-bold text-lg">
                pads per day
              </h3>
              <ul className="flex flex-col gap-2.5">
                {data.padsPerDay.map((p) => (
                  <li key={p.date} className="grid grid-cols-[4rem_1fr_7.5rem] items-center gap-3">
                    <span className="font-bold">day {p.periodDay}</span>
                    <span aria-hidden="true" className="h-3 overflow-hidden rounded-pill bg-track">
                      <span className="block h-full rounded-pill bg-red print:bg-red" style={{ width: `${(p.points / maxPoints) * 100}%` }} />
                    </span>
                    <span className="text-right tabular-nums">
                      {p.pads} pad{p.pads === 1 ? "" : "s"} · {p.points} pt{p.points === 1 ? "" : "s"}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="table-title" className="msg-in flex flex-col gap-3 print:break-inside-avoid" style={{ animationDelay: "440ms" }}>
              <h3 id="table-title" className="font-bold text-lg">
                daily check-ins
              </h3>
              <div className="overflow-x-auto rounded-inner border border-line">
                <table className="w-full min-w-[34rem] border-collapse text-left tabular-nums">
                  <caption className="sr-only">daily check-ins for this period, each rated out of 5</caption>
                  <thead className="bg-paper">
                    <tr>
                      {["day", "date", "pads", "points", "bleeding", "energy", "discomfort", "mood"].map((h) => (
                        <th key={h} scope="col" className="px-3 py-2.5 text-sm font-bold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.days.map((d) => (
                      <tr key={d.date} className="border-t border-line">
                        <th scope="row" className="px-3 py-2.5 font-bold">
                          {d.periodDay ?? "–"}
                        </th>
                        <td className="px-3 py-2.5">{formatMonthDay(d.date)}</td>
                        <td className="px-3 py-2.5">{d.pads.length}</td>
                        <td className="px-3 py-2.5">{d.padPoints}</td>
                        <td className="px-3 py-2.5">{cell(d.bleeding)}</td>
                        <td className="px-3 py-2.5">{cell(d.energy)}</td>
                        <td className="px-3 py-2.5">{cell(d.discomfort)}</td>
                        <td className="px-3 py-2.5">{cell(d.mood)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {(data.signals.length > 0 || data.patterns.length > 0) && (
          <section aria-labelledby="noticed-title" className="msg-in flex flex-col gap-3 print:break-inside-avoid" style={{ animationDelay: "560ms" }}>
            <h3 id="noticed-title" className="font-bold text-lg">
              what nari noticed
            </h3>
            <div className="grid items-start gap-4 sm:grid-cols-2">
              {data.signals.map((s) => (
                <SignalCard key={s.id} signal={s} />
              ))}
              {data.patterns.map((p) => (
                <PatternNote key={p.id} pattern={p} />
              ))}
            </div>
          </section>
        )}

        <footer className="border-t border-line pt-4 text-sm text-muted">
          scored with the pictorial blood loss assessment chart (PBAC; Higham, Shaw &amp; O&apos;Brien, 1990). 100+ points in
          one period suggests heavy menstrual bleeding. nari is not a doctor and doesn&apos;t diagnose.
        </footer>
      </Card>
    </div>
  );
}
