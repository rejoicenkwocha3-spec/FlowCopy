import type { Metadata } from "next";
import { pageCtx } from "@/lib/workspace";
import { AgentCard, AgentForm } from "./client";

export const metadata: Metadata = { title: "Agents" };

export default async function AgentsPage() {
  const { supabase, workspaceId } = await pageCtx();
  const { data } = await supabase.from("fc_agents").select("id, name, description").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Agents</h1>
        <p className="mt-1 text-sm text-text-muted">Reusable AI specialists that follow your instructions, brand voice and Infobase.</p>
      </div>
      <AgentForm />
      <div className="grid gap-4">
        {data?.length ? data.map((a) => <AgentCard key={a.id} {...a} />) : <p className="text-sm text-text-muted">No agents yet.</p>}
      </div>
    </div>
  );
}
