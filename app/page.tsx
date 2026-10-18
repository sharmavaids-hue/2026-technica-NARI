import { GetBelieved } from "@/components/landing/GetBelieved";
import { Hero } from "@/components/landing/Hero";
import { Noise } from "@/components/landing/Noise";
import { PadPond } from "@/components/landing/PadPond";
import { Ribbon } from "@/components/landing/Ribbon";
import { ScoreStory } from "@/components/landing/ScoreStory";
import { HabitsSection, HeavySection, LandingFooter, TrustSection } from "@/components/landing/Sections";
import { TypeBand } from "@/components/landing/TypeBand";

export default function Home() {
  return (
    <div className="relative overflow-x-clip">
      <Ribbon />
      <main>
        <Hero />
        <Noise />
        <TypeBand />
        <HeavySection />
        <ScoreStory />
        <PadPond />
        <HabitsSection />
        <GetBelieved />
        <TrustSection />
      </main>
      <LandingFooter />
    </div>
  );
}
