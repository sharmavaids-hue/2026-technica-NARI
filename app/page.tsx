import { Hero } from "@/components/landing/Hero";
import { ScoreStory } from "@/components/landing/ScoreStory";
import { HabitsSection, HeavySection, LandingFooter, TrustSection } from "@/components/landing/Sections";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <HeavySection />
        <ScoreStory />
        <HabitsSection />
        <TrustSection />
      </main>
      <LandingFooter />
    </>
  );
}
