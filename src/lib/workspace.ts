import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getCtx() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("You are signed out. Please sign in again.");
  const pick = () => supabase.from("fc_workspaces").select("id, name").limit(1).maybeSingle();
  let { data: ws } = await pick();
  let detail = "";
  if (!ws) {
    const { error } = await supabase.rpc("flowcopy_ensure_workspace");
    if (error) detail = ` Database says: ${error.message}`;
    ({ data: ws } = await pick());
  }
  if (!ws) const host = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/^https?:\/\//, "").split(".")[0];
    throw new Error(`Workspace not found for this account. Site is connected to Supabase project "${host}".${detail}`);
  return { supabase, user: data.user, workspaceId: ws.id as string, workspaceName: ws.name as string };
}

type Ctx = Awaited<ReturnType<typeof getCtx>>;

/** System prompt that applies the workspace Brand Voice and Infobase to every generation. */
export async function buildSystem(ctx: Ctx, role: string): Promise<string> {
  const [{ data: voice }, { data: facts }] = await Promise.all([
    ctx.supabase.from("fc_brand_voices").select("name, tone, guidelines, avoid").eq("workspace_id", ctx.workspaceId).maybeSingle(),
    ctx.supabase.from("fc_infobase_items").select("title, content").eq("workspace_id", ctx.workspaceId).order("created_at").limit(25),
  ]);
  const parts = [role, "Return only the finished result, with no preamble."];
  if (voice && (voice.tone || voice.guidelines || voice.avoid)) {
    parts.push(
      `BRAND VOICE (${voice.name}):` +
        (voice.tone ? `\nTone: ${voice.tone}` : "") +
        (voice.guidelines ? `\nGuidelines: ${voice.guidelines}` : "") +
        (voice.avoid ? `\nAvoid: ${voice.avoid}` : ""),
    );
  }
  if (facts?.length) parts.push("COMPANY KNOWLEDGE (use when relevant):\n" + facts.map((f) => `- ${f.title}: ${f.content}`).join("\n"));
  return parts.join("\n\n");
}

/** For pages: show a readable problem page instead of a crash. */
export async function pageCtx() {
  try {
    return await getCtx();
  } catch (e) {
    const m = e instanceof Error ? e.message : "Unknown error";
    redirect(`/dashboard/problem?m=${encodeURIComponent(m)}`);
  }
}
