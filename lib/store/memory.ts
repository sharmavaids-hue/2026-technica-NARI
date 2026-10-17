import "server-only";

// Fake single-user store kept in server memory. Used when Supabase isn't
// configured, so the UI can be built and demoed without a database.
// Resets when the dev server restarts.

import { getAppDate } from "../date";
import { buildDemoState, demoProfile } from "../demo-seed";
import type { RawState } from "../derive";
import { SCHEDULED_KINDS, type Store } from "./types";

const g = globalThis as unknown as { __nariMemory?: RawState };

function state(): RawState {
  if (!g.__nariMemory) g.__nariMemory = buildDemoState(getAppDate(0), demoProfile("local-demo"));
  return g.__nariMemory;
}

export const memoryStore: Store = {
  async load() {
    return structuredClone(state());
  },
  async updateProfile(patch) {
    const s = state();
    s.profile = { ...s.profile, ...patch };
  },
  async upsertDay(log) {
    const s = state();
    const i = s.dayLogs.findIndex((l) => l.date === log.date);
    if (i >= 0) s.dayLogs[i] = log;
    else s.dayLogs.push(log);
  },
  async addPad(pad) {
    state().padLogs.push(pad);
  },
  async addMessages(msgs) {
    const s = state();
    for (const m of msgs) {
      const dupe =
        SCHEDULED_KINDS.has(m.kind) &&
        s.messages.some((x) => x.appDate === m.appDate && x.kind === m.kind);
      if (!dupe) s.messages.push(m);
    }
  },
  async updateMessageCard(id, card) {
    const m = state().messages.find((x) => x.id === id);
    if (m) m.card = card;
  },
  async replaceAll(next, profile) {
    const s = state();
    g.__nariMemory = { ...next, profile: { ...s.profile, ...profile } };
  },
  async clearAll() {
    const s = state();
    g.__nariMemory = {
      profile: { ...demoProfile(s.profile.id, s.profile.name), lastPeriodStart: null },
      dayLogs: [],
      padLogs: [],
      messages: [],
    };
  },
};
