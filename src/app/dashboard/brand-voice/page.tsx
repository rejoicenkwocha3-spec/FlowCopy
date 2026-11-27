import type { Metadata } from "next";
import { pageCtx } from "@/lib/workspace";
import { BrandVoiceForm } from "./form";

export const metadata: Metadata = { title: "Brand Voice" };

export default async function BrandVoicePage() {
  const { supabase, workspaceId } = await pageCtx();
  const { data } = await supabase.from("fc_brand_voices").select("name, tone, guidelines, avoid").eq("workspace_id", workspaceId).maybeSingle();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Brand Voice</h1>
        <p className="mt-1 text-sm text-text-muted">Applied automatically to content, agents and workflows.</p>
      </div>
      <BrandVoiceForm v={data ?? { name: "My Brand", tone: "", guidelines: "", avoid: "" }} />
    </div>
  );
}
