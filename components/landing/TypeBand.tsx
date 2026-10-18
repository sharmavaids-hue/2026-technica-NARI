import { HeroType } from "./HeroType";

/** The full-bleed, cursor-reactive "know your flow / trust your body" band, right after the noise. */
export function TypeBand() {
  return (
    <section aria-label="know your flow, trust your body" className="relative overflow-hidden px-4 py-[8vh] sm:px-10">
      <HeroType />
    </section>
  );
}
