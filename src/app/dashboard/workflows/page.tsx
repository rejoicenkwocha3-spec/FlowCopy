import type { Metadata } from "next";
import { getCtx } from "@/lib/workspace";
import { WorkflowCard, WorkflowForm } from "./client";

export const metadata: Metadata = { title: "Workflows" };

export default async function WorkflowsPage() {
  const { supabase, workspaceId } = await getCtx();
  const { data } = await supabase.from("fc_workflows").select("id, name, description, steps").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Workflows</h1>
        <p className="mt-1 text-sm text-text-muted">Chain AI steps together and run your whole process in one click.</p>
      </div>
      <WorkflowForm />
      <div className="grid gap-4">
        {data?.length ? data.map((w) => (
          <WorkflowCard key={w.id} id={w.id} name={w.name} description={w.description} steps={((w.steps as { instruction: string }[]) ?? []).map((s) => s.instruction)} />
        )) : <p className="text-sm text-text-muted">No workflows yet.</p>}
      </div>
    </div>
  );
}
