// GET /api/demo/reset → fills the judge demo account (DEMO_EMAIL) with
// 3 past cycles + day 2 of a current period, and sets the date back to today.
// Safe to run before every demo. Only ever touches the demo account.
import { createClient } from "@supabase/supabase-js";
import { getAppDate } from "@/lib/date";
import { buildDemoState, demoProfile } from "@/lib/demo-seed";
import { supabaseStore } from "@/lib/store/supabase";
import { isSupabaseConfigured, SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured) {
    return Response.json({ ok: false, error: "Supabase env vars are not set" }, { status: 400 });
  }
  const email = process.env.DEMO_EMAIL;
  const password = process.env.DEMO_PASSWORD;
  if (!email || !password) {
    return Response.json({ ok: false, error: "DEMO_EMAIL / DEMO_PASSWORD are not set" }, { status: 400 });
  }

  const db = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return Response.json({ ok: false, error: `demo sign-in failed: ${error?.message}` }, { status: 500 });
  }

  try {
    const store = supabaseStore(db, data.user.id);
    const today = getAppDate(0);
    const demo = buildDemoState(today, demoProfile(data.user.id));
    await store.replaceAll(
      { dayLogs: demo.dayLogs, padLogs: demo.padLogs, messages: demo.messages },
      { name: "arshia", cycleLength: 28, periodLength: 5, lastPeriodStart: demo.profile.lastPeriodStart, dayOffset: 0 },
    );
    const check = await store.load();
    return Response.json({
      ok: true,
      today,
      dayLogs: check.dayLogs.length,
      padLogs: check.padLogs.length,
      messages: check.messages.length,
    });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
  } finally {
    await db.auth.signOut();
  }
}
