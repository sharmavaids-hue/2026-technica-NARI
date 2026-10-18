import type { Score } from "@/lib/types";
import { ScoreExplainer } from "@/components/ui/ScoreExplainer";
import { scoreProgress } from "@/components/ui/scoreProgress";
import { ScoreSphere } from "@/components/ui/Sphere";
import { StatusPill } from "@/components/ui/StatusPill";

/** "period score 48 · 48 of 100 so far this period · looks typical so far" with the filling sphere. */
export function ScoreCard({ score, className = "" }: { score: Score; className?: string }) {
  return (
    <section
      aria-label="period score"
      className={`flex items-center gap-4 rounded-card border border-line bg-card px-4 py-3.5 sm:gap-5 sm:px-5 ${className}`}
    >
      <ScoreSphere size={84} fill={score.fill} />
      <div className="flex min-w-0 flex-col">
        <span className="flex items-center justify-between gap-3 text-[0.95rem] text-muted">
          period score
          <ScoreExplainer score={score} className="-my-3 text-sm" />
        </span>
        <span className="font-serif text-[3.1rem] leading-[0.95] text-blue">
          {score.value}
          <span className="ml-1 text-2xl text-muted">
            <span className="sr-only"> out of </span>
            <span aria-hidden="true">/ </span>100
          </span>
        </span>
        <span className="text-sm text-muted">{scoreProgress(score.value)}</span>
        <StatusPill state={score.state} label={score.label} variant="inline" className="mt-1 text-[0.95rem]" />
      </div>
    </section>
  );
}
