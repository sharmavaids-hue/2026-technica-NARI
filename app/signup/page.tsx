import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthLayout } from "@/components/auth/AuthLayout";

export const metadata: Metadata = { title: "make an account · nari." };

export default function SignupPage() {
  return (
    <AuthLayout title="make your" italic="account.">
      <AuthForm mode="signup" />
    </AuthLayout>
  );
}
