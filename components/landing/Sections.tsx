import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const STATS = [
  {
    n: "16 yrs",
    text: "average wait from first symptoms to a von willebrand disease diagnosis in women.",
    source: "PMC7845070",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7845070/",
  },
  {
    n: "4 in 10",
    text: "women with heavy menstrual bleeding ever seek care for it.",
    source: "PMC7845070",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7845070/",
  },
  {
    n: "100+",
    text: "points on the PBAC chart in one period suggests heavy bleeding.",
    source: "Higham et al., 1990",
  },
];

export function HeavySection() {
  return (
    <section aria-labelledby="heavy-title" className="wipe bg-peach px-5 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-14 sm:gap-20">
        <div className="reveal grid gap-8 lg:grid-cols-2 lg:items-center">
          <h2 id="heavy-title" className="font-serif text-[clamp(3rem,7.5vw,6rem)] leading-[0.92] tracking-[-0.02em] text-blue">
            heavy isn&apos;t <em>&ldquo;just how it is.&rdquo;</em>
          </h2>
          <div className="flex max-w-[34rem] flex-col items-start gap-6 lg:justify-self-end">
            <p className="text-[1.15rem] leading-relaxed">
              heavy periods quietly drain your iron, hide bleeding disorders, and get brushed off for years. most of us just
              never had a way to measure them.
            </p>
            <ButtonLink href="/login" size="lg">
              open nari
            </ButtonLink>
          </div>
        </div>

        <ul className="reveal grid gap-10 sm:grid-cols-3 sm:gap-8">
          {STATS.map((s) => (
            <li key={s.n} className="flex flex-col gap-3 border-t border-ink/30 pt-6">
              <span className="font-serif text-[clamp(3.5rem,6vw,5.2rem)] leading-none text-red">{s.n}</span>
              <span className="max-w-[24rem] leading-relaxed">{s.text}</span>
              {s.href ? (
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center self-start text-sm text-muted underline underline-offset-4">
                  {s.source}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                <span className="flex min-h-11 items-center text-sm text-muted">{s.source}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const HABITS = [
  {
    tone: "sage" as const,
    title: "snap",
    text: "photo your pad. nari guesses how soaked it is, you confirm with a tap. the photo is never saved.",
  },
  {
    tone: "peach" as const,
    title: "check in",
    text: "nari texts you once a day. reply however you talk; energy, cramps and mood land on your calendar.",
  },
  {
    tone: "blush" as const,
    title: "get believed",
    text: "when something looks off, nari tells you gently and gives you the exact words for your doctor.",
  },
];

/** Card 01's tiny demo: blurred photo, then "nari's guess", then tap to confirm, then the score ticks up. Decorative. */
function SnapDemo() {
  return (
    <div aria-hidden="true" className="relative mb-auto mt-14 self-center">
      <div
        className="h-24 w-36 rounded-[16px] blur-[6px]"
        style={{ background: "radial-gradient(ellipse 40% 30% at 50% 50%, #b83e4b 0%, #d98a92 55%, #f3ede3 100%)" }}
      />
      <span className="snap-tag absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-pill bg-blue px-3 py-0.5 text-sm font-bold text-white">
        nari&apos;s guess: moderate
      </span>
      <span className="snap-check absolute -bottom-3 -right-3 flex size-9 items-center justify-center rounded-full bg-red text-white shadow-md">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      <span className="snap-score absolute -bottom-4 -left-6 rounded-pill bg-card px-3 py-1 font-serif text-2xl leading-none text-blue shadow-sm" />
    </div>
  );
}

export function HabitsSection() {
  return (
    <section aria-labelledby="habits-title" className="px-5 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-12">
        <h2 id="habits-title" className="reveal font-serif text-[clamp(2.75rem,6.5vw,5.2rem)] leading-[0.95] tracking-[-0.02em] text-blue">
          three tiny habits. <em>one clear picture.</em>
        </h2>
        <ol className="reveal grid gap-5 md:grid-cols-3">
          {HABITS.map((h, i) => (
            <li key={h.title}>
              <Card tone={h.tone} arch halftone className="snap-card flex min-h-[23rem] flex-col justify-end gap-2 p-7 sm:min-h-[26rem]">
                {i === 0 && <SnapDemo />}
                <span aria-hidden="true" className="font-serif text-6xl leading-none text-red">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-serif text-[2.4rem] leading-none">
                  <span className="sr-only">step {i + 1}: </span>
                  {h.title}
                </h3>
                <p className="mt-1 leading-relaxed">{h.text}</p>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function TrustSection() {
  return (
    <section aria-label="why you can trust nari" className="px-5 pb-24 sm:px-10 sm:pb-32">
      <div className="reveal mx-auto grid max-w-[1240px] gap-5 md:grid-cols-2">
        <Card tone="blue" halftone className="flex flex-col gap-4 p-8 sm:p-10">
          <h2 className="font-serif text-[clamp(2.1rem,3.4vw,2.8rem)] leading-[1.05]">built on a chart doctors already trust.</h2>
          <p className="max-w-[34rem] text-[1.05rem] leading-relaxed text-white/90">
            nari scores your period with the PBAC, used since 1990. ai only helps fill it in. it never diagnoses.
          </p>
        </Card>
        <Card className="flex flex-col gap-4 p-8 sm:p-10">
          <h2 className="font-serif text-[clamp(2.1rem,3.4vw,2.8rem)] leading-[1.05] text-blue">your data stays yours.</h2>
          <p className="max-w-[34rem] text-[1.05rem] leading-relaxed">
            your own private login. photos are analyzed, then thrown away. no ads, no selling data.
          </p>
        </Card>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="wipe on-dark overflow-hidden bg-blue px-5 pb-8 pt-16 text-white sm:px-10 sm:pt-24">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <p className="font-serif text-[clamp(2.2rem,4vw,3.2rem)] leading-[1.02]">
            ready when
            <br />
            you are.
          </p>
          <ButtonLink href="/login" variant="light" size="lg">
            open nari
          </ButtonLink>
        </div>
        <p aria-hidden="true" className="flex items-end font-serif text-[clamp(8rem,34vw,30rem)] leading-[0.8] tracking-[-0.03em]">
          nari
          <span className="mb-[0.06em] ml-[0.02em] inline-block w-[0.2em]">
            <span className="sphere block aspect-square w-full" style={{ ["--s" as string]: "6rem" }} />
          </span>
        </p>
        <p className="text-sm text-white/85">
          made at technica 2026. nari is not a doctor and doesn&apos;t diagnose. if something feels wrong, trust that and get care.
        </p>
      </div>
    </footer>
  );
}

