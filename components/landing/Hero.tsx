import Link from "next/link";
import { HeroType } from "./HeroType";

// Runs before paint: the intro plays once per visit, then the hero just appears.
const INTRO_ONCE = `try{if(sessionStorage.getItem('nari.intro'))document.documentElement.dataset.intro='seen';sessionStorage.setItem('nari.intro','1')}catch(e){}`;

/** Poster hero: corner labels, full-bleed editorial type, the "nari." pill. */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative flex min-h-[72dvh] flex-col overflow-hidden px-4 pb-6 pt-5 sm:min-h-dvh sm:px-10 sm:pb-8 sm:pt-7">
      <script dangerouslySetInnerHTML={{ __html: INTRO_ONCE }} />
      <h1 id="hero-title" className="sr-only">
        nari. know your flow, trust your body.
      </h1>

      {/* top labels */}
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

      {/* the poster: type is the hero */}
      <div className="relative flex flex-1 flex-col justify-center py-4">
        <HeroType />
      </div>

      {/* bottom labels */}
      <div className="relative z-20 grid grid-cols-[1fr_auto_1fr] items-end gap-4 font-serif text-[1.05rem] leading-tight text-blue sm:text-[1.2rem]">
        <p>
          know if your period is
          <br />
          actually heavy.
        </p>
        <Link
          href="/login"
          aria-label="open nari"
          className="inline-flex min-h-11 items-center rounded-pill border-[1.5px] border-blue px-5 text-[1.3rem] hover:bg-blue hover:text-white"
        >
          nari.
        </Link>
        <p className="text-right">
          snap. check in.
          <br />
          get believed.
        </p>
      </div>
    </section>
  );
}
