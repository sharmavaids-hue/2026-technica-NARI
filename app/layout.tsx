import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Caveat, Instrument_Serif, Special_Elite } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

// calendar month covers only: handwritten month names + tiny typewriter notes
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"], weight: ["500", "700"] });
const specialElite = Special_Elite({ variable: "--font-special-elite", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "nari. know your flow",
  description:
    "know if your period is actually heavy, notice patterns, and get taken seriously by a doctor.",
};

// no maximumScale / userScalable: pinch-zoom must keep working
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f5f0e8",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${atkinson.variable} ${caveat.variable} ${specialElite.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
