# Backend API for the UI (Aryan → Arshia)

Every screen gets its data from **server actions** in `lib/actions/*` and types from `lib/types.ts`. No fetch calls, no API routes. Server Components can `await` them directly; Client Components can import and call them (they run on the server).

**Fake-data mode:** with no Supabase env vars, everything runs on in-memory demo data that matches the mockups (Sat Oct 17, day 2, score 48, next period nov 13). No login needed, so `/app` works right away. It resets when the dev server restarts.

## Home: `lib/actions/home.ts`
| call | returns | use |
|---|---|---|
| `getHome()` | `HomeData` (days run ~4 months back to ~13 months ahead, with every predicted period) | headline (`todayLabel`, `periodDay`), score card (`score.value/fill/state/label`), calendar (`days[]` with `isPeriod`, `isPredicted`, `isToday`, `ariaLabel`), day panel (a `Day`'s bars: `bleeding/energy/discomfort/mood`, `pads`, `activities`), `patterns[]`, `signals[]`, `nextPeriodLabel`, `gcalUrl` |
| `saveDay({date, energy, discomfort, mood, activities})` | `ActionResult` | "edit this day" |
| `setPeriodDay(date, isPeriod)` | `ActionResult` | "edit period days" mode. Shows `error` if a day has pads or is in the future |

## Pad Check: `lib/actions/pad.ts`
| call | returns | use |
|---|---|---|
| `getPadCheck()` | `PadCheckData` | score sphere, today's pads, `signals` (get-help if 3+ full pads in 3h) |
| `guessPad(formData)` | `PadGuess` | `formData.append("photo", blob)` after resizing to ~1024px JPEG. `ok:false` = no guess, let her pick |
| `savePad({soak, clot, leaked, aiSoak, aiClot})` | `SavePadResult` | `added` ("+6 points"), `before` → `score.value` for the count-up, `signals` |

## Chat: `lib/actions/chat.ts`
| call | returns | use |
|---|---|---|
| `getChat()` | `ChatData` | call on open. Adds today's scheduled message once. `messages` (oldest first), `quickReplies` |
| `sendMessage(text)` | `ChatData` | typed text **and** quick-reply chips. Show typing dots while it runs (Gemini can take a few seconds) |
| `confirmCheckin(messageId, {energy, discomfort, mood, activities})` | `ChatData` | "looks right", or save after "adjust" |

Cards (`message.card`): `bars` (if `manual: true`, Gemini failed, so open adjust with empty values; if `confirmed: true`, hide the buttons), `signal`, `get-help`. The "log a pad" chip should navigate to Pad Check instead of calling `sendMessage`. For timestamps, use `createdAt` for the time and `appDate` for the day label (the demo skip moves `appDate`).

Chat behavior: every typed message gets a real reply from nari (Gemini, ~10s timeout). During the period, a bars card appears at most once a day, plus an "updated what i heard:" card only when the numbers change. Crisis or self-harm language gets 988 + UMD Counseling Center (301) 314-7651 from plain code, never AI. If a period gets logged elsewhere, a pending "did it come?" resolves itself. Pad photo guesses have a 15s timeout.

## Doctor page: `lib/actions/doctor.ts`
`getDoctor()` → `DoctorData`: `score`, `period`, `padsPerDay`, `maxPadsInADay`, `days` (bars table), `signals`, `patterns`, `script` (the words to say), `visitReason` (copy to clipboard), `bookingUrl` (UMD myUHC portal; phone 301.314.8184).

## Settings: `lib/actions/settings.ts`
`getSettings()` → `Profile` · `saveSettings({name, cycleLength, periodLength, lastPeriodStart})` · `saveQuiz({nosebleeds, bruising, procedures, family})` (each `true/false/null`) · `skipToTomorrow()` · `resetDemoDate()` · `loadDemoData()` · `deleteMyData()` (redirects).

## Auth: `lib/actions/auth.ts`
`signIn` / `signUp` work with `useActionState(signIn, {})` → `<form action={action}>` with `email`, `password` (+ `name` for sign up). Show `state.error`. `tryDemo()` (demo button) and `signOut()` can be used as form actions too.

## Helpers you can import anywhere
`lib/date.ts` (`formatLong`, `formatShort`, `formatMonthDay`, `weekdayMon0`, `addDays`) · `lib/pbac.ts` (`SOAK_POINTS`, `CLOT_POINTS`, `LEAK_POINTS`, `STATE_LABELS`, `padPoints`) for labels like "moderate · about half · 5 pts".

Note: Next 16 renamed `middleware.ts` to **`proxy.ts`**. That's the file in the repo root.

## Health + demo routes (Aryan)
- `/api/health`: which env vars are set and whether the 4 Supabase tables respond. `/api/health?gemini=1` also makes one tiny Gemini call and shows which model answered.
- `/api/demo/reset`: signs in as `DEMO_EMAIL` and loads 3 past cycles plus day 2 of a current period (date back to today). Run it before every demo.
