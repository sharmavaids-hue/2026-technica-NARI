"use server";

import { loadAll, UMD_BOOKING_URL } from "../app-state";
import { formatFull } from "../date";
import { findPatterns } from "../patterns";
import { HEAVY_THRESHOLD, scoreOf } from "../pbac";
import type { DoctorData } from "../types";

/** One page for the doctor, with the exact words to say. */
export async function getDoctor(): Promise<DoctorData> {
  const { raw, d } = await loadAll();
  // summarize the current period if it's heavy enough to matter, else the last full one
  const period =
    d.current && (d.current.score >= HEAVY_THRESHOLD || !d.lastFinished) ? d.current : d.lastFinished ?? d.current;
  const days = period ? d.days.filter((x) => x.date >= period.start && x.date <= period.end) : [];
  const padsPerDay = days.map((x) => ({
    date: x.date,
    periodDay: x.periodDay ?? 0,
    pads: x.pads.length,
    points: x.padPoints,
  }));
  const maxPadsInADay = Math.max(0, ...padsPerDay.map((p) => p.pads));
  const score = scoreOf(period?.score ?? 0);
  const has = (id: string) => d.signals.some((s) => s.id === id);
  const which = period?.isCurrent ? "this period" : "my last period";
  const lowEnergyDays = days.filter((x) => x.energy !== null && x.energy <= 2).length;
  const loggedEnergyDays = days.filter((x) => x.energy !== null).length;

  const said: string[] = [];
  if (period) {
    said.push(
      `my PBAC score for ${which} was ${period.score}${period.score >= HEAVY_THRESHOLD ? " (100+ suggests heavy bleeding)" : ""}, and i changed up to ${maxPadsInADay} pads in a day.`,
    );
  }
  if (loggedEnergyDays && lowEnergyDays * 2 > loggedEnergyDays) {
    said.push(`i've been exhausted on ${lowEnergyDays} of ${loggedEnergyDays} period days.`);
  }
  const asks: string[] = [];
  if (has("energy-link")) asks.push("can we check my iron, including ferritin?");
  if (has("bleeding-story")) asks.push("could we also look into a bleeding disorder like von willebrand disease?");
  if (!asks.length) asks.push("is this typical, or worth looking into?");
  const script = [...said, ...asks].join(" ");

  const reasonBits = [
    period ? `heavy periods (PBAC score ${period.score})` : "period concerns",
    has("energy-link") ? "tired most period days, would like iron/ferritin checked" : "",
    has("bleeding-story") ? "possible bleeding disorder signs" : "",
  ].filter(Boolean);

  return {
    name: raw.profile.name,
    generatedOn: formatFull(d.today),
    period,
    score,
    padsPerDay,
    maxPadsInADay,
    days,
    signals: d.signals,
    patterns: findPatterns(d.periods, d.days),
    script,
    visitReason: reasonBits.join("; ") + ".",
    bookingUrl: UMD_BOOKING_URL,
  };
}
