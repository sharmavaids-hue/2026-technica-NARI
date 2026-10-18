import { Hero } from "@/components/landing/Hero";
import { PadPond } from "@/components/landing/PadPond";
import { ScoreStory } from "@/components/landing/ScoreStory";
import { HabitsSection, HeavySection, LandingFooter, TrustSection } from "@/components/landing/Sections";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <HeavySection />
        <ScoreStory />
        <PadPond />
        <HabitsSection />
        <TrustSection />
      </main>
      <LandingFooter />
    </>
  );
}
