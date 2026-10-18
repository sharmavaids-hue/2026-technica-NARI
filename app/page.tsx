import { Hero } from "@/components/landing/Hero";
import { HabitsSection, HeavySection, LandingFooter, TrustSection } from "@/components/landing/Sections";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <HeavySection />
        <HabitsSection />
        <TrustSection />
      </main>
      <LandingFooter />
    </>
  );
}
