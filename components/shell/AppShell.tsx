"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/ui/Wordmark";
import { CalendarIcon, CameraIcon, ChatIcon, DoctorIcon, SettingsIcon } from "@/components/ui/icons";

const NAV = [
  { href: "/app", label: "home", Icon: CalendarIcon },
  { href: "/app/chat", label: "chat", Icon: ChatIcon },
  { href: "/app/pad", label: "pad check", Icon: CameraIcon },
  { href: "/app/doctor", label: "for your doctor", short: "doctor", Icon: DoctorIcon },
  { href: "/app/settings", label: "settings", Icon: SettingsIcon },
];

function isActive(pathname: string, href: string) {
  return href === "/app" ? pathname === "/app" : pathname.startsWith(href);
}

/** Sidebar on laptops (lg+), wordmark header + bottom tab bar on phones. */
export function AppShell({ name, children }: { name: string; children: ReactNode }) {
  const pathname = usePathname();
  const initial = (name || "you").trim().charAt(0).toLowerCase();
  const subtitle = pathname.startsWith("/app/pad") ? "photos are never saved" : "private account";

  return (
    <div className="flex min-h-dvh flex-1">
      <a
        href="#main"
        className="sr-only-focusable fixed left-3 top-3 z-50 rounded-pill bg-blue px-5 py-3 font-bold text-white"
      >
        skip to main content
      </a>

      {/* ---------- laptop sidebar ---------- */}
      <aside className="no-print sticky top-0 hidden h-dvh w-[250px] shrink-0 flex-col border-r border-line px-5 pb-6 pt-8 lg:flex">
        <Link href="/app" aria-label="nari home" className="self-start rounded-md">
          <Wordmark size={44} />
        </Link>
        <nav aria-label="main" className="mt-9">
          <ul className="flex flex-col gap-1.5">
            {NAV.map(({ href, label, Icon }) => {
              const active = isActive(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-12 items-center gap-3 rounded-[12px] px-4 font-bold transition-colors ${
                      active ? "bg-blue text-white" : "text-ink hover:bg-ink/5"
                    }`}
                  >
                    <Icon size={20} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-auto flex items-center gap-3 rounded-[16px] border border-line bg-card/70 p-3">
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sage font-serif text-2xl text-ink"
          >
            {initial}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-bold">{name || "you"}</span>
            <span className="text-sm text-muted">{subtitle}</span>
          </span>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* ---------- phone header ---------- */}
        <header className="no-print flex items-center justify-between px-5 pt-5 lg:hidden">
          <Link href="/app" aria-label="nari home" className="rounded-md">
            <Wordmark size={34} />
          </Link>
          <span className="text-sm text-muted">{subtitle}</span>
        </header>

        <main id="main" tabIndex={-1} className="flex flex-1 flex-col pb-[calc(5.5rem+env(safe-area-inset-bottom))] outline-none lg:pb-0">
          {children}
        </main>
      </div>

      {/* ---------- phone tab bar ---------- */}
      <nav
        aria-label="main"
        className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden"
      >
        <ul className="mx-auto grid max-w-xl grid-cols-5">
          {NAV.map(({ href, label, short, Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[0.8rem] font-bold ${
                    active ? "text-blue" : "text-muted"
                  }`}
                >
                  <span
                    className={`flex h-8 w-14 items-center justify-center rounded-pill transition-colors ${
                      active ? "bg-blue text-white" : ""
                    }`}
                  >
                    <Icon size={20} />
                  </span>
                  {short ?? label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
