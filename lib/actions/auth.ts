"use server";

// Auth server actions. Use with React's useActionState in the login/signup forms:
//   const [state, action, pending] = useActionState(signIn, {});
//   <form action={action}> <input name="email"> <input name="password"> ...
// Sign up also reads an optional "name" field.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "../supabase/config";
import { createClient } from "../supabase/server";

export interface AuthState {
  error?: string;
}

function field(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function friendly(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "that email and password don't match. try again?";
  if (m.includes("already registered")) return "there's already an account with that email. try logging in.";
  if (m.includes("password")) return "your password needs at least 6 characters.";
  if (m.includes("email")) return "that email doesn't look right.";
  return "something went wrong. try again in a sec.";
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured) redirect("/app");
  const email = field(formData, "email");
  const password = field(formData, "password");
  const name = field(formData, "name").slice(0, 40);
  if (!email || !password) return { error: "add your email and a password." };
  if (password.length < 6) return { error: "your password needs at least 6 characters." };
  const db = await createClient();
  const { error } = await db.auth.signUp({ email, password, options: { data: { name } } });
  if (error) return { error: friendly(error.message) };
  revalidatePath("/", "layout");
  redirect("/app");
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured) redirect("/app");
  const email = field(formData, "email");
  const password = field(formData, "password");
  if (!email || !password) return { error: "add your email and password." };
  const db = await createClient();
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) return { error: friendly(error.message) };
  revalidatePath("/", "layout");
  redirect("/app");
}

/** "try the demo": logs into the shared judge account (DEMO_EMAIL / DEMO_PASSWORD). */
export async function tryDemo(): Promise<AuthState> {
  if (!isSupabaseConfigured) redirect("/app");
  const email = process.env.DEMO_EMAIL;
  const password = process.env.DEMO_PASSWORD;
  if (!email || !password) return { error: "the demo account isn't set up yet." };
  const db = await createClient();
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) return { error: friendly(error.message) };
  revalidatePath("/", "layout");
  redirect("/app");
}

export async function signOut(): Promise<never> {
  if (isSupabaseConfigured) {
    const db = await createClient();
    await db.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/login");
}
