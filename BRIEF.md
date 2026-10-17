# Nari: FINAL product + UI/UX brief (planning phase)

Use the frontend-design and ui-ux-pro-max skills for all UI work.
We are in the PLANNING phase. Give me a plan first. Don't write code until we agree on it.
Before you answer, critique your own answer, then ask me your clarifying questions and wait.
Keep scope to what's listed here. We have limited time (about 10 hours of build time), we're beginners, and I'm on Windows.

## Mockups (look at these first)
The design/ folder has the approved mockups: landing-hero.png, landing-full.png, app-home.png, app-chat.png, app-pad.png. Open and study each one. The build should match them closely. If something in this brief conflicts with a mockup, ask me.
The design/inspo/ folder has our inspiration images (local only, not in git). Use them for mood and texture only. Never copy any artist's work directly.

## Product
Nari is a website (not a native or mobile app) for college women: know if your period is actually heavy, notice patterns, and get taken seriously by a doctor.
Stack: Next.js (App Router) + Tailwind, Supabase (auth + database), Gemini API, deployed on Vercel. Fully responsive: great on laptop AND phone.
Gemini is only ever called from Next.js server routes (never from the browser) so the API key stays secret. Keys live in .env.local, which must be gitignored. Confirm the current Gemini model ID and SDK usage before writing code (AI Studio shows "Gemini 3.8 Flash").

## Features
1. Accounts (Supabase Auth): each user signs up and logs in (email magic link or Google sign-in, whichever is simpler) and only ever sees their own data. Use row-level security.
2. Daily check-ins (Chat):
   - During the period, Nari messages once a day: "hey, you good? how's your energy? what did you do today?" The user replies casually. Gemini turns the reply into numbers: energy, discomfort, mood (1-5) plus a list of activities. The user can adjust them.
   - Before the expected period: "hey, your period's probably coming in 2 days. maybe pack a pad?"
   - On the expected date: "hey, did your period come?" Quick replies yes / not yet. "yes" automatically starts a new period on the calendar.
   - Messages are generated when the user opens the site (no push notifications). Settings has a "demo: skip to tomorrow" button that advances the app's date so judges can see scheduled messages.
3. Calendar (Home): editable month calendar. Logged period days, predicted period days, and per-day energy/bleeding/discomfort/mood. Tap a day to see and edit its details. "Edit period days" mode lets the user tap days to add/remove them. Prediction = last period start + average cycle length (simple math, no AI).
   - "Add to Google Calendar" button: opens a pre-filled Google Calendar event link for the next predicted period. No full Google Calendar sync (that's a future feature).
4. Settings: average cycle length, average period length, last period start date, Bleeding Story quiz, privacy info, sign out, delete my data, and the demo skip button.
5. Pad Check: upload or take a photo of a used pad (blurred by default, never stored). Gemini SUGGESTS soak level (light/moderate/full) and clots (none/small/large). The user confirms with a tap. Scored with the PBAC (Higham 1990): pad lightly stained 1, moderately soaked 5, fully soaked 20, small clot 1, large clot (quarter or bigger) 5, leak/flooding 5. 100+ points in one period suggests heavy bleeding.
6. Health signals (rules in code, never AI):
   - Energy link: PBAC 100+ AND tired most period days -> "this can mean low iron. worth asking for a blood test."
   - Bleeding Story quiz: nosebleeds over 10 minutes, easy bruising, heavy bleeding after dental work or surgery, family history of a bleeding disorder. Several yes answers + heavy periods -> "worth asking a doctor about bleeding disorders."
   - Get help now: soaking a pad every hour for several hours, dizziness/fainting, severe pain, or bleeding when possibly pregnant -> skip everything and show urgent help calmly.
7. Daily bars for each period day: bleeding, energy, discomfort, mood.
8. Patterns (code, not AI): "your energy is lowest on day 2", "heavier than last period".
Fallback: if Gemini fails or is slow, the user picks values manually. The demo must never depend on Gemini working.
Never diagnose. Medical rules must match NHS/CDC/ACOG guidance.

## Visual concept: editorial poster + glossy sphere
Think a modern editorial poster: huge royal-blue serif type on warm off-white paper, with one glossy 3D-looking object overlapping the type and casting a soft shadow.
- Signature object: a glossy watermelon-red sphere (radial-gradient highlight + inner shadow, like glass or jelly). It is Nari's identity:
  - the period in the wordmark "nari." (serif "nari" + the sphere as the dot)
  - logged period days on the calendar
  - Nari's avatar in chat
  - the period score: the sphere "fills up" toward 100
- Paper grain texture over the whole site (subtle SVG noise, pointer-events none) and small halftone dot patterns on colored cards.
- Arch-shaped cards (fully rounded top) for "how it works".
- Rounded pill buttons; primary buttons are glossy watermelon red.
Spend the boldness on the type and the sphere. Keep everything else calm and spacious.

## Pages and layout (match the mockups)
1. Landing page "/":
   - Hero like a poster: small serif labels in the four corners ("nari. period care, 2026", "est. technica", "made for every 2am question", "snap. check in. get believed."), a "nari." outlined pill at the bottom center, and huge stacked serif lines alternating "know your flow" / "trust your body" (italic on alternate lines), with the glossy sphere and a puffy white pad overlapping the text with soft cast shadows.
   - Peach section: "heavy isn't 'just how it is.'" + short paragraph + "open nari" button + three stats in big red serif numbers with sources (16 yrs: avg wait for von Willebrand diagnosis in women, PMC7845070; 4 in 10: women with heavy bleeding who ever seek care, PMC7845070; 100+: PBAC points that suggest heavy bleeding, Higham 1990).
   - "three tiny habits. one clear picture." with 3 arch cards: snap / check in / get believed.
   - Two cards: "built on a chart doctors already trust." (blue) and "your data stays yours."
   - Royal-blue footer with a giant "nari" + sphere, "open nari" button, and the not-a-doctor disclaimer.
   - Motion: gentle scroll reveals, the sphere and pad float slightly. Nothing busy.
2. Auth pages: simple sign up / log in in the same style.
3. App "/app": left sidebar on desktop (logo, nav, user profile at the bottom), bottom tab bar on phones. Tabs: Home, Chat, Pad Check, Settings.
   - Home: "day 2 of your period." headline (serif, last word italic), the period score card, the editable month calendar, a day detail panel (side panel on desktop, slide-up sheet on phone) with bars, pads, activities, edit button, Nari's pattern note, and the Google Calendar button.
   - Chat: looks like SMS/iMessage. Nari as a contact at the top (sphere avatar, name, subtitle). Her messages in light gray bubbles on the left, the user's in royal blue on the right, timestamps, "Delivered"/"Read", a typing indicator while Gemini works, quick-reply chips, a text-message input bar. Rich cards inside the chat: the bars card after a check-in (looks right / adjust), health signal cards, get-help card.
   - Pad Check: blurred photo with "tap to reveal"; soak = three pad icons (light/moderate/full) with different fill levels + text labels + points; Gemini's guess pre-selected with a "nari's guess" tag; clots = none / smaller than a quarter / a quarter or bigger, shown as circles; the score sphere fills with a count-up on save; a calm "get help now" card. Save in 3 clicks max.
   - Settings: simple form with friendly labels.

## Palette (light mode only; contrast checked)
- Paper background: #F5F0E8 (cards: #FBF8F2, borders: #DCD3C4)
- Royal blue (headlines, logo, user chat bubbles, links): #26368E (9.3:1 on paper; white on blue 10.5:1)
- Watermelon red (sphere, primary buttons, period days, stat numbers): #B83E4B (white text on it 5.5:1; as text on paper 4.8:1)
- Peach-yellow (sections, highlights): #F7DCAD (ink text on it 11.5:1)
- Mustard green (energy bar, "looks typical" text): #736428 (5.2:1 on paper)
- Morning blue (cards, mood bar): #93A29D (ink text on it 5.8:1)
- Ink text: #1F2340 (13.5:1 on paper). Muted text: #5E5A66 (5.9:1)
- Bars: bleeding = red, energy = mustard green, discomfort = royal blue, mood = morning blue. Every bar shows its label and number.
- Result states, always icon + words, never color alone: looks typical, keep an eye on it, worth a doctor chat, get help now (ink card with white text). No alarming bright red for warnings.

## Typography
- Display/headlines: Instrument Serif (Google Fonts), very large on the landing page, italic for emphasis words.
- Body/UI: Atkinson Hyperlegible (Google Fonts), designed for low vision readers.

## Voice
Nari writes lowercase, short, warm, specific, like a friend texting. Never "abnormal" or "diagnosis".

## Accessibility (we're competing for Best Accessibility)
Never color alone; WCAG AA contrast; visible focus rings; full keyboard navigation; screen-reader labels on buttons, calendar days ("october 17, period day 2, 3 pads") and bars; aria-live for new chat messages; tap targets at least 44x44px; pinch-zoom NOT disabled; text can be enlarged without breaking layout; respects prefers-reduced-motion.

## What I want from you now
1. Critique this plan, then ask me your clarifying questions. Wait for my answers.
2. A short written layout plan for the landing page and each tab.
3. The Supabase tables you'll create (explain them simply) and ask before running anything that changes the database.
4. A build plan broken into milestones I can verify one at a time. For each: what gets built, which files change, exactly how I test it (what to click and what I should see), a time estimate, and how two people can split the work without editing the same files.
   Suggested order: project setup + design tokens + fonts + grain -> auth -> Home calendar (with demo data) -> Pad Check (manual first, then Gemini) -> Chat check-ins (manual first, then Gemini) -> Settings + predictions + scheduled messages -> health signals -> landing page -> deploy to Vercel -> polish + accessibility pass.
   Include a feature freeze about 3 hours before the deadline, plus time for a backup demo video, the Devpost write-up, and demo practice.
5. After each screen is built, critique it against the mockups and this brief (generic? breaks on phone or laptop? accessibility?) and fix before moving on.
6. Save the agreed plan to PLAN.md and a short project summary to CLAUDE.md so my teammate's Claude Code session stays in sync.
