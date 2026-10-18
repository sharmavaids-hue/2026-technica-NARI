import type { Pattern, Signal } from "@/lib/types";
import { Card } from "./Card";
import { GetHelpContent } from "./GetHelp";
import { Sphere } from "./Sphere";
import { StatusPill } from "./StatusPill";
import { STATE_LABELS } from "@/lib/pbac";

/** A health signal from lib/signals.ts. Urgent ones become the ink get-help card. */
export function SignalCard({ signal, className = "", level = 3 }: { signal: Signal; className?: string; level?: 2 | 3 }) {
  const H = level === 2 ? "h2" : "h3";
  if (signal.state === "urgent") {
    return (
      <Card tone="ink" as="section" aria-label={signal.title} className={`flex flex-col gap-3 p-6 ${className}`}>
        <StatusPill state="urgent" label={STATE_LABELS.urgent} className="self-start bg-white/10" />
        <H className="font-serif text-3xl leading-tight">{signal.title}</H>
        <GetHelpContent compact />
      </Card>
    );
  }
  return (
    <Card as="section" aria-label={signal.title} className={`flex flex-col gap-2 p-5 ${className}`}>
      <StatusPill state={signal.state} label={STATE_LABELS[signal.state]} className="self-start text-sm" />
      <H className="mt-1 font-bold text-lg leading-snug">{signal.title}</H>
      <p className="text-ink/90">{signal.body}</p>
    </Card>
  );
}

/** Nari's pattern note: the blue card with the sphere avatar. */
export function PatternNote({ pattern, className = "" }: { pattern: Pattern; className?: string }) {
  return (
    <Card tone="blue" className={`flex items-start gap-3.5 p-5 ${className}`}>
      <Sphere size={30} className="mt-0.5" />
      <p className="text-[1.05rem] leading-relaxed">{pattern.text}</p>
    </Card>
  );
}
