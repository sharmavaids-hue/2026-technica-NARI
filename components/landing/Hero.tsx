import Link from "next/link";
import { PuffyPad } from "./PuffyPad";

const LINES = ["know your flow", "trust your body", "know your flow", "trust your body", "know your flow"];

/** Poster hero: corner labels, stacked serif lines, the glossy sphere and puffy pad casting soft shadows. */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative flex min-h-[86dvh] flex-col overflow-hidden px-4 sm:min-h-dvh pb-6 pt-5 sm:px-10 sm:pb-8 sm:pt-7">
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

      {/* the poster */}
      <div className="relative flex flex-1 items-center justify-center py-6">
        <div aria-hidden="true" className="relative w-full max-w-[1100px] [container-type:inline-size]">
          <p className="text-center font-serif text-[18.5cqw] leading-[0.86] tracking-[-0.02em] text-blue sm:text-[17cqw]">
            {LINES.map((l, i) => (
              <span key={i} className={`block whitespace-nowrap ${i % 2 ? "italic" : ""}`}>
                {l}
              </span>
            ))}
          </p>

          {/* cast shadows sit on the "paper", under the floating objects */}
          <span className="pointer-events-none absolute left-[24%] top-[60%] h-[16cqw] w-[44cqw] rotate-[8deg] rounded-[50%] bg-ink/25 mix-blend-multiply blur-[22px]" />
          <span className="pointer-events-none absolute left-[58%] top-[63%] h-[11cqw] w-[38cqw] rotate-[6deg] rounded-[50%] bg-ink/20 mix-blend-multiply blur-[20px]" />

          {/* sphere */}
          <span
            className="float sphere absolute left-[18%] top-[22%] aspect-square w-[37cqw] sm:left-[19%] sm:w-[36cqw]"
            style={{ ["--s" as string]: "36cqw" }}
          />
          {/* puffy pad */}
          <PuffyPad className="float-slow absolute left-[56%] top-[36%] w-[40cqw] drop-shadow-[0_10px_14px_rgb(31_35_64/0.12)] sm:left-[57%]" />
        </div>
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
