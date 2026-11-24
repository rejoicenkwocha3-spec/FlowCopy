import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { AuthShell } from "@/components/auth-ui";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue to your workspace.">
      <Suspense><LoginForm /></Suspense>
    </AuthShell>
  );
}
