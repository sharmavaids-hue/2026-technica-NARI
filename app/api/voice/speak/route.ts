// POST /api/voice/speak  { text }  →  audio/mpeg (ElevenLabs text-to-speech)
// On failure: JSON { ok: false, reason: "no-key" | "busy" | "too-long" | "error" }
// so the UI can hide the listen button and keep captions. Never logs the text.
import { createHash } from "node:crypto";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_CHARS = 600;
const CACHE_MAX_CHARS = 120; // short repeated lines (daily check-ins) get cached
const CACHE_SIZE = 100;
const RATE_PER_MIN = 20;
const TIMEOUT_MS = 15_000;

const MODEL = process.env.ELEVENLABS_MODEL || "eleven_flash_v2_5";

type Reason = "no-key" | "busy" | "too-long" | "error" | "unauthorized";
const fail = (reason: Reason, status: number) =>
  Response.json({ ok: false, reason }, { status, headers: { "Cache-Control": "no-store" } });

// tiny in-memory LRU (Map keeps insertion order)
const cache = new Map<string, ArrayBuffer>();
function cacheGet(k: string) {
  const v = cache.get(k);
  if (v) {
    cache.delete(k);
    cache.set(k, v);
  }
  return v;
}
function cacheSet(k: string, v: ArrayBuffer) {
  cache.set(k, v);
  while (cache.size > CACHE_SIZE) cache.delete(cache.keys().next().value as string);
}

// ~20 requests per minute per user (in-memory, fine for the demo)
const hits = new Map<string, number[]>();
function rateLimited(user: string): boolean {
  const now = Date.now();
  const recent = (hits.get(user) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(user, recent);
  return recent.length > RATE_PER_MIN;
}

const audioHeaders = { "Content-Type": "audio/mpeg", "Cache-Control": "private, max-age=3600" };

export async function POST(request: Request) {
  // must be signed in (same rule as the app); fake-data mode has no login
  let user = "local";
  if (isSupabaseConfigured) {
    const db = await createClient();
    const { data } = await db.auth.getClaims();
    const sub = data?.claims?.sub;
    if (!sub) return fail("unauthorized", 401);
    user = sub;
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voice = process.env.ELEVENLABS_VOICE_ID;
  if (!apiKey || !voice) return fail("no-key", 503);

  let text = "";
  try {
    const body = (await request.json()) as { text?: unknown };
    text = typeof body.text === "string" ? body.text.trim() : "";
  } catch {
    return fail("error", 400);
  }
  if (!text) return fail("error", 400);
  if (text.length > MAX_CHARS) return fail("too-long", 400);
  if (rateLimited(user)) return fail("busy", 429);

  const key = createHash("sha256").update(`${voice}|${MODEL}|${text}`).digest("hex");
  const hit = text.length <= CACHE_MAX_CHARS ? cacheGet(key) : undefined;
  if (hit) return new Response(hit, { headers: audioHeaders });

  let res: Response;
  try {
    res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}/stream?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: { "xi-api-key": apiKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
        body: JSON.stringify({
          text,
          model_id: MODEL,
          voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0 },
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      },
    );
  } catch (err) {
    const timedOut = (err as Error).name === "TimeoutError" || (err as Error).name === "AbortError";
    console.warn(`[voice] ${timedOut ? "timed out" : "request failed"}`);
    return fail("busy", 503);
  }

  if (!res.ok || !res.body) {
    // log status only, never the text
    console.warn(`[voice] elevenlabs status ${res.status}`);
    if (res.status === 401 || res.status === 403) return fail("no-key", 503);
    if (res.status === 429 || res.status >= 500) return fail("busy", res.status === 429 ? 429 : 503);
    return fail("error", 503);
  }

  if (text.length <= CACHE_MAX_CHARS) {
    const buf = await res.arrayBuffer();
    cacheSet(key, buf);
    return new Response(buf, { headers: audioHeaders });
  }
  // longer replies stream straight through
  return new Response(res.body, { headers: audioHeaders });
}
