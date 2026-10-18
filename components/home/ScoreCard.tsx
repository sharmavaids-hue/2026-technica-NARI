import type { Score } from "@/lib/types";
import { ScoreSphere } from "@/components/ui/Sphere";
import { StatusPill } from "@/components/ui/StatusPill";

/** "period score 48 / 100 · looks typical so far" with the filling sphere. */
export function ScoreCard({ score, className = "" }: { score: Score; className?: string }) {
  return (
    <section
      aria-label="period score"
      className={`flex items-center gap-4 rounded-card border border-line bg-card px-4 py-3.5 sm:gap-5 sm:px-5 ${className}`}
    >
      <ScoreSphere size={84} fill={score.fill} />
      <div className="flex flex-col">
        <span className="text-[0.95rem] text-muted">period score</span>
        <span className="font-serif text-[3.1rem] leading-[0.95] text-blue">
          {score.value}
          <span className="ml-1 text-2xl text-muted">
            <span className="sr-only"> out of </span>
            <span aria-hidden="true">/ </span>100
          </span>
        </span>
        <StatusPill state={score.state} label={score.label} variant="inline" className="mt-1 text-[0.95rem]" />
      </div>
    </section>
  );
}
