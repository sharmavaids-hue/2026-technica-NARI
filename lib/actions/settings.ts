"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isISODate, loadAll } from "../app-state";
import { buildDemoState } from "../demo-seed";
import { getAppDate } from "../date";
import { isSupabaseConfigured } from "../supabase/config";
import { createClient } from "../supabase/server";
import type { ActionResult, Profile, QuizAnswers, SettingsInput } from "../types";

const clampInt = (v: unknown, lo: number, hi: number, dflt: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : dflt;
};

export async function getSettings(): Promise<Profile> {
  const { raw } = await loadAll();
  return raw.profile;
}

export async function saveSettings(input: SettingsInput): Promise<ActionResult> {
  const { store } = await loadAll();
  await store.updateProfile({
    name: String(input.name ?? "").trim().slice(0, 40),
    cycleLength: clampInt(input.cycleLength, 15, 60, 28),
    periodLength: clampInt(input.periodLength, 1, 14, 5),
    lastPeriodStart: isISODate(input.lastPeriodStart) ? input.lastPeriodStart : null,
  });
  revalidatePath("/app", "layout");
  return { ok: true };
}

export async function saveQuiz(answers: QuizAnswers): Promise<ActionResult> {
  const { store } = await loadAll();
  const b = (v: unknown) => (v === true ? true : v === false ? false : null);
  await store.updateProfile({
    quiz: {
      nosebleeds: b(answers.nosebleeds),
      bruising: b(answers.bruising),
      procedures: b(answers.procedures),
      family: b(answers.family),
    },
  });
  revalidatePath("/app", "layout");
  return { ok: true };
}

/** Demo: move the app date forward one day so judges see scheduled messages. */
export async function skipToTomorrow(): Promise<ActionResult> {
  const { store, raw } = await loadAll();
  await store.updateProfile({ dayOffset: raw.profile.dayOffset + 1 });
  revalidatePath("/app", "layout");
  return { ok: true };
}

/** Demo: back to the real date. */
export async function resetDemoDate(): Promise<ActionResult> {
  const { store } = await loadAll();
  await store.updateProfile({ dayOffset: 0 });
  revalidatePath("/app", "layout");
  return { ok: true };
}

/** Replace this account's data with 3 past cycles + day 2 of a current period. */
export async function loadDemoData(): Promise<ActionResult> {
  const { store, raw } = await loadAll();
  const today = getAppDate(0);
  const demo = buildDemoState(today, { ...raw.profile, dayOffset: 0 });
  await store.replaceAll(
    { dayLogs: demo.dayLogs, padLogs: demo.padLogs, messages: demo.messages },
    {
      name: raw.profile.name || demo.profile.name,
      cycleLength: 28,
      periodLength: 5,
      lastPeriodStart: demo.profile.lastPeriodStart,
      dayOffset: 0,
    },
  );
  revalidatePath("/app", "layout");
  return { ok: true };
}

/** Delete every row this user has, then sign out. */
export async function deleteMyData(): Promise<never> {
  const { store } = await loadAll();
  await store.clearAll();
  if (isSupabaseConfigured) {
    const db = await createClient();
    await db.auth.signOut();
    redirect("/login");
  }
  revalidatePath("/", "layout");
  redirect("/");
}
