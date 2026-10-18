import { APP_TZ } from "@/lib/date";
import type { Clot, PadLog } from "@/lib/types";
import { PadIcon } from "./PadIcon";

// The record of every pad check (never the photo): time, soak, clots, leak, points.
// Color and note slot in here once the backend stores them.

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
        <li key={p.id} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
          <span className="flex w-5 shrink-0 justify-center">
            <PadIcon soak={p.soak} size={16} />
          </span>
          <span className="w-[4.5rem] shrink-0 tabular-nums text-muted">{padTime(p.loggedAt)}</span>
          <span className="min-w-0 flex-1">{padWords(p)}</span>
          <span className="shrink-0 font-bold tabular-nums">+{p.points}</span>
        </li>
      ))}
    </ol>
  );
}
