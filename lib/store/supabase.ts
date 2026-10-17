import "server-only";

// Real store: Supabase Postgres, scoped to the logged-in user (RLS enforces it).

import type { SupabaseClient } from "@supabase/supabase-js";
import type { RawDayLog, RawState } from "../derive";
import type { ChatCard, ChatMessage, PadLog, Profile, Rating } from "../types";
import { SCHEDULED_KINDS, type Store } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

const toProfile = (r: Row): Profile => ({
  id: r.id,
  name: r.name ?? "",
  cycleLength: r.cycle_length,
  periodLength: r.period_length,
  lastPeriodStart: r.last_period_start,
  dayOffset: r.day_offset,
  quiz: {
    nosebleeds: r.quiz_nosebleeds,
    bruising: r.quiz_bruising,
    procedures: r.quiz_procedures,
    family: r.quiz_family,
  },
});

const fromProfile = (p: Partial<Omit<Profile, "id">>): Row => {
  const r: Row = {};
  if (p.name !== undefined) r.name = p.name;
  if (p.cycleLength !== undefined) r.cycle_length = p.cycleLength;
  if (p.periodLength !== undefined) r.period_length = p.periodLength;
  if (p.lastPeriodStart !== undefined) r.last_period_start = p.lastPeriodStart;
  if (p.dayOffset !== undefined) r.day_offset = p.dayOffset;
  if (p.quiz) {
    r.quiz_nosebleeds = p.quiz.nosebleeds;
    r.quiz_bruising = p.quiz.bruising;
    r.quiz_procedures = p.quiz.procedures;
    r.quiz_family = p.quiz.family;
  }
  return r;
};

const toDay = (r: Row): RawDayLog => ({
  date: r.date,
  isPeriod: r.is_period,
  energy: r.energy as Rating | null,
  discomfort: r.discomfort as Rating | null,
  mood: r.mood as Rating | null,
  activities: r.activities ?? [],
});

const fromDay = (userId: string, l: RawDayLog): Row => ({
  user_id: userId,
  date: l.date,
  is_period: l.isPeriod,
  energy: l.energy,
  discomfort: l.discomfort,
  mood: l.mood,
  activities: l.activities,
});

const toPad = (r: Row): PadLog => ({
  id: r.id,
  date: r.date,
  loggedAt: r.logged_at,
  soak: r.soak,
  clot: r.clot,
  leaked: r.leaked,
  points: r.points,
  aiSoak: r.ai_soak,
  aiClot: r.ai_clot,
});

const fromPad = (userId: string, p: PadLog): Row => ({
  id: p.id,
  user_id: userId,
  date: p.date,
  logged_at: p.loggedAt,
  soak: p.soak,
  clot: p.clot,
  leaked: p.leaked,
  points: p.points,
  ai_soak: p.aiSoak,
  ai_clot: p.aiClot,
});

const toMsg = (r: Row): ChatMessage => ({
  id: r.id,
  appDate: r.app_date,
  sender: r.sender,
  kind: r.kind,
  body: r.body,
  card: r.card,
  createdAt: r.created_at,
});

const fromMsg = (userId: string, m: ChatMessage): Row => ({
  id: m.id,
  user_id: userId,
  app_date: m.appDate,
  sender: m.sender,
  kind: m.kind,
  body: m.body,
  card: m.card,
  created_at: m.createdAt,
});

function check(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export function supabaseStore(db: SupabaseClient, userId: string): Store {
  return {
    async load(): Promise<RawState> {
      const [p, d, pads, msgs] = await Promise.all([
        db.from("profiles").select("*").eq("id", userId).maybeSingle(),
        db.from("day_logs").select("*").eq("user_id", userId),
        db.from("pad_logs").select("*").eq("user_id", userId),
        db.from("messages").select("*").eq("user_id", userId).order("created_at"),
      ]);
      check(p.error);
      check(d.error);
      check(pads.error);
      check(msgs.error);
      let profileRow = p.data;
      if (!profileRow) {
        // trigger missed (e.g. user created before the migration): create it now
        const ins = await db.from("profiles").insert({ id: userId }).select("*").single();
        check(ins.error);
        profileRow = ins.data;
      }
      return {
        profile: toProfile(profileRow),
        dayLogs: (d.data ?? []).map(toDay),
        padLogs: (pads.data ?? []).map(toPad),
        messages: (msgs.data ?? []).map(toMsg),
      };
    },

    async updateProfile(patch) {
      const { error } = await db.from("profiles").update(fromProfile(patch)).eq("id", userId);
      check(error);
    },

    async upsertDay(log) {
      const { error } = await db.from("day_logs").upsert(fromDay(userId, log));
      check(error);
    },

    async addPad(pad) {
      const { error } = await db.from("pad_logs").insert(fromPad(userId, pad));
      check(error);
    },

    async addMessages(msgs) {
      for (const m of msgs) {
        const { error } = await db.from("messages").insert(fromMsg(userId, m));
        // 23505 = unique violation: this scheduled message already exists today
        if (error && !(error.code === "23505" && SCHEDULED_KINDS.has(m.kind))) check(error);
      }
    },

    async updateMessageCard(id, card: ChatCard) {
      const { error } = await db.from("messages").update({ card }).eq("id", id).eq("user_id", userId);
      check(error);
    },

    async replaceAll(next, profile) {
      await this.clearAll();
      await this.updateProfile(profile);
      if (next.dayLogs.length) check((await db.from("day_logs").insert(next.dayLogs.map((l) => fromDay(userId, l)))).error);
      if (next.padLogs.length) check((await db.from("pad_logs").insert(next.padLogs.map((p) => fromPad(userId, p)))).error);
      if (next.messages.length) check((await db.from("messages").insert(next.messages.map((m) => fromMsg(userId, m)))).error);
    },

    async clearAll() {
      for (const table of ["messages", "pad_logs", "day_logs"]) {
        check((await db.from(table).delete().eq("user_id", userId)).error);
      }
      await this.updateProfile({
        cycleLength: 28,
        periodLength: 5,
        lastPeriodStart: null,
        dayOffset: 0,
        quiz: { nosebleeds: null, bruising: null, procedures: null, family: null },
      });
    },
  };
}
