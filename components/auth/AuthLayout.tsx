import Link from "next/link";
import type { ReactNode } from "react";
import { Sphere } from "@/components/ui/Sphere";
import { Wordmark } from "@/components/ui/Wordmark";

/** Shared poster-style frame for /login and /signup. */
export function AuthLayout({ title, italic, children }: { title: string; italic: string; children: ReactNode }) {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-12">
      {/* decorative spheres, kept off the form */}
      <Sphere size={220} className="pointer-events-none absolute -right-20 -top-16" />
      <Sphere size={90} className="pointer-events-none absolute -bottom-6 left-[8%] max-sm:hidden" />

      <div className="relative w-full max-w-[28rem] rounded-card border border-line bg-card/95 p-7 shadow-[0_24px_60px_-30px_rgb(31_35_64/0.35)] sm:p-9">
        <Link href="/" aria-label="nari home" className="inline-flex min-h-11 items-center rounded-md">
          <Wordmark size={40} />
        </Link>
        <h1 className="mb-6 mt-5 font-serif text-[2.75rem] leading-[1] text-blue">
          {title} <em>{italic}</em>
        </h1>
        {children}
      </div>
    </main>
  );
}
