import type { Metadata } from "next";
import { pageCtx } from "@/lib/workspace";
import { typeLabel } from "@/lib/content-types";
import { Generator } from "./generator";
import { ContentItem } from "./item";

export const metadata: Metadata = { title: "Content" };

export default async function ContentPage() {
  const { supabase, workspaceId } = await pageCtx();
  const { data } = await supabase.from("fc_content").select("id, title, body, type, created_at").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(100);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Content</h1>
        <p className="mt-1 text-sm text-text-muted">Generate on-brand content with AI, then edit and keep it in your library.</p>
      </div>
      <Generator />
      <section className="space-y-3">
        <h2 className="font-bold text-ink">Library ({data?.length ?? 0})</h2>
        {data?.length ? data.map((c) => (
          <ContentItem key={c.id} id={c.id} title={c.title} body={c.body} label={typeLabel(c.type)} date={new Date(c.created_at).toLocaleDateString("en-GB")} />
        )) : <p className="text-sm text-text-muted">Your saved content will appear here.</p>}
      </section>
    </div>
  );
}
