"use client";

import { useState, useTransition, type ReactNode } from "react";
import { signOut } from "@/lib/actions/auth";
import {
  deleteMyData,
  loadDemoData,
  resetDemoDate,
  saveQuiz,
  saveSettings,
  skipToTomorrow,
} from "@/lib/actions/settings";
import type { ActionResult, Profile, QuizAnswers } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";

const input =
  "min-h-12 w-full rounded-[14px] border-[1.5px] border-line bg-paper px-4 text-base focus-visible:border-blue";

const QUESTIONS: { key: keyof QuizAnswers; text: string }[] = [
  { key: "nosebleeds", text: "have you had nosebleeds that lasted more than 10 minutes?" },
  { key: "bruising", text: "do you bruise easily, without a clear reason?" },
  { key: "procedures", text: "have you bled a lot after dental work or surgery?" },
  { key: "family", text: "does anyone in your family have a bleeding disorder?" },
];

function Section({ id, title, intro, children }: { id: string; title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <Card as="section" aria-labelledby={id} className="flex flex-col gap-5 p-5 sm:p-7">
      <div>
        <h2 id={id} className="font-serif text-[2.1rem] leading-tight text-blue">
          {title}
        </h2>
        {intro && <p className="mt-1 max-w-[60ch] text-muted">{intro}</p>}
      </div>
      {children}
    </Card>
  );
}

/** Runs an action and shows its result in a polite live region next to the button. */
function useAction() {
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<ActionResult>, ok: string) =>
    start(async () => {
      const res = await fn();
      setMsg(res.ok ? ok : (res.error ?? "that didn't save. try again?"));
    });
  return { msg, pending, run };
}

function Status({ msg }: { msg: string }) {
  return (
    <p role="status" className="min-h-6 font-bold text-mustard">
      {msg}
    </p>
  );
}

export function SettingsView({ profile }: { profile: Profile }) {
  const [name, setName] = useState(profile.name);
  const [cycle, setCycle] = useState(String(profile.cycleLength));
  const [length, setLength] = useState(String(profile.periodLength));
  const [last, setLast] = useState(profile.lastPeriodStart ?? "");
  const [quiz, setQuiz] = useState<QuizAnswers>(profile.quiz);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const about = useAction();
  const story = useAction();
  const demo = useAction();

  return (
    <div className="mx-auto flex w-full max-w-[860px] flex-col gap-6 px-4 pb-10 pt-6 sm:px-8 lg:pt-10">
      <h1 className="font-serif text-[clamp(2.9rem,7vw,4.6rem)] leading-[0.95] text-blue">
        <em>settings.</em>
      </h1>

      <Section id="about-title" title="your cycle" intro="nari uses these to guess when your next period is coming. you can change them any time.">
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            about.run(
              () => saveSettings({ name, cycleLength: Number(cycle), periodLength: Number(length), lastPeriodStart: last || null }),
              "saved.",
            );
          }}
        >
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="s-name" className="font-bold">
              your name
            </label>
            <input id="s-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="given-name" className={input} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="s-cycle" className="font-bold">
              average cycle length
            </label>
            <input id="s-cycle" type="number" inputMode="numeric" min={15} max={60} value={cycle} onChange={(e) => setCycle(e.target.value)} aria-describedby="s-cycle-hint" className={input} />
            <span id="s-cycle-hint" className="text-sm text-muted">
              days from the start of one period to the next. most are 21–35.
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="s-length" className="font-bold">
              average period length
            </label>
            <input id="s-length" type="number" inputMode="numeric" min={1} max={14} value={length} onChange={(e) => setLength(e.target.value)} aria-describedby="s-length-hint" className={input} />
            <span id="s-length-hint" className="text-sm text-muted">
              days of bleeding. most are 2–7.
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="s-last" className="font-bold">
              last period started
            </label>
            <input id="s-last" type="date" value={last} onChange={(e) => setLast(e.target.value)} className={input} />
          </div>
          <div className="flex flex-col justify-end gap-2 sm:col-span-2">
            <Button type="submit" className="self-start" disabled={about.pending}>
              {about.pending ? "saving…" : "save cycle"}
            </Button>
            <Status msg={about.msg} />
          </div>
        </form>
      </Section>

      <Section
        id="story-title"
        title="bleeding story"
        intro="four quick questions doctors ask when periods are heavy. two or more yeses plus heavy periods is worth bringing up with a doctor."
      >
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            story.run(() => saveQuiz(quiz), "saved. nari will factor this in.");
          }}
        >
          {QUESTIONS.map((q) => (
            <fieldset key={q.key} className="flex flex-col gap-2.5">
              <legend className="mb-2.5 font-bold">{q.text}</legend>
              <div className="flex flex-wrap gap-2">
                {([
                  [true, "yes"],
                  [false, "no"],
                  [null, "not sure"],
                ] as const).map(([val, label]) => {
                  const checked = quiz[q.key] === val;
                  return (
                    <label
                      key={label}
                      className={`inline-flex min-h-11 cursor-pointer items-center rounded-pill border-[1.5px] px-5 font-bold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue ${
                        checked ? "border-blue bg-blue text-white" : "border-line bg-paper text-ink hover:border-ink"
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.key}
                        checked={checked}
                        onChange={() => setQuiz({ ...quiz, [q.key]: val })}
                        className="sr-only"
                      />
                      {label}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
          <div className="flex flex-col gap-2">
            <Button type="submit" className="self-start" disabled={story.pending}>
              {story.pending ? "saving…" : "save answers"}
            </Button>
            <Status msg={story.msg} />
          </div>
        </form>
      </Section>

      <Section id="privacy-title" title="privacy">
        <ul className="flex max-w-[62ch] list-disc flex-col gap-2 pl-5 marker:text-red">
          <li>your account is private. only you can see your data.</li>
          <li>pad photos are looked at once to suggest a soak level, then thrown away. they&apos;re never saved.</li>
          <li>the AI that reads photos and check-ins runs on a paid plan that doesn&apos;t train on what you send.</li>
          <li>no ads. we never sell your data.</li>
          <li>nari is not a doctor and doesn&apos;t diagnose. if something feels wrong, trust that and get care.</li>
        </ul>
      </Section>

      <Section
        id="demo-title"
        title="demo tools"
        intro={
          profile.dayOffset > 0
            ? `nari is running ${profile.dayOffset} day${profile.dayOffset === 1 ? "" : "s"} ahead of today, so you can see scheduled messages.`
            : "skip ahead to see the messages nari sends before and on your expected period."
        }
      >
        <div className="flex flex-wrap gap-3">
          <Button variant="solid-blue" disabled={demo.pending} onClick={() => demo.run(skipToTomorrow, "skipped to tomorrow. open chat to see today's message.")}>
            demo: skip to tomorrow
          </Button>
          {profile.dayOffset > 0 && (
            <Button variant="outline" disabled={demo.pending} onClick={() => demo.run(resetDemoDate, "back to today.")}>
              back to today
            </Button>
          )}
          <Button variant="outline" disabled={demo.pending} onClick={() => demo.run(loadDemoData, "demo data loaded: 3 past cycles and day 2 of this one.")}>
            load demo data
          </Button>
        </div>
        <Status msg={demo.msg} />
      </Section>

      <Section id="account-title" title="account">
        <div className="flex flex-wrap items-center gap-3">
          <form action={signOut}>
            <Button type="submit" variant="outline">
              sign out
            </Button>
          </form>
          <Button variant="outline" className="border-red text-red hover:bg-red/5 sm:ml-auto" onClick={() => setConfirmDelete(true)}>
            delete my data
          </Button>
        </div>
      </Section>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} title="delete everything?">
        <p>
          this deletes every period day, pad, check-in and message nari has for you, then signs you out. it can&apos;t be undone.
        </p>
        <div className="flex flex-wrap gap-3">
          <form action={deleteMyData}>
            <Button type="submit">
              yes, delete my data
            </Button>
          </form>
          <Button variant="outline" onClick={() => setConfirmDelete(false)}>
            keep my data
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
