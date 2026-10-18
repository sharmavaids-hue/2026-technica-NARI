"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, signUp, tryDemo, type AuthState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";

const field =
  "min-h-12 w-full rounded-[14px] border-[1.5px] border-line bg-card px-4 text-base text-ink placeholder:text-muted/70 " +
  "focus-visible:border-blue";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(mode === "login" ? signIn : signUp, {});
  const [demoState, demoAction, demoPending] = useActionState<AuthState, FormData>(() => tryDemo(), {});
  const error = state.error ?? demoState.error;

  return (
    <div className="flex flex-col gap-6">
      <form action={action} className="flex flex-col gap-4" noValidate>
        {mode === "signup" && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="font-bold">
              what should nari call you?
            </label>
            <input id="name" name="name" type="text" autoComplete="given-name" maxLength={40} className={field} />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="font-bold">
            email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            aria-describedby={error ? "auth-error" : undefined}
            className={field}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="font-bold">
            password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={6}
            aria-describedby={mode === "signup" ? "pw-hint" : undefined}
            className={field}
          />
          {mode === "signup" && (
            <span id="pw-hint" className="text-sm text-muted">
              at least 6 characters
            </span>
          )}
        </div>

        <p id="auth-error" role="alert" className="min-h-6 font-bold text-red">
          {error}
        </p>

        <Button type="submit" size="lg" disabled={pending} className="w-full">
          {pending ? (mode === "login" ? "logging in…" : "making your account…") : mode === "login" ? "log in" : "make my account"}
        </Button>
      </form>

      <form action={demoAction}>
        <Button type="submit" variant="outline" className="w-full" disabled={demoPending}>
          {demoPending ? "opening the demo…" : "try the demo account"}
        </Button>
      </form>

      <p className="text-center">
        {mode === "login" ? "new here? " : "already have an account? "}
        <Link href={mode === "login" ? "/signup" : "/login"} className="font-bold text-blue underline underline-offset-4">
          {mode === "login" ? "make an account" : "log in"}
        </Link>
      </p>
    </div>
  );
}
