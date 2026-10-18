// "how the score works": a pinned scroll story. CSS scroll-driven animations only (globals.css, .story-*).
// Without support or with reduced motion it simply shows the finished state.

const STEPS = [
  { label: "light pad", pts: 1 },
  { label: "moderate pad", pts: 5 },
  { label: "full pad", pts: 20 },
];

export function ScoreStory() {
  return (
    <section aria-labelledby="story-title" className="story px-5 sm:px-10">
      <div className="story-sticky mx-auto grid max-w-[1240px] items-center gap-10 py-16 md:grid-cols-[1fr_auto] md:gap-16">
        <div className="flex flex-col gap-6">
          <h2 id="story-title" className="font-serif text-[clamp(2.75rem,6.5vw,5.2rem)] leading-[0.95] tracking-[-0.02em] text-blue">
            how your score <em>adds up.</em>
          </h2>
          <ol className="flex flex-col gap-3 text-[1.15rem]">
            {STEPS.map((s, i) => (
              <li key={s.label} className={`story-step story-step-${i + 1} flex items-baseline gap-3`}>
                <span className="font-serif text-4xl leading-none text-red">+{s.pts}</span>
                <span>
                  a {s.label} adds {s.pts} {s.pts === 1 ? "point" : "points"}
                </span>
              </li>
            ))}
          </ol>
          <p className="max-w-[36rem] leading-relaxed text-ink/90">
            clots and leaks add a few more. nari keeps the running total for each period, using the PBAC chart doctors have used since
            1990. 100 or more in one period suggests heavy bleeding, and that&apos;s worth a doctor chat.
          </p>
        </div>

        {/* the picture: pad → chips → sphere. decorative; the list above says the same thing in words */}
        <div aria-hidden="true" className="story-visual relative mx-auto h-[17rem] w-[21rem] shrink-0">
          {/* pad */}
          <svg viewBox="0 0 40 75" className="absolute left-2 top-14 h-[10.5rem] w-[5.6rem]">
            <rect x="2" y="2" width="36" height="71" rx="18" fill="#fbf8f2" stroke="#1f2340" strokeWidth="2.2" />
            <ellipse className="story-stain story-stain-1" cx="20" cy="37.5" rx="5" ry="6" fill="#b83e4b" />
            <ellipse className="story-stain story-stain-2" cx="20" cy="37.5" rx="11" ry="18" fill="#b83e4b" />
            <rect className="story-stain story-stain-3" x="6.5" y="6.5" width="27" height="62" rx="13.5" fill="#b83e4b" />
          </svg>

          {/* point chips that drop into the sphere */}
          {STEPS.map((s, i) => (
            <span
              key={s.label}
              className={`story-chip story-chip-${i + 1} absolute left-8 top-6 rounded-pill bg-red px-3 py-1 font-bold text-white shadow-md`}
            >
              +{s.pts}
            </span>
          ))}

          {/* glass sphere with the 100 line */}
          <div className="absolute right-0 top-10 size-[11rem]">
            <div
              className="relative size-full overflow-hidden rounded-full"
              style={{
                background: "radial-gradient(circle at 38% 30%, #f3ede3 0%, #e6ddcf 60%, #d7ccba 100%)",
                boxShadow: "inset -8px -10px 24px rgb(31 35 64 / 0.12)",
              }}
            >
              <span
                className="story-liquid absolute inset-0 origin-bottom"
                style={{ background: "radial-gradient(circle at 45% 20%, #cf5a67 0%, #b83e4b 50%, #8a2c38 100%)" }}
              />
              <span
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(circle at 30% 24%, rgb(255 255 255 / 0.75) 0%, rgb(255 255 255 / 0.2) 12%, transparent 26%)",
                  boxShadow: "inset -7px -12px 20px rgb(70 14 24 / 0.22)",
                }}
              />
            </div>
            <span className="absolute inset-x-0 top-[4%] border-t-2 border-dashed border-ink/50" />
            <span className="absolute -right-1 top-[4%] -translate-y-[130%] text-sm font-bold text-ink">100</span>
            <span className="story-count absolute inset-x-0 -bottom-12 text-center font-serif text-5xl leading-none text-blue" />
          </div>
        </div>
      </div>
    </section>
  );
}
