import { APP_TZ } from "@/lib/date";
import type { Clot, PadLog } from "@/lib/types";
import { COLOR_WORDS } from "@/components/padColorMeaning";
import { ColorSwatch } from "./ColorSwatch";
import { PadIcon } from "./PadIcon";

// The record of every pad check (never the photo): time, soak, clots, leak, points.
// Color is always a word plus a swatch; pads from before color was recorded say "not recorded".

const timeFmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: APP_TZ });
/** "9:10am" */
export const padTime = (iso: string) => timeFmt.format(new Date(iso)).replace(" ", "").toLowerCase();

const CLOT_WORDS: Record<Clot, string> = { none: "", small: "small clot", large: "large clot" };

/** "moderate · small clot · leaked" */
export function padWords(p: PadLog) {
  return [p.soak, CLOT_WORDS[p.clot], p.leaked ? "leaked" : ""].filter(Boolean).join(" · ");
}

/** One line per pad, oldest first. */
export function PadList({ pads, label = "pads logged", className = "" }: { pads: PadLog[]; label?: string; className?: string }) {
  if (!pads.length) return null;
  const sorted = [...pads].sort((a, b) => Date.parse(a.loggedAt) - Date.parse(b.loggedAt));
  return (
    <ol aria-label={label} className={`flex flex-col divide-y divide-line/70 ${className}`}>
      {sorted.map((p) => (
        <li key={p.id} className="flex items-start gap-3 py-2 first:pt-0 last:pb-0">
          <span className="flex h-6 w-5 shrink-0 items-center justify-center">
            <PadIcon soak={p.soak} size={16} />
          </span>
          <span className="w-[4.5rem] shrink-0 leading-6 tabular-nums text-muted">{padTime(p.loggedAt)}</span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="leading-6">{padWords(p)}</span>
            <span className={`flex items-center gap-1.5 text-sm ${p.color ? "" : "text-muted"}`}>
              <ColorSwatch color={p.color} size={12} />
              {p.color ? COLOR_WORDS[p.color] : "color not recorded"}
            </span>
            {p.note && <span className="text-sm italic text-ink/80">&ldquo;{p.note}&rdquo;</span>}
          </span>
          <span className="shrink-0 leading-6 font-bold tabular-nums">+{p.points}</span>
        </li>
      ))}
    </ol>
  );
}
