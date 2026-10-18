# nari.

**A period companion for college women: know if your period is actually heavy, notice patterns, and get taken seriously by a doctor.**

Live: **https://2026-technica-nari.vercel.app** · Built at Technica 2026 by Arshia Mamidanna (frontend/UI) and Aryan Sharma (backend).

> nari is not a doctor and never diagnoses. It helps you collect the evidence doctors already ask for.

---

## The problem

- **Heavy bleeding gets normalized.** People assume "mine are just like this," even when it's clinically heavy.
- **The hidden effects go unnoticed.** Heavy periods drain iron, so you're tired all the time and blame school. They can also hide a bleeding disorder: women with von Willebrand disease wait an average of **16 years** for a diagnosis.
- **Getting dismissed by doctors.** Without numbers or the right words, it's easy to be told it's normal. Only about **4 in 10** women with heavy bleeding ever seek care.
- **Tracking is boring.** Forms and calendars get abandoned after a week, so the data never exists when you need it.

## What nari does

| | |
|---|---|
| **Pad Check** | Snap or upload a photo of a pad (blurred on screen, **never stored**). Gemini *suggests* how soaked it is, clot size and a general color. She confirms with a tap. Scoring uses the **PBAC chart** (Higham 1990), the tool doctors already use, where **100+ points in a period suggests heavy bleeding.** The AI only suggests; the score is plain rules. |
| **Chat check-ins** | nari texts once a day during the period ("hey, day 2. you good?"). She replies casually, and Gemini turns it into energy / discomfort / mood numbers she can adjust, plus a warm, specific reply that remembers the conversation. nari also asks "did your period come?" on the expected day, and a "yes" starts the period automatically. |
| **Voice** | Every nari message can be read aloud (ElevenLabs), with a "read replies aloud" toggle and mic input. Captions always stay on screen. |
| **Home calendar** | Period days, predictions about a year ahead, and daily bars for bleeding, energy, discomfort and mood. Simple patterns come from code, not AI: "your energy dips on day 2", "heavier than last period". |
| **Health signals** (rules, never AI) | **Energy link:** PBAC 100+ and tired most days → "this can mean low iron, worth asking for a blood test." **Bleeding Story quiz:** nosebleeds, bruising, bleeding after procedures, family history. **Get help now:** soaking a pad every hour, dizziness, severe pain → calm urgent help, checked in code before any AI. |
| **For your doctor** | One printable page: PBAC score, pad record, daily bars, the signals that fired, and **the exact words to say** ("my PBAC score was 139 and i'm exhausted on 3 of 5 period days. can we check my iron?"), plus **book at UMD Health Center**. |

## Safety by design

- Health rules live in code (`lib/signals.ts`, `lib/patterns.ts`), never in the AI. nari never says "abnormal" or "diagnosis".
- Urgent words ("dizzy", "soaking every hour"…) and crisis language skip the AI entirely and show help immediately: 911, the UMD Health Center, the **988 Suicide & Crisis Lifeline** and the **UMD Counseling Center (301) 314-7651**.
- Pad photos are resized in the browser, sent once for a suggestion, and **never saved or logged**.
- Every AI call has a timeout and a manual fallback, so the app fully works without AI.
- Row-level security: each account only ever sees its own data. "Delete my data" removes everything.

## Accessibility

Built for the Best Accessibility track: WCAG AA contrast, never color alone (every state and pad color uses an icon + words), visible focus rings, full keyboard navigation (arrow keys on the calendar), screen-reader labels ("october 17, period day 2, 3 pads"), `aria-live` chat, 44px targets, zoom never disabled, `prefers-reduced-motion` respected, Atkinson Hyperlegible body type, and voice output with captions.

## Tech

- **Next.js 16** (App Router, TypeScript, server actions) + **Tailwind 4**, deployed on **Vercel**
- **Supabase**: Postgres + email/password auth + row-level security
- **Google Gemini** (`@google/genai`, `gemini-3.8-flash` with an automatic fallback chain): pad photo suggestions and chat check-ins, server-side only
- **ElevenLabs** text-to-speech for nari's voice
- Fonts: Instrument Serif + Atkinson Hyperlegible

```
app/            pages (landing, login, /app/* screens) and API routes
  api/health        env + database + Gemini status
  api/demo/reset    reloads the judge demo account
  api/voice/speak   ElevenLabs text-to-speech
components/     UI (home, pad, chat, doctor, settings, landing, ui)
lib/            backend: types, server actions, PBAC, predictions,
                signals, patterns, Gemini, Supabase store, demo seed
supabase/       SQL migrations (tables + row-level security)
design/         approved mockups
```

How the pieces fit: screens call server actions in `lib/actions/*` → actions load the user's rows from Supabase → `lib/derive.ts` turns them into calendar days, periods, PBAC scores, signals and patterns. More detail in [BACKEND.md](BACKEND.md), [PLAN.md](PLAN.md) and [BRIEF.md](BRIEF.md).

## Try it

Open the live site → **try the demo account**. The demo is "day 2" of a period with three past cycles, so the score, energy link, patterns and doctor page all have data. Settings has **demo: skip to tomorrow** to see nari's next daily message.

## Run it locally

```bash
git clone https://github.com/sharmavaids-hue/2026-technica-NARI.git
cd 2026-technica-NARI
npm install
cp .env.example .env.local   # fill in the values below
npm run dev                  # http://localhost:3000
```

With **no** Supabase variables, the app runs on in-memory demo data with no login, which is handy for UI work.

| Variable | What |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase project (publishable/anon key) |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | Google AI key and model ID |
| `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `ELEVENLABS_MODEL` | voice |
| `DEMO_EMAIL`, `DEMO_PASSWORD` | the judge demo account |

Database: run the files in `supabase/migrations/` in order in the Supabase SQL editor, and turn off "Confirm email" under Auth → Email. Check everything at `/api/health?gemini=1`.

## Sources

- Higham JM, O'Brien PMS, Shaw RW. *Assessment of menstrual blood loss using a pictorial chart.* BJOG, 1990. (PBAC; 100+ suggests heavy menstrual bleeding)
- Diagnosis delay and care-seeking statistics for bleeding disorders and heavy menstrual bleeding: PMC7845070
- [UMD University Health Center appointments](https://health.umd.edu/about-us/appointments) · [UMD Counseling Center](https://counseling.umd.edu/get-help-now)

*nari is a hackathon project and not a medical device. If you're worried about your bleeding, talk to a doctor. In an emergency, call 911.*
