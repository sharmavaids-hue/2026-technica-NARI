"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { guessPad, savePad } from "@/lib/actions/pad";
import { CLOT_POINTS, LEAK_POINTS, SOAK_POINTS, padPoints, scoreOf } from "@/lib/pbac";
import type { Clot, PadCheckData, PadFailReason, PadLog, Score, Signal, Soak } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { GetHelpContent } from "@/components/ui/GetHelp";
import { ClotIcon, PadIcon } from "@/components/ui/PadIcon";
import { SignalCard } from "@/components/ui/SignalCard";
import { ScoreSphere } from "@/components/ui/Sphere";
import { StatusPill } from "@/components/ui/StatusPill";
import { CheckIcon } from "@/components/ui/icons";
import { PadList } from "@/components/ui/PadRecord";
import { ScoreExplainer } from "@/components/ui/ScoreExplainer";
import { scoreProgress } from "@/components/ui/scoreProgress";
import { PhotoBox, type PhotoStatus } from "./PhotoBox";
import { resizePhoto } from "./resize";
import { useCountUp } from "./useCountUp";

const SOAKS: { value: Soak; label: string; hint: string }[] = [
  { value: "light", label: "light", hint: "a few spots" },
  { value: "moderate", label: "moderate", hint: "about half" },
  { value: "full", label: "full", hint: "soaked through" },
];

const CLOTS: { value: Clot; label: string }[] = [
  { value: "none", label: "none" },
  { value: "small", label: "smaller than a quarter" },
  { value: "large", label: "a quarter or bigger" },
];

const pts = (n: number) => `${n} ${n === 1 ? "pt" : "pts"}`;

function GuessTag() {
  return (
    <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-pill bg-blue px-3 py-0.5 text-sm font-bold text-white">
      nari&apos;s guess
    </span>
  );
}

export function PadCheckView({ data }: { data: PadCheckData }) {
  const [soak, setSoak] = useState<Soak | null>(null);
  const [clot, setClot] = useState<Clot>("none");
  const [leaked, setLeaked] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoStatus, setPhotoStatus] = useState<PhotoStatus>("idle");
  const [failReason, setFailReason] = useState<PadFailReason | null>(null);
  const [ai, setAi] = useState<{ soak: Soak | null; clot: Clot | null }>({ soak: null, clot: null });
  const [score, setScore] = useState<Score>(data.score);
  const [signals, setSignals] = useState<Signal[]>(data.signals);
  const [todayPads, setTodayPads] = useState<PadLog[]>(data.todayPads);
  const [saved, setSaved] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [drop, setDrop] = useState<{ key: number; pts: number } | null>(null);
  const [saving, startSave] = useTransition();
  const guessRun = useRef(0);
  const urgentRef = useRef<HTMLDivElement>(null);
  const shown = useCountUp(score.value);

  // free the in-memory photo when it changes or the page closes
  useEffect(() => () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
  }, [photoUrl]);

  const urgent = signals.filter((s) => s.state === "urgent");
  const adding = soak ? padPoints({ soak, clot, leaked }) : 0;
  const shownScore = scoreOf(shown);

  async function pickPhoto(file: File) {
    setPhotoUrl(URL.createObjectURL(file));
    setSaved("");
    setAi({ soak: null, clot: null });
    setFailReason(null);
    setPhotoStatus("looking");
    const run = ++guessRun.current;

    // 1) shrink it in the browser. Some formats (e.g. HEIC on desktop Chrome) can't be opened here.
    let jpeg: Blob;
    try {
      jpeg = await resizePhoto(file);
    } catch (err) {
      console.warn("[pad check] couldn't open this photo in the browser:", file.type || "unknown type", err);
      if (run === guessRun.current) setPhotoStatus("bad-format");
      return;
    }

    // 2) ask for a guess. Any failure falls back to picking by hand.
    try {
      const form = new FormData();
      form.append("photo", jpeg, "pad.jpg");
      const guess = await guessPad(form);
      if (run !== guessRun.current) return; // a newer photo replaced this one
      if (guess.ok && guess.soak) {
        setAi({ soak: guess.soak, clot: guess.clot });
        setSoak(guess.soak);
        if (guess.clot) setClot(guess.clot);
        setPhotoStatus("guessed");
      } else {
        console.warn(`[pad check] no guess from the server: ${guess.reason ?? "unknown"}`, `(sent ${Math.round(jpeg.size / 1024)} KB jpeg)`);
        setFailReason(guess.reason);
        setPhotoStatus("no-guess");
      }
    } catch (err) {
      console.warn("[pad check] guessPad failed:", err);
      if (run === guessRun.current) setPhotoStatus("no-guess");
    }
  }

  function clearPhoto() {
    guessRun.current++;
    setPhotoUrl(null);
    setPhotoStatus("idle");
    setAi({ soak: null, clot: null });
  }

  function save() {
    if (!soak) return;
    startSave(async () => {
      const res = await savePad({ soak, clot, leaked, aiSoak: ai.soak, aiClot: ai.clot });
      setDrop({ key: Date.now(), pts: res.added });
      setScore(res.score);
      setSignals(res.signals);
      if (res.pad.date === data.today) setTodayPads((pads) => [...pads, res.pad]);
      setSaved(`saved. +${pts(res.added)}. this period's score is now ${res.score.value}.`);
      setSoak(null);
      setClot("none");
      setLeaked(false);
      clearPhoto();
      if (res.signals.some((s) => s.state === "urgent")) {
        requestAnimationFrame(() => urgentRef.current?.scrollIntoView({ block: "start" }));
      }
    });
  }

  return (
    <div className={`mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-4 pt-6 sm:px-8 lg:pb-10 lg:pt-10 ${soak ? "pb-28" : "pb-10"}`}>
      {/* get help now skips everything else */}
      {urgent.length > 0 && (
        <div ref={urgentRef} tabIndex={-1} className="scroll-mt-6 outline-none">
          {urgent.map((s) => (
            <SignalCard key={s.id} signal={s} />
          ))}
        </div>
      )}

      <div>
        <p className="text-muted">three taps. nari guesses, you decide.</p>
        <h1 className="mt-1 font-serif text-[clamp(2.9rem,7vw,4.6rem)] leading-[0.95] text-blue">
          pad <em>check.</em>
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-start">
        <div className="flex flex-col gap-7 rounded-card border border-line bg-card p-4 sm:p-6">
          <PhotoBox url={photoUrl} onPick={pickPhoto} onClear={clearPhoto} status={photoStatus} reason={failReason} />

          <fieldset className="flex flex-col gap-4">
            <legend className="mb-4 font-serif text-[2rem] leading-none text-blue">how soaked is it?</legend>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
              {SOAKS.map((s) => {
                const checked = soak === s.value;
                return (
                  <label
                    key={s.value}
                    className={`relative flex cursor-pointer flex-col items-center gap-2 rounded-[18px] border bg-card px-1.5 pb-4 pt-5 text-center transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue ${
                      checked ? "border-[2.5px] border-red" : "border-line hover:border-ink"
                    }`}
                  >
                    {ai.soak === s.value && <GuessTag />}
                    <input
                      type="radio"
                      name="soak"
                      value={s.value}
                      checked={checked}
                      onChange={() => setSoak(s.value)}
                      className="sr-only"
                    />
                    {checked && (
                      <span aria-hidden="true" className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-red text-white">
                        <CheckIcon size={14} strokeWidth={3} />
                      </span>
                    )}
                    <PadIcon soak={s.value} size={52} />
                    <span className="font-bold text-lg">{s.label}</span>
                    <span className="flex flex-col text-sm leading-snug text-muted sm:block">
                      <span>{s.hint}</span>
                      <span className="sm:before:content-['_·_']">{pts(SOAK_POINTS[s.value])}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-4 font-serif text-[2rem] leading-none text-blue">any clots?</legend>
            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              {CLOTS.map((c) => {
                const checked = clot === c.value;
                return (
                  <label
                    key={c.value}
                    className={`relative flex min-h-14 cursor-pointer items-center gap-3 rounded-[16px] border bg-card px-4 font-bold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue ${
                      checked ? "border-[2.5px] border-red" : "border-line hover:border-ink"
                    }`}
                  >
                    {ai.clot === c.value && c.value !== "none" && <GuessTag />}
                    <input
                      type="radio"
                      name="clot"
                      value={c.value}
                      checked={checked}
                      onChange={() => setClot(c.value)}
                      className="sr-only"
                    />
                    <ClotIcon clot={c.value} />
                    <span>
                      {c.label}
                      {c.value !== "none" && ` · ${pts(CLOT_POINTS[c.value])}`}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <label className="flex min-h-11 cursor-pointer items-center gap-3 self-start">
            <input
              type="checkbox"
              checked={leaked}
              onChange={(e) => setLeaked(e.target.checked)}
              className="size-6 accent-[var(--color-red)]"
            />
            <span>
              it leaked or flooded <span className="text-muted">· {pts(LEAK_POINTS)}</span>
            </span>
          </label>
        </div>

        <div className="flex flex-col gap-5">
          <section aria-labelledby="score-title" className="flex flex-col items-center gap-2 rounded-card border border-line bg-card px-5 pb-6 pt-6 text-center">
            <div className="relative">
              <ScoreSphere size={176} fill={shownScore.fill} />
              {drop && (
                <span
                  key={drop.key}
                  aria-hidden="true"
                  onAnimationEnd={() => setDrop(null)}
                  className="chip-drop absolute left-1/2 top-0 rounded-pill bg-red px-3 py-1 font-bold text-white shadow-md"
                >
                  +{drop.pts}
                </span>
              )}
            </div>
            <h2 id="score-title" className="mt-3 flex items-center gap-3 text-muted">
              this period&apos;s score
              <ScoreExplainer score={shownScore} className="-my-3 text-sm" />
            </h2>
            <p className="font-serif text-[4.2rem] leading-[0.9] text-blue">
              <span className="tabular-nums">{shown}</span>
              <span className="ml-1 text-3xl text-muted">
                <span className="sr-only"> out of </span>
                <span aria-hidden="true">/ </span>100
              </span>
            </p>
            <p className="text-sm text-muted">{scoreProgress(shown)}</p>
            <p className="min-h-6 font-bold text-red" aria-live="polite">
              {soak ? `+${pts(adding)} with this pad` : ""}
            </p>
            <StatusPill state={score.state} label={score.label} />
            <Button size="lg" className="mt-3 w-full" onClick={save} disabled={!soak || saving}>
              {saving ? "saving…" : soak ? "save pad" : "pick how soaked it is"}
            </Button>
            <p role="status" className="min-h-6 font-bold text-mustard">
              {saved && (
                <>
                  <CheckIcon size={16} className="mr-1 inline" strokeWidth={2.5} />
                  {saved}
                </>
              )}
            </p>
            <p className="text-sm text-muted">
              scored with the PBAC chart (Higham, 1990). 100+ in one period suggests heavy bleeding.
            </p>
          </section>

          <section aria-labelledby="today-pads" className="rounded-card border border-line bg-card p-5">
            <h2 id="today-pads" className="font-serif text-[1.7rem] leading-none text-blue">
              today&apos;s pads
            </h2>
            {todayPads.length ? (
              <>
                <p className="mb-3 mt-1 text-sm text-muted">
                  {todayPads.length} pad{todayPads.length === 1 ? "" : "s"} · {todayPads.reduce((n, p) => n + p.points, 0)} pts today
                </p>
                <PadList pads={todayPads} label="today's pads" className="text-[0.95rem]" />
              </>
            ) : (
              <p className="mt-2 text-muted">nothing logged yet today. your first pad shows up here.</p>
            )}
          </section>

          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="on-dark rounded-card bg-ink p-6 text-left text-white transition-colors hover:bg-ink/90"
          >
            <span className="block text-lg font-bold">soaked a pad in under an hour, or feeling dizzy?</span>
            <span className="mt-2 block text-white/85">tap here and nari will show you where to get help right now.</span>
          </button>
        </div>
      </div>

      {/* phones: keep save within thumb reach once a soak level is picked */}
      {soak && (
        <div className="no-print fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-30 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur-sm lg:hidden">
          <Button size="lg" className="w-full" onClick={save} disabled={saving}>
            {saving ? "saving…" : `save pad · +${pts(adding)}`}
          </Button>
        </div>
      )}

      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} tone="ink" title="let's get you help.">
        <GetHelpContent />
      </Dialog>
    </div>
  );
}
