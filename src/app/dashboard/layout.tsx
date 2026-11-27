import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { logoutAction } from "@/app/actions/auth";
import { Logo } from "@/components/logo";
import { LogOut } from "lucide-react";
import { DashNav } from "./nav";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!getSupabaseEnv()) redirect("/login?error=not_configured");
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const { data: profile } = await supabase.from("fc_profiles").select("full_name").eq("id", data.user.id).maybeSingle();

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-text-muted sm:inline">{profile?.full_name ?? data.user.email}</span>
            <form action={logoutAction}>
              <button className="btn-secondary h-10 px-3.5"><LogOut className="h-4 w-4" />Log out</button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[210px_1fr] lg:py-8">
        <aside><DashNav /></aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
