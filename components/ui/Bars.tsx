// Daily bars: bleeding / energy / discomfort / mood. Every bar shows its label and number,
// and is exposed to screen readers as a meter ("energy, 2 of 5").

export type BarKind = "bleeding" | "energy" | "discomfort" | "mood";

export const BAR_COLORS: Record<BarKind, string> = {
  bleeding: "bg-red",
  energy: "bg-mustard",
  discomfort: "bg-blue",
  mood: "bg-sage-strong",
};

const BAR_ORDER: BarKind[] = ["bleeding", "energy", "discomfort", "mood"];

type BarProps = {
  kind: BarKind;
  value: number | null;
  max?: number;
  /** compact = chat card row: label, short bar, number on one line */
  compact?: boolean;
};

export function Bar({ kind, value, max = 5, compact = false }: BarProps) {
  const pct = value == null ? 0 : Math.max(0, Math.min(1, value / max)) * 100;
  const text = value == null ? "not logged" : `${value} of ${max}`;
  const meter = {
    role: "meter",
    "aria-label": kind,
    "aria-valuemin": 0,
    "aria-valuemax": max,
    "aria-valuenow": value ?? 0,
    "aria-valuetext": text,
  } as const;

  const track = (
    <span className="relative block h-2.5 overflow-hidden rounded-pill bg-track" aria-hidden="true">
      <span
        className={`grow-in absolute inset-y-0 left-0 rounded-pill ${BAR_COLORS[kind]} transition-[width] duration-500 ease-[var(--ease-out-soft)]`}
        style={{ width: `${pct}%` }}
      />
    </span>
  );

  if (compact) {
    return (
      <div {...meter} className="grid grid-cols-[6.5rem_1fr_1.5rem] items-center gap-3">
        <span aria-hidden="true">{kind}</span>
        {track}
        <span aria-hidden="true" className="text-right font-bold tabular-nums">
          {value ?? "–"}
        </span>
      </div>
    );
  }

  return (
    <div {...meter} className="flex flex-col gap-1.5">
      <span aria-hidden="true" className="flex items-baseline justify-between gap-3">
        <span className="font-bold">{kind}</span>
        <span className="tabular-nums text-ink">{text}</span>
      </span>
      {track}
    </div>
  );
}

type DayBarsProps = {
  bleeding: number | null;
  energy: number | null;
  discomfort: number | null;
  mood: number | null;
  /** which bars to show; chat check-in card leaves out bleeding */
  kinds?: BarKind[];
  compact?: boolean;
};

export function DayBars({ kinds = BAR_ORDER, compact = false, ...values }: DayBarsProps) {
  return (
    <div className={compact ? "flex flex-col gap-2.5" : "flex flex-col gap-4"}>
      {kinds.map((k) => (
        <Bar key={k} kind={k} value={values[k]} compact={compact} />
      ))}
    </div>
  );
}
