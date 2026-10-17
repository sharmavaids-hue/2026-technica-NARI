import { ButtonLink } from "@/components/ui/Button";
import { Sphere } from "@/components/ui/Sphere";
import { Wordmark } from "@/components/ui/Wordmark";

// Temporary landing until M5 builds the full poster page from design/landing-full.png.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-5 py-16 text-center">
      <Sphere size={140} shadow className="float" />
      <h1 className="font-serif text-[clamp(3rem,10vw,6.5rem)] leading-[0.9] text-blue">
        know your flow
        <br />
        <em>trust your body</em>
      </h1>
      <Wordmark size={40} />
      <div className="flex flex-wrap justify-center gap-3">
        <ButtonLink href="/app">open nari</ButtonLink>
        <ButtonLink href="/styleguide" variant="outline">styleguide</ButtonLink>
      </div>
    </main>
  );
}
