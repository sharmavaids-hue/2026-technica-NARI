# Nari: approved build plan (full BRIEF.md scope + team fixes)

## Context
Hackathon build of Nari (BRIEF.md + design/ mockups). ~13 waking hours left including slides, Devpost and practice. All BRIEF.md features are back, plus a new "for your doctor" page. Decisions: email + password login with "Confirm email" OFF, Gemini on a billing-enabled key, US audience (UMD Health Center, 911). Roles: **Arshia = frontend/UI**, **Aryan = backend + all installs** (owns package.json). Repo today: mockups only; `.gitignore` already ignores `.env*.local` and `design/inspo/`. Supabase project `dkshljthydrznpylekzm` is empty. Node 24 / npm 11 / git on Windows.

## Core rules (apply everywhere)
- **App date**: `lib/date.ts` → `getAppDate(dayOffset)` = today's date in America/New_York + `profiles.day_offset`. Every "today" (calendar, chat, schedule, day-of-period count) uses it on server and client. Never raw `new Date()` for app dates.
- **Bleeding is never stored**: per day, sum that day's `pad_logs.points` → 0→0, 1–5→1, 6–10→2, 11–20→3, 21–35→4, 36+→5. Saving a pad sets that day `is_period = true`.
- **PBAC** (Higham 1990): pad light 1 / moderate 5 / full 20; clot small 1 / large 5; leak/flooding 5. Period score = sum over the current period. Sphere fills to min(score,100)/100; ≥100 → full sphere + "worth a doctor chat".
- **Health rules are plain code** (`lib/signals.ts`, `lib/patterns.ts`), never AI. Never "abnormal"/"diagnosis".
- **Gemini** only in server routes, `@google/genai`, model ID from `GEMINI_MODEL` (confirmed in AI Studio during M0), ~8s timeout → manual fallback. Demo never depends on it.
- **Photos** never stored or logged; resized in browser (~1024px) before upload; input `accept="image/*" capture="environment"`.
- **Accessibility**: icon + words for every state, AA contrast (mood bar fill darkened to ≥3:1 vs card backgrounds), visible focus, keyboard nav, aria labels ("october 17, period day 2, 3 pads"), `aria-live` chat, 44px targets, zoom allowed, reduced motion respected.

## Signals and patterns (`lib/signals.ts`, `lib/patterns.ts`)
- **Get help now** (Pad Check + Chat, overrides everything else): soaking a pad every hour for several hours (user says so, or 3+ full pads logged within 3 hours), dizziness/fainting, severe pain, bleeding when possibly pregnant → calm ink card: "call 911 or go to the ER now; if it can wait a few hours, UMD Health Center." In `/api/checkin`, a keyword check (dizzy, faint, passed out, soaking every hour, can't stand, pregnant…) runs before Gemini.
- **Energy link**: current period PBAC ≥100 AND energy ≤2 on more than half of logged period days → "this can mean low iron. worth asking for a blood test."
- **Bleeding Story**: 2+ yes of 4 quiz answers AND PBAC ≥100 → "worth asking a doctor about bleeding disorders."
- **Patterns** (only with 2+ past periods): "your energy is lowest on day N", "heavier/lighter than last period" (PBAC totals).
- Result states: looks typical / keep an eye on it / worth a doctor chat / get help now.

## Pages and layout (desktop = mockups, phone = our design)
- **Landing `/`** (landing-hero/full.png): poster hero (6 corner labels, stacked "know your flow" / *trust your body*, glossy sphere + puffy pad with cast shadows, gentle float, "nari." pill); peach "heavy isn't *'just how it is.'*" + paragraph + open nari + 3 red stats with sources; "three tiny habits. *one clear picture.*" 3 halftone arch cards; blue "built on a chart doctors already trust." + "your data stays yours." cards; royal-blue footer with giant "nari" + sphere, open nari, disclaimer. Phone: type scales with clamp(), labels to top/bottom rows, cards stack.
- **Auth `/login`, `/signup`**: centered card on paper, name/email/password, same type and buttons.
- **App shell**: desktop sidebar (wordmark, nav: home / chat / pad check / for your doctor / settings, profile card); phone bottom tab bar (5 items, icon + label).
- **Home**: date + "day 2 of your *period.*"; score card; month calendar (sphere = period, dashed ring = predicted, outline = today, legend, edit period days mode, next period + add to google calendar); day detail panel/phone sheet (4 bars, pads, activities, edit this day); pattern note card; signal cards when fired.
- **Chat**: SMS-style per app-chat.png: contact header, bubbles, timestamps, Delivered/Read, typing dots, bars card (looks right / adjust), signal + get-help cards, quick replies, input bar.
- **Pad Check**: per app-pad.png: blurred photo + tap to reveal, 3 soak cards w/ "nari's guess", 3 clot options, small optional "it leaked +5" toggle (PBAC item missing from mockup), score sphere with count-up, save pad (≤3 clicks), get-help card.
- **For your doctor `/app/doctor`**: PBAC score, pad pattern (pads/day), daily bars table, signals that fired, suggested script filled with real numbers, "book at UMD Health Center" (copies visit reason, opens their appointment page; verify URL), print CSS for Save as PDF.
- **Settings**: cycle length, period length, last period start, Bleeding Story quiz, privacy info, sign out, delete my data (confirm → delete all rows → sign out), demo: skip to tomorrow, load demo data.

## Supabase (inside this repo: `supabase/migrations/*.sql`; ask before running)
- `profiles`: id (= auth user), name, cycle_length 28, period_length 5, last_period_start, day_offset 0, quiz_nosebleeds / quiz_bruising / quiz_procedures / quiz_family (nullable booleans).
- `day_logs`: (user_id, date) primary key, is_period, energy, discomfort, mood (1–5 nullable), activities text[].
- `pad_logs`: id, user_id, date, logged_at, soak, clot, leaked, points, ai_soak, ai_clot. No photo.
- `messages`: id, user_id, app_date, sender, kind, body, card jsonb, created_at; unique (user_id, app_date, kind) for scheduled kinds.
- RLS on all: `user_id = auth.uid()` (profiles: `id = auth.uid()`). Trigger creates profile on sign-up. Auth setting: Confirm email OFF.

## File ownership
| Arshia (frontend) | Aryan (backend) |
|---|---|
| `app/globals.css`, Tailwind tokens, `app/layout.tsx` (fonts, grain) | `package.json` + all installs, `.env.local`, Vercel |
| `components/ui/*`, `components/shell/*` | `supabase/*`, `lib/supabase/*`, `middleware.ts` |
| `components/home/*`, `pad/*`, `chat/*`, `settings/*`, `doctor/*`, `landing/*` | `lib/types.ts`, `lib/actions/*.ts` (start as stubs with fake data) |
| `app/page.tsx` (landing), `app/(app)/**/page.tsx`, auth page markup | `lib/date.ts`, `pbac.ts`, `predict.ts`, `schedule.ts`, `signals.ts`, `patterns.ts`, `demo-seed.ts`, `gcal.ts` |
| | `app/api/pad-check/route.ts`, `app/api/checkin/route.ts`, auth server actions |
Arshia's components only import from `lib/types.ts` and `lib/actions/*`; Aryan swaps stub bodies for real ones. Need a change in the other's file → ask. Small commits, pull often.

## Milestones (each ends with: test → critique vs mockup + brief → fix)
**M0 0:00–1:00 Setup + Vercel live**
- Aryan: create-next-app (App Router, TS, Tailwind), GitHub repo, Vercel project linked (auto-deploy on push), Supabase libs, env vars (local + Vercel), confirm Gemini model ID, `lib/types.ts`, stub actions, `lib/date.ts`.
- Arshia: tokens, fonts, grain, Sphere, Button, Bars, Chip, Card, PadIcon, focus + reduced-motion styles.
- Test: localhost and the Vercel URL both show a sample page (sphere, buttons, bars, serif on grain); pushing a change updates Vercel in ~1 min; Tab shows focus rings.

**M1 1:00–3:00 Auth + Home calendar**
- Aryan: migrations (after approval), RLS, sign up/in/out, route protection, getHome / setPeriodDay / saveDay, predict.ts, gcal.ts, load demo data (3 past cycles + current).
- Arshia: auth pages, app shell, Home view (calendar, edit mode, day panel/sheet, score card, gcal button).
- Test: sign up → /app. Load demo data → past spheres, predicted rings. Tap a day → bars; edit → refresh → saved. Edit period days toggles days. Gcal button opens a pre-filled event. Phone width → tab bar + sheet. Second account sees nothing of the first.

**M2 3:00–4:45 Pad Check**
- Aryan: pbac.ts, savePad (sets is_period), `/api/pad-check` with timeout fallback, rapid-pads rule.
- Arshia: Pad Check view, count-up, over-100 state, get-help card.
- Test: moderate + small clot → "+6 points" → save → score updates here and on Home, day becomes a period day with bleeding bar. Photo → "nari's guess" preselected. Bad API key → manual still saves. 3 clicks max.

**M3 4:45–6:30 Chat**
- Aryan: schedule.ts (check-in during period; 2 days before; expected day yes/not yet → yes starts a period), `/api/checkin` (keyword check → Gemini → bars), skip to tomorrow.
- Arshia: Chat view, bars card + adjust, typing dots, quick replies, get-help card.
- Test: open chat on period day → one check-in (refresh: no duplicate). Type a reply → typing → bars card → looks right → Home shows bars. Type "i feel dizzy" → get-help card, no Gemini call. Skip to tomorrow to expected day → yes → calendar day 1.

**M4 6:30–8:15 Signals, patterns, quiz, Settings, doctor page**
- Aryan: signals.ts, patterns.ts, quiz save, delete my data, doctor-page data + script text.
- Arshia: Settings UI, doctor page + print CSS, signal/pattern cards on Home and Chat.
- Test: demo data → energy-link card and "energy lowest on day 2" appear. Answer 2 quiz yeses → bleeding-disorder card. Doctor page shows real numbers; Ctrl+P → clean PDF; book button copies text and opens UMD page. Delete my data → signed out, data gone.

**M5 8:15–9:30**: Arshia: landing page. Aryan: judge demo account + bug fixes.
- Test: landing on laptop + phone matches mockups; open nari → login; demo account shows a rich day 2.

**M6 9:30–10:00 Polish pass**: phone + laptop, keyboard-only full run, 200% zoom, screen-reader labels, contrast check, reduced motion.

**10:00 feature freeze** → 10–11 slides + backup demo video → 11–12 Devpost → 12–13 demo practice.
If behind, cut in order: (1) landing → hero only, (2) heavier-than-last-period pattern, (3) delete my data, (4) Bleeding Story quiz. Never cut: Pad Check, Chat, energy link, get help now, doctor page.

## Verification (at freeze)
Demo account: landing → open nari → log in → Home (day 2, score, pattern, energy link) → Pad Check (log pad, score animates) → Chat (reply, confirm bars; "dizzy" → get help) → Doctor page (print) → Settings skip to tomorrow → new chat message. Repeat with Gemini key removed.

## First actions after approval
1. Write PLAN.md (this plan) and CLAUDE.md (stack, roles, file ownership, core rules, palette, voice) in the repo.
2. Start M0 (scaffold + tokens). Ask before any database migration.
