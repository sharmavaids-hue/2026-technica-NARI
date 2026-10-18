import { AppShell } from "@/components/shell/AppShell";
import { getSettings } from "@/lib/actions/settings";

export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const profile = await getSettings();
  return <AppShell name={profile.name}>{children}</AppShell>;
}
