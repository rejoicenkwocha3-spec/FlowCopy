import type { Metadata } from "next";
import { ForgotForm } from "./forgot-form";
import { AuthShell } from "@/components/auth-ui";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Reset your password" subtitle="Enter your email and we will send you a reset link.">
      <ForgotForm />
    </AuthShell>
  );
}
