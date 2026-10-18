import { Hero } from "@/components/landing/Hero";
import { PadPond } from "@/components/landing/PadPond";
import { Ribbon } from "@/components/landing/Ribbon";
import { ScoreStory } from "@/components/landing/ScoreStory";
import { HabitsSection, HeavySection, LandingFooter, TrustSection } from "@/components/landing/Sections";

export default function Home() {
  return (
    <div className="relative overflow-x-clip">
      <Ribbon />
      <main>
        <Hero />
        <HeavySection />
        <ScoreStory />
        <PadPond />
        <HabitsSection />
        <TrustSection />
      </main>
      <LandingFooter />
    </div>
  );
}
