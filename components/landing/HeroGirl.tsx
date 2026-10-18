// Original flat illustration (mood: refs 27-29): a girl lounging on a pad, eyes closed, at ease.
// Flat shapes in our palette, ink details. Limbs are "tubes": an ink stroke under a peach stroke.

const INK = "#1f2340";
const SKIN = "#f2c39f";
const SUIT = "#b83e4b";

function Limb({ d, w = 20 }: { d: string; w?: number }) {
  return (
    <>
      <path d={d} fill="none" stroke={INK} strokeWidth={w + 4} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={SKIN} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

export function HeroGirl({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 380" className={className} aria-hidden="true" focusable="false">
      <defs>
        <filter id="hg-soft" x="-20%" y="-40%" width="140%" height="180%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>

      {/* soft shadow on the pink */}
      <ellipse cx="330" cy="318" rx="270" ry="34" fill={INK} opacity="0.14" filter="url(#hg-soft)" />

      {/* the pad: wings + body, quilted channel, embossed dots */}
      <g transform="rotate(-6 320 220)">
        <ellipse cx="330" cy="138" rx="78" ry="44" fill="#fbf8f2" stroke={INK} strokeWidth="2.5" />
        <ellipse cx="330" cy="302" rx="78" ry="44" fill="#fbf8f2" stroke={INK} strokeWidth="2.5" />
        <rect x="40" y="150" width="580" height="140" rx="70" fill="#fbf8f2" stroke={INK} strokeWidth="2.5" />
        <rect x="58" y="160" width="544" height="120" rx="60" fill="#fbf8f2" />
        <rect x="96" y="178" width="468" height="84" rx="42" fill="none" stroke="#d6cbb9" strokeWidth="2" strokeDasharray="7 6" />
        {Array.from({ length: 9 }, (_, i) => (
          <circle key={i} cx={150 + i * 46} cy={i % 2 ? 196 : 244} r="2.4" fill="#d6cbb9" />
        ))}
      </g>

      {/* her, lying along the pad, head on the left */}
      <g transform="translate(6 -6)">
        {/* back arm folded under her head */}
        <Limb d="M206 188 C196 158 176 140 150 140 C138 140 130 148 132 158" w={18} />
        {/* legs: one straight, one bent at the knee, crossing at the ankles */}
        <Limb d="M352 214 C400 214 450 216 498 222 C520 224 540 226 556 226" w={24} />
        <Limb d="M350 200 C386 168 420 158 446 168 C470 178 500 206 552 214" w={23} />
        {/* feet */}
        <ellipse cx="566" cy="224" rx="15" ry="9" fill={SKIN} stroke={INK} strokeWidth="2" transform="rotate(8 566 224)" />
        <ellipse cx="562" cy="212" rx="14" ry="8.5" fill={SKIN} stroke={INK} strokeWidth="2" transform="rotate(-6 562 212)" />
        {/* swimsuit torso */}
        <path
          d="M196 180 C236 166 300 170 350 190 C366 198 368 222 352 230 C306 244 244 238 204 226 C186 220 182 190 196 180 Z"
          fill={SUIT}
          stroke={INK}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* halftone on the suit, like riso print */}
        <g fill={INK} opacity="0.18">
          {Array.from({ length: 30 }, (_, i) => (
            <circle key={i} cx={236 + (i % 10) * 10} cy={190 + Math.floor(i / 10) * 12 + (i % 2) * 5} r="1.5" />
          ))}
        </g>
        {/* front arm resting on her belly */}
        <Limb d="M214 214 C246 238 284 240 312 226" w={17} />
        {/* neck + face */}
        <path d="M190 190 C196 186 202 184 208 186" fill="none" stroke={INK} strokeWidth="18" strokeLinecap="round" />
        <path d="M190 190 C196 186 202 184 208 186" fill="none" stroke={SKIN} strokeWidth="14" strokeLinecap="round" />
        <ellipse cx="168" cy="178" rx="27" ry="30" fill={SKIN} stroke={INK} strokeWidth="2.5" transform="rotate(-18 168 178)" />
        {/* closed eye + soft smile + cheek */}
        <path d="M168 170 C173 175 180 175 184 170" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M174 192 C179 195 184 194 187 190" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="188" cy="181" r="5" fill={SUIT} opacity="0.35" />
        {/* hair: a big cloud of curls */}
        <g fill={INK}>
          <circle cx="146" cy="150" r="26" />
          <circle cx="122" cy="172" r="24" />
          <circle cx="170" cy="138" r="22" />
          <circle cx="128" cy="200" r="20" />
          <circle cx="150" cy="214" r="15" />
          <circle cx="196" cy="140" r="14" />
          <circle cx="104" cy="190" r="15" />
        </g>
      </g>
    </svg>
  );
}
