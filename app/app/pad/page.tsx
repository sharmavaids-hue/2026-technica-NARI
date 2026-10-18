import type { Metadata } from "next";
import { PadCheckView } from "@/components/pad/PadCheckView";
import { getPadCheck } from "@/lib/actions/pad";

export const metadata: Metadata = { title: "pad check · nari." };

export default async function PadPage() {
  const data = await getPadCheck();
  return <PadCheckView data={data} />;
}
