import type { Metadata } from "next";
import { SettingsView } from "@/components/settings/SettingsView";
import { getSettings } from "@/lib/actions/settings";

export const metadata: Metadata = { title: "settings · nari." };

export default async function SettingsPage() {
  const profile = await getSettings();
  return <SettingsView profile={profile} />;
}
