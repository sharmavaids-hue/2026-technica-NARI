# Nari: project summary for Claude Code

Nari is a website for college women: know if your period is actually heavy, notice patterns, get taken seriously by a doctor. Hackathon project (Technica 2026). Full plan and milestones: **PLAN.md**. Product + design brief: **BRIEF.md**. Approved mockups: `design/*.png` (match them closely). `design/inspo/` is mood only, local only, never copy it.

## Stack
Next.js (App Router, TypeScript) + Tailwind, Supabase (auth + Postgres, RLS), Gemini via `@google/genai` (server routes only, model ID in `GEMINI_MODEL`), Vercel (auto-deploys on push to main). Windows dev machines. Secrets live in `.env.local` (gitignored). Never call Gemini from the browser.

## Team and file ownership (never edit the other person's files; ask instead)
- **Arshia (frontend/UI)**: `app/globals.css`, Tailwind tokens, `app/layout.tsx`, `app/page.tsx` (landing), `app/(app)/**/page.tsx`, auth page markup, `components/**` (ui, shell, home, pad, chat, settings, doctor, landing).
- **Aryan (backend)**: `package.json` + all installs, `.env.local`, Vercel, `supabase/**`, `middleware.ts`, `lib/**` (types, actions, supabase, date, pbac, predict, schedule, signals, patterns, demo-seed, gcal), `app/api/**`, auth server actions.
- Contract: components import only from `lib/types.ts` and `lib/actions/*`. Actions start as stubs returning fake data; Aryan swaps in real bodies.

## Core rules
- **App date**: always `getAppDate()` from `lib/date.ts` (America/New_York date + `profiles.day_offset`). Never raw `new Date()` for app dates.
- **Bleeding is computed, not stored**: sum of that day's `pad_logs.points` → 0→0, 1–5→1, 6–10→2, 11–20→3, 21–35→4, 36+→5. Saving a pad marks the day `is_period = true`.
- **PBAC (Higham 1990)**: pad light 1 / moderate 5 / full 20; clot small 1 / large 5; leak 5. 100+ per period suggests heavy bleeding. Score sphere caps visually at 100; ≥100 shows "worth a doctor chat".
- **Health rules are code** (`lib/signals.ts`, `lib/patterns.ts`), never AI: get help now, energy link, Bleeding Story, patterns. Never diagnose; never say "abnormal" or "diagnosis". Follow NHS/CDC/ACOG.
- **Gemini is optional**: ~8s timeout, manual fallback always works. The demo must never depend on it. Chat runs a keyword safety check before Gemini.
- **Pad photos are never stored or logged.**
- **Database changes**: SQL lives in `supabase/migrations/`. Ask a human before running any migration.

## Design
- Concept: editorial poster. Huge royal-blue Instrument Serif on warm paper, one glossy watermelon-red sphere (the dot in "nari.", period days, chat avatar, score that fills to 100). Subtle paper grain, halftone on colored cards, arch cards, pill buttons. Bold type + sphere, everything else calm.
- Fonts: Instrument Serif (display, italic for emphasis), Atkinson Hyperlegible (body/UI).
- Colors: paper #F5F0E8, card #FBF8F2, border #DCD3C4, royal blue #26368E, watermelon #B83E4B, peach #F7DCAD, mustard #736428, morning blue #93A29D (darken for mood bar fill to ≥3:1), ink #1F2340, muted #5E5A66. Light mode only.
- Bars: bleeding red, energy mustard, discomfort blue, mood morning blue; always label + number.
- States always icon + words: looks typical / keep an eye on it / worth a doctor chat / get help now (ink card).

## Voice
Lowercase, short, warm, specific, like a friend texting.

## Accessibility (competing for Best Accessibility)
Never color alone, WCAG AA contrast, visible focus rings, full keyboard nav, screen-reader labels (e.g. "october 17, period day 2, 3 pads"), `aria-live` for new chat messages, 44×44 targets, zoom never disabled, text enlarges without breaking, respect `prefers-reduced-motion`.

## Workflow
After each screen: critique it against the mockup and brief (generic? breaks on phone/laptop? accessible?) and fix before moving on. Small commits, pull often.
