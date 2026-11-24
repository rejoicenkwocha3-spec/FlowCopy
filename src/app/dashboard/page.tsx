import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Overview" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  let { data: workspace } = await supabase.from("workspaces").select("id, name, organization_id").limit(1).maybeSingle();

  // Self heal accounts created before the signup trigger existed.
  if (!workspace) {
    await supabase.rpc("ensure_workspace");
    ({ data: workspace } = await supabase.from("workspaces").select("id, name, organization_id").limit(1).maybeSingle());
  }
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", auth.user!.id).maybeSingle();
  const first = (profile?.full_name ?? "").split(" ")[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">
          Welcome{first ? `, ${first}` : ""}
        </h1>
        <p className="mt-1 text-sm text-text-muted">Your account is active and your workspace is ready.</p>
      </div>
      <div className="card p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Workspace</p>
        <p className="mt-1 text-lg font-bold text-ink">{workspace?.name ?? "Not available"}</p>
        <p className="mt-1 text-sm text-text-muted">Signed in as {auth.user?.email}</p>
      </div>
    </div>
  );
}
