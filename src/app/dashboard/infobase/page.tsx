import type { Metadata } from "next";
import { Trash2 } from "lucide-react";
import { getCtx } from "@/lib/workspace";
import { deleteInfobaseAction } from "../actions";
import { InfobaseForm } from "./form";

export const metadata: Metadata = { title: "Infobase" };

export default async function InfobasePage() {
  const { supabase, workspaceId } = await getCtx();
  const { data } = await supabase.from("fc_infobase_items").select("id, title, content").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Infobase</h1>
        <p className="mt-1 text-sm text-text-muted">Your company&apos;s essential information, used to ground everything the AI writes.</p>
      </div>
      <InfobaseForm />
      <section className="space-y-3">
        {data?.length ? data.map((i) => (
          <div key={i.id} className="card flex items-start justify-between gap-4 p-4">
            <div className="min-w-0"><p className="font-bold text-ink">{i.title}</p><p className="mt-1 whitespace-pre-wrap text-sm text-text-muted">{i.content}</p></div>
            <form action={deleteInfobaseAction}><input type="hidden" name="id" value={i.id} /><button className="btn-secondary h-9 px-3 text-danger" aria-label={`Delete ${i.title}`}><Trash2 className="h-4 w-4" /></button></form>
          </div>
        )) : <p className="text-sm text-text-muted">No entries yet.</p>}
      </section>
    </div>
  );
}
