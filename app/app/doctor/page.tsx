import type { Metadata } from "next";
import { DoctorView } from "@/components/doctor/DoctorView";
import { getDoctor } from "@/lib/actions/doctor";

export const metadata: Metadata = { title: "for your doctor · nari." };

export default async function DoctorPage() {
  const data = await getDoctor();
  return <DoctorView data={data} />;
}
