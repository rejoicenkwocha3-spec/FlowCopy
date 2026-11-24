import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ResetForm } from "./reset-form";
import { AuthShell } from "@/components/auth-ui";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Choose a new password" };
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  // The recovery link signs the user in; without a session the link is invalid or expired.
  if (!getSupabaseEnv()) redirect("/login?error=not_configured");
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login?error=link_expired");

  return (
    <AuthShell title="Choose a new password" subtitle="Pick a strong password you have not used before.">
      <ResetForm />
    </AuthShell>
  );
}
