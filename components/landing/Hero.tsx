import { ButtonLink } from "@/components/ui/Button";
import { HeroGirl } from "./HeroGirl";
import { WomanTypewriter } from "./WomanTypewriter";
import { WORDS } from "./womanWords";

// Only the letters we show get downloaded (Google Fonts text= subsetting).
const SCRIPT_TEXT = Array.from(new Set(WORDS.filter((w) => !/^[a-z]+$/.test(w.word)).map((w) => w.word).join(""))).join("");
const SCRIPT_FONTS =
  "https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari&family=Noto+Serif+Bengali&family=Noto+Serif+Tamil" +
  "&family=Noto+Nastaliq+Urdu&family=Noto+Serif+KR&family=Noto+Serif+SC&family=Noto+Serif&display=swap&text=" +
  encodeURIComponent(SCRIPT_TEXT);

/**
 * Poster hero (ref 30): pink riso paper, a giant peach "नारी" cropped behind everything,
 * a girl lounging on a pad in front of it, and "nari" retyping itself as "woman" in other languages.
 */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative flex min-h-dvh flex-col overflow-hidden px-4 pb-6 pt-5 sm:px-10 sm:pb-8 sm:pt-7"
      style={{ background: "radial-gradient(120% 90% at 50% 20%, #f6d9dc 0%, #f2c9ce 100%)" }}
    >
      <link rel="stylesheet" href={SCRIPT_FONTS} precedence="default" />
      <div aria-hidden="true" className="halftone pointer-events-none absolute inset-0 opacity-60" />

      {/* giant background word, cropped by the edges */}
      <p
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-4vw] left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-deva text-[62vw] leading-[1] text-peach sm:bottom-[-6vw] sm:text-[36vw]"
      >
        नारी
      </p>

      {/* small editorial corner labels */}
      <div className="relative z-20 grid grid-cols-2 gap-4 font-serif text-[1.05rem] leading-tight text-blue sm:grid-cols-3 sm:text-[1.2rem]">
        <p>
          nari.
          <br />
          period care, 2026
        </p>
        <p className="hidden text-center sm:block">est. technica</p>
        <p className="text-right">
          made for every
          <br />
          2am question
        </p>
      </div>

      <div className="relative z-20 flex flex-1 flex-col items-center pt-[4vh] text-center">
        <h1 id="hero-title" className="sr-only">
          nari, meaning woman
        </h1>
        <WomanTypewriter />
        <p className="mt-5 max-w-[34rem] font-serif text-[clamp(1.6rem,3.2vw,2.4rem)] leading-[1.1] text-ink">
          is this normal? <em>now you&apos;ll know.</em>
        </p>
        <p className="mt-3 max-w-[32rem] text-[1.05rem] leading-relaxed text-ink">
          nari scores your period from a pad photo, checks in like a friend, and helps you get believed.
        </p>
        <ButtonLink href="/login" size="lg" className="mt-6">
          open nari
        </ButtonLink>
      </div>

      {/* the girl on her pad, overlapping the giant word */}
      <div className="pointer-events-none relative z-10 mx-auto -mb-2 mt-4 w-[min(92vw,620px)] sm:-mt-6">
        <HeroGirl className="h-auto w-full" />
      </div>

      <div className="relative z-20 grid grid-cols-2 items-end gap-4 font-serif text-[1.05rem] leading-tight text-blue sm:text-[1.2rem]">
        <p>
          know if your period is
          <br />
          actually heavy.
        </p>
        <p className="text-right">
          snap. check in.
          <br />
          get believed.
        </p>
      </div>
    </section>
  );
}
