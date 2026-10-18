import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PadTestBench } from "@/components/pad/PadTestBench";

export const metadata: Metadata = { title: "pad test bench · nari.", robots: { index: false } };

// Local testing only: 404 on the live site.
export default function PadTestPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <PadTestBench />;
}
