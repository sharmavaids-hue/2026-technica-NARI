// GET /api/health          → is Supabase reachable, are env vars set
// GET /api/health?gemini=1 → also makes one tiny Gemini call
// Never returns secrets.
import { createClient } from "@supabase/supabase-js";
import { geminiSelfTest } from "@/lib/gemini";
import { isSupabaseConfigured, SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const report: Record<string, unknown> = {
    mode: isSupabaseConfigured ? "supabase" : "fake demo data (no Supabase env vars)",
    env: {
      NEXT_PUBLIC_SUPABASE_URL: Boolean(SUPABASE_URL),
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: Boolean(SUPABASE_KEY),
      GEMINI_API_KEY: Boolean(process.env.GEMINI_API_KEY),
      GEMINI_MODEL: process.env.GEMINI_MODEL || "(default gemini-flash-latest)",
      DEMO_EMAIL: Boolean(process.env.DEMO_EMAIL),
      DEMO_PASSWORD: Boolean(process.env.DEMO_PASSWORD),
      ELEVENLABS_API_KEY: Boolean(process.env.ELEVENLABS_API_KEY),
      ELEVENLABS_VOICE_ID: Boolean(process.env.ELEVENLABS_VOICE_ID),
      ELEVENLABS_MODEL: process.env.ELEVENLABS_MODEL || "(default eleven_flash_v2_5)",
    },
  };

  if (isSupabaseConfigured) {
    const db = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
    // logged out + RLS → 0 rows, but an error means the tables are missing
    const tables: Record<string, string> = {};
    for (const t of ["profiles", "day_logs", "pad_logs", "messages"]) {
      const { error } = await db.from(t).select("*", { head: true, count: "exact" });
      tables[t] = error ? `error: ${error.message}` : "ok";
    }
    // migration 2 (pad color + note) has run?
    const { error: colorErr } = await db.from("pad_logs").select("color, ai_color, note", { head: true });
    tables["pad_logs color+note (migration 2)"] = colorErr ? `missing: run supabase/migrations/20261018000000_pad_color_note.sql` : "ok";
    report.tables = tables;
  }

  if (url.searchParams.get("gemini") === "1") {
    report.gemini = await geminiSelfTest();
  }

  return Response.json(report);
}
