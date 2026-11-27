import { createClient } from "@/lib/supabase/server";

export async function getCtx() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("You are signed out. Please sign in again.");
  const pick = () => supabase.from("fc_workspaces").select("id, name").limit(1).maybeSingle();
  let { data: ws } = await pick();
  if (!ws) {
    await supabase.rpc("flowcopy_ensure_workspace");
    ({ data: ws } = await pick());
  }
  if (!ws) throw new Error("Workspace not found.");
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
