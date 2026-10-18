# Nari: COMPLETE fix list (round 2)

Read BRIEF.md, FRONTEND_TASK.md, BACKEND.md and lib/types.ts again first. Look at the mockups in design/.
Old rules still apply: don't edit lib/**, proxy.ts, app/api/**, supabase/**, package.json; no direct Gemini/Supabase calls from components; no new Date() for app dates; no SQL; no keys in code; don't save pad photos.
If a fix needs one of those files, STOP and write me a clear message to paste to Aryan (exact problem, file, what we want, suggested code).
Use the frontend-design and ui-ux-pro-max skills for any UI change. Explain simply; I'm a beginner on Windows.

=====================================================================
## STEP 0: AUDIT FIRST (before fixing anything)
1. Restart the dev server so demo data is fresh.
2. Click through EVERY screen and flow at laptop width AND 390px phone width: landing, login, signup, home, calendar across many months (past Dec 2026 and back), pad check (with a real photo), chat (several messages), doctor page (+ Ctrl+P preview), settings, skip to tomorrow, sign out.
3. Compare every screen to the mockups in design/.
4. Give me ONE prioritized list of EVERYTHING broken or rough (mine below + anything else you find), split into:
   A) fixable in my files
   B) needs Aryan, each with a paste-ready message.
5. Wait for my OK, then fix in priority order. Test each fix, tell me how to test it, and commit with a small clear message.

=====================================================================
## P0. PAD CHECK COMPUTER VISION NEVER WORKS (top priority, the core feature)
It has never once analyzed an image. Debug it methodically and SHOW ME the real errors, don't guess:
1. Find the exact failure point. Watch BOTH the browser console (F12) and the dev server terminal while uploading a photo. Tell me the exact error text.
2. Env/key:
   - Check BACKEND.md for the exact env variable name the backend reads (e.g. GEMINI_API_KEY). Confirm .env.local uses exactly that name, no quotes/spaces, and that the dev server was restarted after editing it.
   - Our key is a newer "AQ." style key from Google AI Studio. Verify it works with a direct test (list models) and tell me if the backend's SDK call needs a change for this key type.
3. Model: confirm the model ID in the backend actually exists for our key (list the models and compare). An invalid/retired model name is a common cause.
4. Image sent correctly: confirm the browser resize produces a real JPEG (~1024px), that it's sent as base64 with mimeType "image/jpeg" (not a data: URL prefix inside the base64, not HEIC), and that it's under the size limit. Test with a normal photo AND an iPhone photo.
5. Response parsing: Gemini often wraps JSON in ```json fences or adds text. Confirm the backend parses robustly (strip fences, use structured JSON output / responseSchema if available) and validates the result (soak in light|moderate|full, clots in none|small|large).
6. Safety blocks: images with red liquid may be blocked by safety filters, returning an empty response or finishReason SAFETY. Check for this and handle it (and tell Aryan if safety settings/prompt need adjusting).
7. Timeouts: make sure slow responses don't silently fail. Show a loading state ("nari's looking...") and time out after ~15s.
8. UI must always say what happened: success = "nari's guess" pre-selected; failure = calm "i couldn't read that photo, pick it yourself" with manual choice. Never a silent nothing.
9. Add a quick way to test: a small dev-only test page or script that runs guessPad on images in design/test-pads/ and prints the result (dev only, not in the live nav).
Our demo test photos: pads with red food-colored water (light/moderate/full) and jam for clots, in design/test-pads/.

=====================================================================
## P1. CHAT MUST LISTEN AND GIVE GENUINE, CALMING REPLIES
Problem now: it only grabs energy/discomfort/mood, logs a pad every time, and ends with "i'll check in tomorrow / bye". It doesn't listen or comfort.
Want:
- Nari responds to what the user actually said, warmly and specifically, like a supportive friend, and keeps the conversation going for several turns. Never ends the chat after one message.
- Example: "i'm so stressed, exam tomorrow and cramps are killing me" -> acknowledges the exam AND the cramps, offers a small comforting suggestion (heat pad, water, a break, ibuprofen only as "if that's okay for you"), asks a gentle follow-up.
- If she mentions exams/assignments/deadlines near her predicted period, Nari acknowledges it and helps her plan (pack pads, plan an easy day).
- Still quietly extracts energy, discomfort, mood, activities. Show the bars card once per day or when values change, not after every message.
- NEVER logs a pad unless she clearly says she used/changed a pad; even then ask to confirm or link to Pad Check. The "log a pad" chip goes to Pad Check.
- Safety stays rule-based in code: urgent words (dizzy, fainting, soaking a pad every hour, severe pain, possibly pregnant) -> get-help card. Emotional crisis -> gently point to 988 Suicide & Crisis Lifeline and UMD Counseling Center. Never diagnose; never say "abnormal" or "diagnosis".
- Voice: lowercase, short, warm, specific.
- Fix the bug where "i feel worse" shows the get-help card twice.
- The chat text box must grow as she types (auto-expanding textarea, like iMessage): starts one line tall, grows up to about 5-6 lines, then scrolls inside. Enter sends, Shift+Enter makes a new line (on phones, the send button sends). It shrinks back after sending. Keep its label for screen readers and make sure the chat thread stays scrolled to the newest message as the box grows.
Likely needs Aryan (Gemini prompt / sendMessage()). Write him a precise message with a suggested system prompt and the response format (reply text + extracted values + flags).

=====================================================================
## P2. EXPLAIN WHAT THE PERIOD SCORE MEANS
Everywhere the score appears (Home, Pad Check, Doctor page) add a "what's this?" explainer:
"your period score adds up how soaked each pad was, plus clots, using the PBAC, a chart doctors have used since 1990. light pad = 1, moderate = 5, full = 20, small clot = 1, large clot = 5, leak = 5. under 100 for a whole period is typical. 100 or more can mean heavy bleeding (more than 80 ml), which is worth a chat with a doctor."
Show progress clearly: "54 of 100 so far this period". Include a tiny visual legend.

=====================================================================
## P3. CALENDAR STOPS AT DECEMBER
Must navigate past December 2026 into 2027+ and back to earlier months. Find whether it's a UI limit or data limit (data = Aryan). Predictions should keep appearing in future months.

=====================================================================
## P4. LANDING PAGE / ENTRY / STYLE GUIDE
- If a style guide page exists (e.g. /styleguide), remove it from the live site or make it dev-only.
- "/" shows the landing page matching the mockups. Every "open nari" -> /login if signed out, /app if signed in or in demo mode. Test landing -> login -> app.

=====================================================================
## P5. GOOGLE CALENDAR (small version tonight)
Full sync with exams/assignments needs Google OAuth + app verification: too big tonight.
- Keep "add next period to Google Calendar" (pre-filled event link). Make sure it works.
- Exam awareness comes from chat (P1).
- Pitch note for later: "next: sync with Google Calendar and Canvas so Nari can warn you when your period lands on exam week."

=====================================================================
## P6. OTHER CHECKS
- Real login: once login works, I'll add the Supabase lines to .env.local. Test sign up, log in with demo@nari.app, sign out, and that each user only sees her own data.
- Doctor page: Ctrl+P / Save as PDF looks clean (no nav, no cut-off sections).
- UMD booking link: tell Aryan UMD_BOOKING_URL points at the general myUHC portal; find a direct appointment link if one exists.
- Accessibility pass: keyboard-only run through every screen, visible focus, screen reader labels, contrast, reduced motion.
- Phone pass: everything usable at 390px, no horizontal scroll, tap targets 44px+.
- Errors/empty states everywhere are calm and helpful, never blank or raw error text.

=====================================================================
## P7. LANDING MOTION: animate to explain, not to decorate (after P0-P2)
Remove purely decorative motion (floating/bobbing spheres, cursor-following, magnetic buttons, loops).
Add only explanatory animations (short, smooth, disabled with prefers-reduced-motion = show end state instantly; no new packages; smooth on phones):
1. "how the score works" scroll story: in a pinned section, one pad fills light -> moderate -> full; "+1", "+5", "+20" chips drop into the glossy red sphere, which fills toward a labeled "100" line. One-line PBAC caption. Reverses on scroll up. (most important)
2. "how it works": blurred photo -> "nari's guess" tag pops on -> tap confirms -> score ticks up.
3. Hero headline types "is this normal?" then "normal?" morphs into "understood."
4. Sections enter with a color-block wipe in their section color.

=====================================================================
## P8. APP-WIDE MOTION (after P7; same rule)
1. Tab switches: the red sphere travels to its place on the next screen (View Transitions API, fade fallback).
2. Home open: score sphere fills 0 -> current; this period's day dots appear in order.
3. Day tap: panel grows out of the tapped day; bars grow 0 -> value.
4. Health signal card: connectors draw from its two reasons ("score 100+", "tired 4 of 5 days") into the message.
5. Pad Check: photo unblurs on tap; "nari's guess" pops on; "+N" chip flies into the sphere; number counts up.
6. Chat: key phrases in the user's bubble highlight and slide into the bars card; typing dots while waiting.
7. Settings: changing cycle/period length moves predicted dots live on a mini calendar preview.
8. Skip to tomorrow: date flips like a calendar page, then Nari's new message slides in.
9. Doctor page: sections assemble in order.
10. Get-help card: NO animation. Instant and still.
Order: 2, 3, 5, 6, 1, 8, then the rest if time allows.

=====================================================================
## TIME RULE
P0-P2 are must-haves for the demo. Feature freeze around 2am, even if P7/P8 aren't finished. After that: only bug fixes, deploy check, backup demo video, Devpost, demo practice.
At the very end, re-run the full click-through and tell me what's still broken.
