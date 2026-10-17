import type { Metadata } from "next";
import { DayBars } from "@/components/ui/Bars";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip, Tag } from "@/components/ui/Chip";
import { ClotIcon, PadIcon } from "@/components/ui/PadIcon";
import { ScoreSphere, Sphere } from "@/components/ui/Sphere";
import { StatusPill } from "@/components/ui/StatusPill";
import { Wordmark } from "@/components/ui/Wordmark";
import { CalendarIcon, CameraIcon, ChatIcon, DoctorIcon, SettingsIcon } from "@/components/ui/icons";
import { STATE_LABELS } from "@/lib/pbac";
import type { ResultState } from "@/lib/types";

// Dev-only reference sheet for the M0 building blocks. Not linked from the app.
export const metadata: Metadata = { title: "nari. styleguide", robots: { index: false } };

const STATES: ResultState[] = ["typical", "watch", "doctor", "urgent"];

export default function StyleguidePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-14 px-5 py-12 sm:px-8">
      <header className="flex flex-col gap-4">
        <Wordmark size={56} />
        <p className="text-muted">saturday, october 17</p>
        <h1 className="font-serif text-[clamp(2.75rem,8vw,4.5rem)] leading-[0.95] text-blue">
          day 2 of your <em>period.</em>
        </h1>
      </header>

      <section aria-labelledby="sg-sphere" className="flex flex-col gap-6">
        <h2 id="sg-sphere" className="font-serif text-3xl text-blue">sphere</h2>
        <div className="flex flex-wrap items-end gap-8">
          <Sphere size={14} />
          <Sphere size={36} />
          <Sphere size={58} />
          <Sphere size={160} shadow className="float" />
          <ScoreSphere size={110} fill={0.48} />
          <ScoreSphere size={110} fill={1} />
        </div>
      </section>

      <section aria-labelledby="sg-cards" className="grid gap-6 md:grid-cols-[1fr_1fr]">
        <h2 id="sg-cards" className="sr-only">cards</h2>
        <Card className="flex items-center gap-5 self-start p-5">
          <ScoreSphere size={88} fill={0.48} />
          <div className="flex flex-col">
            <span className="text-sm text-muted">period score</span>
            <span className="font-serif text-5xl leading-none text-blue">
              48 <span className="text-2xl text-muted">/ 100</span>
            </span>
            <StatusPill state="typical" label={STATE_LABELS.typical} variant="inline" className="mt-1 text-sm" />
          </div>
        </Card>

        <Card tone="peach" className="flex flex-col gap-4 p-6">
          <div>
            <h3 className="font-serif text-4xl leading-none text-blue">sat, oct 17</h3>
            <p className="mt-1 text-sm">day 2 · 3 pads · 1 small clot · +23 pts</p>
          </div>
          <div className="rounded-inner bg-card p-4">
            <DayBars bleeding={4} energy={2} discomfort={4} mood={3} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Tag>skipped the gym</Tag>
            <Tag>studied</Tag>
            <Tag>slept 5 hrs</Tag>
          </div>
          <Button variant="outline" className="self-start">edit this day</Button>
        </Card>

        <Card className="flex max-w-xs flex-col gap-3 p-5">
          <p className="font-bold">got it. here&apos;s what i heard:</p>
          <DayBars bleeding={null} energy={2} discomfort={4} mood={3} kinds={["energy", "discomfort", "mood"]} compact />
          <div className="flex gap-2">
            <Button>looks right</Button>
            <Button variant="outline">adjust</Button>
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <Card tone="blue" className="flex items-start gap-3 p-5">
            <Sphere size={26} className="mt-0.5" />
            <p>your energy dips on day 2. it did last month too, so maybe plan an easy day.</p>
          </Card>
          <Card tone="ink" as="section" className="p-6" aria-labelledby="sg-help">
            <h3 id="sg-help" className="font-bold text-lg">soaked a pad in under an hour, or feeling dizzy?</h3>
            <p className="mt-2 text-white/85">tap here and nari will show you where to get help right now.</p>
          </Card>
        </div>
      </section>

      <section aria-labelledby="sg-states" className="flex flex-col gap-4">
        <h2 id="sg-states" className="font-serif text-3xl text-blue">result states</h2>
        <div className="flex flex-wrap gap-3">
          {STATES.map((s) => (
            <StatusPill key={s} state={s} label={STATE_LABELS[s]} />
          ))}
        </div>
      </section>

      <section aria-labelledby="sg-buttons" className="flex flex-col gap-4">
        <h2 id="sg-buttons" className="font-serif text-3xl text-blue">buttons + chips</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg">save pad</Button>
          <Button>open nari</Button>
          <Button variant="outline">edit period days</Button>
          <Button variant="outline-blue">+ add to google calendar</Button>
          <Button variant="solid-blue">tap to reveal photo</Button>
          <Button disabled>disabled</Button>
        </div>
        <div className="flex flex-wrap gap-3">
          <Chip>log a pad</Chip>
          <Chip>not now</Chip>
          <Chip>i feel worse</Chip>
          <Chip selected>yes</Chip>
          <Chip selected={false}>no</Chip>
        </div>
        <div className="flex flex-wrap gap-3 rounded-card bg-blue p-6 on-dark">
          <ButtonLink href="/styleguide" variant="light">open nari</ButtonLink>
        </div>
      </section>

      <section aria-labelledby="sg-pads" className="flex flex-col gap-4">
        <h2 id="sg-pads" className="font-serif text-3xl text-blue">pads + clots</h2>
        <div className="flex flex-wrap items-end gap-8">
          <PadIcon soak="light" />
          <PadIcon soak="moderate" />
          <PadIcon soak="full" />
          <ClotIcon clot="small" />
          <ClotIcon clot="large" />
        </div>
      </section>

      <section aria-labelledby="sg-arch" className="flex flex-col gap-4">
        <h2 id="sg-arch" className="font-serif text-3xl text-blue">arch cards</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {(
            [
              ["sage", "01", "snap"],
              ["peach", "02", "check in"],
              ["blush", "03", "get believed"],
            ] as const
          ).map(([tone, n, t]) => (
            <Card key={n} tone={tone} arch halftone className="flex min-h-64 flex-col justify-end p-6">
              <span className="font-serif text-5xl text-red">{n}</span>
              <span className="font-serif text-3xl">{t}</span>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="sg-icons" className="flex flex-col gap-4">
        <h2 id="sg-icons" className="font-serif text-3xl text-blue">nav icons</h2>
        <div className="flex gap-6 text-ink">
          <CalendarIcon />
          <ChatIcon />
          <CameraIcon />
          <DoctorIcon />
          <SettingsIcon />
        </div>
      </section>
    </main>
  );
}
