import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthLayout } from "@/components/auth/AuthLayout";

export const metadata: Metadata = { title: "log in · nari." };

export default function LoginPage() {
  return (
    <AuthLayout title="welcome" italic="back.">
      <AuthForm mode="login" />
    </AuthLayout>
  );
}
