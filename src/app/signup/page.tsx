import type { Metadata } from "next";
import { SignupForm } from "./signup-form";
import { AuthShell } from "@/components/auth-ui";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <AuthShell title="Create your account" subtitle="Start building content and workflows in minutes.">
      <SignupForm />
    </AuthShell>
  );
}
