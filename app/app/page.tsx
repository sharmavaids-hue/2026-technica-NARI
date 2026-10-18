import type { Metadata } from "next";
import { HomeView } from "@/components/home/HomeView";
import { getHome } from "@/lib/actions/home";

export const metadata: Metadata = { title: "home · nari." };

export default async function HomePage() {
  const data = await getHome();
  return <HomeView data={data} />;
}
