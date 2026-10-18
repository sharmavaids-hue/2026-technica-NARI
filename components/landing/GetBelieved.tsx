import { ButtonLink } from "@/components/ui/Button";

// "get believed" (mood: ref 27): an original flat illustration of three women riding a pad,
// one with a megaphone, next to what the doctor summary does. Illustration is decorative.

const INK = "#1f2340";

function Tube({ d, color, w = 16 }: { d: string; color: string; w?: number }) {
  return (
    <>
      <path d={d} fill="none" stroke={INK} strokeWidth={w + 4} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

function Crew() {
  return (
    <svg viewBox="0 0 520 470" className="h-auto w-full" aria-hidden="true" focusable="false">
      {/* the pad they ride */}
      <g transform="rotate(-10 260 360)">
        <ellipse cx="270" cy="306" rx="62" ry="32" fill="#fbf8f2" stroke={INK} strokeWidth="2.5" />
        <ellipse cx="270" cy="420" rx="62" ry="32" fill="#fbf8f2" stroke={INK} strokeWidth="2.5" />
        <rect x="40" y="318" width="460" height="92" rx="46" fill="#fbf8f2" stroke={INK} strokeWidth="2.5" />
        <rect x="74" y="336" width="392" height="56" rx="28" fill="none" stroke="#d6cbb9" strokeWidth="2" strokeDasharray="6 5" />
      </g>

      {/* left: fist up, mustard set */}
      <g>
        <Tube d="M128 330 L120 286" color="#c98e6a" w={15} />
        <Tube d="M146 330 L152 286" color="#c98e6a" w={15} />
        <rect x="108" y="232" width="56" height="62" rx="20" fill="#736428" stroke={INK} strokeWidth="2.5" />
        <rect x="106" y="276" width="60" height="22" rx="8" fill="#93a29d" stroke={INK} strokeWidth="2.5" />
        <Tube d="M112 244 C96 222 92 196 98 168" color="#c98e6a" w={14} />
        <circle cx="99" cy="160" r="11" fill="#c98e6a" stroke={INK} strokeWidth="2.5" />
        <Tube d="M160 246 C172 262 176 276 172 290" color="#c98e6a" w={14} />
        <circle cx="136" cy="206" r="21" fill="#c98e6a" stroke={INK} strokeWidth="2.5" />
        <path d="M114 200 C112 178 130 168 148 172 C162 176 166 190 158 196 C150 186 132 186 118 204 Z" fill="#b83e4b" stroke={INK} strokeWidth="2" />
        <path d="M128 210 C132 214 138 214 142 210" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* middle: megaphone, royal blue set */}
      <g>
        <Tube d="M232 318 L226 262" color="#8a5a3c" w={16} />
        <Tube d="M252 318 L262 262" color="#8a5a3c" w={16} />
        <rect x="212" y="198" width="60" height="70" rx="22" fill="#26368e" stroke={INK} strokeWidth="2.5" />
        <rect x="210" y="248" width="64" height="24" rx="9" fill="#f7dcad" stroke={INK} strokeWidth="2.5" />
        <Tube d="M262 214 C282 204 298 188 306 168" color="#8a5a3c" w={14} />
        {/* megaphone */}
        <g transform="rotate(-24 310 150)">
          <path d="M300 140 L400 112 L400 196 L300 168 Z" fill="#f2c9ce" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <ellipse cx="400" cy="154" rx="12" ry="42" fill={INK} />
          <rect x="286" y="138" width="18" height="32" rx="5" fill="#f7dcad" stroke={INK} strokeWidth="2.5" />
        </g>
        <g stroke="#fbf8f2" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M432 60 C446 70 452 84 450 100" />
          <path d="M452 40 C474 56 484 80 480 104" />
          <path d="M470 22 C500 44 514 76 508 110" />
        </g>
        <Tube d="M218 214 C206 234 204 252 214 268" color="#8a5a3c" w={14} />
        <circle cx="242" cy="170" r="22" fill="#8a5a3c" stroke={INK} strokeWidth="2.5" />
        <g fill={INK}>
          <circle cx="226" cy="146" r="14" />
          <circle cx="246" cy="138" r="14" />
          <circle cx="264" cy="148" r="12" />
          <circle cx="216" cy="162" r="10" />
        </g>
        <path d="M244 180 C250 184 256 183 260 178" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* right: sitting, sage set, arm up */}
      <g>
        <Tube d="M352 318 C372 314 392 316 402 326" color="#f2c39f" w={16} />
        <Tube d="M352 330 C374 334 394 340 404 352" color="#f2c39f" w={16} />
        <rect x="326" y="252" width="54" height="62" rx="20" fill="#93a29d" stroke={INK} strokeWidth="2.5" />
        <rect x="324" y="300" width="58" height="30" rx="10" fill="#b83e4b" stroke={INK} strokeWidth="2.5" />
        <Tube d="M374 264 C392 246 400 224 398 200" color="#f2c39f" w={13} />
        <circle cx="398" cy="192" r="10" fill="#f2c39f" stroke={INK} strokeWidth="2.5" />
        <circle cx="352" cy="228" r="20" fill="#f2c39f" stroke={INK} strokeWidth="2.5" />
        <path d="M330 226 C326 206 344 196 360 200 C374 204 376 220 372 226 C362 214 344 214 332 232 Z" fill={INK} />
        <path d="M344 236 C348 240 354 240 358 236" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function GetBelieved() {
  return (
    <section aria-labelledby="believed-title" className="on-dark overflow-hidden bg-red px-5 py-20 text-white sm:px-10 sm:py-28">
      <div className="mx-auto grid max-w-[1240px] items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div aria-hidden="true" className="reveal mx-auto w-full max-w-[520px] lg:order-2">
          <Crew />
        </div>
        <div className="reveal flex flex-col items-start gap-6">
          <h2 id="believed-title" className="font-serif text-[clamp(3rem,7vw,6rem)] leading-[0.92] tracking-[-0.02em]">
            get <em>believed.</em>
          </h2>
          <p className="max-w-[34rem] text-[1.15rem] leading-relaxed text-white/95">
            nari turns your pads and check-ins into one page in words doctors already use: your PBAC score, pads per day, clots,
            how tired you&apos;ve been, and the exact sentence to say out loud.
          </p>
          <p className="max-w-[34rem] font-serif text-[1.6rem] leading-snug">
            &ldquo;my PBAC score was 139 and i&apos;m tired most days. can we check my iron?&rdquo;
          </p>
          <ButtonLink href="/login" variant="light" size="lg">
            make my doctor page
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
