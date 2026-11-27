"use server";

import { revalidatePath } from "next/cache";
import { generateText } from "@/lib/ai";
import { buildSystem, getCtx } from "@/lib/workspace";

export type ActionState = { ok?: boolean; error?: string; output?: string; steps?: string[]; message?: string };

const s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const fail = (e: unknown): ActionState => ({ error: e instanceof Error ? e.message : "Something went wrong." });

const TYPES: Record<string, string> = {
  blog_post: "a well structured blog post with a headline, intro, subheadings and a conclusion",
  social_post: "a set of 3 engaging social media posts",
  email: "a marketing email with a subject line and body",
  ad_copy: "3 variations of short, punchy ad copy",
  product_description: "a persuasive product description",
  other: "the requested piece of marketing content",
};

// Content ----------------------------------------------------------------
export async function generateContentAction(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const type = s(fd, "type"), prompt = s(fd, "prompt");
    if (prompt.length < 5) return { error: "Describe what you want to create (at least a few words)." };
    if (prompt.length > 4000) return { error: "Prompt is too long (max 4000 characters)." };
    const ctx = await getCtx();
    const system = await buildSystem(ctx, `You are an expert marketing copywriter. Write ${TYPES[type] ?? TYPES.other}.`);
    return { ok: true, output: await generateText({ system, prompt, maxTokens: 2500 }) };
  } catch (e) { return fail(e); }
}

export async function saveContentAction(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const body = s(fd, "body");
    if (!body) return { error: "Nothing to save." };
    const title = s(fd, "title") || body.split("\n")[0].replace(/^[#*\s]+/, "").slice(0, 80) || "Untitled";
    const ctx = await getCtx();
    const { error } = await ctx.supabase.from("fc_content").insert({
      workspace_id: ctx.workspaceId, type: s(fd, "type") || "other", title, prompt: s(fd, "prompt") || null, body, created_by: ctx.user.id,
    });
    if (error) return { error: error.message };
    revalidatePath("/dashboard", "layout");
    return { ok: true, message: "Saved to your library." };
  } catch (e) { return fail(e); }
}

export async function updateContentAction(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const ctx = await getCtx();
    const { error } = await ctx.supabase.from("fc_content").update({ title: s(fd, "title") || "Untitled", body: s(fd, "body") }).eq("id", s(fd, "id"));
    if (error) return { error: error.message };
    revalidatePath("/dashboard/content");
    return { ok: true, message: "Changes saved." };
  } catch (e) { return fail(e); }
}

export async function deleteContentAction(fd: FormData) {
  const ctx = await getCtx();
  await ctx.supabase.from("fc_content").delete().eq("id", s(fd, "id"));
  revalidatePath("/dashboard", "layout");
}

// Brand voice --------------------------------------------------------------
export async function saveBrandVoiceAction(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const ctx = await getCtx();
    const { error } = await ctx.supabase.from("fc_brand_voices").upsert(
      { workspace_id: ctx.workspaceId, name: s(fd, "name") || "My Brand", tone: s(fd, "tone"), guidelines: s(fd, "guidelines"), avoid: s(fd, "avoid") },
      { onConflict: "workspace_id" },
    );
    if (error) return { error: error.message };
    revalidatePath("/dashboard/brand-voice");
    return { ok: true, message: "Brand voice saved. It now applies to every generation." };
  } catch (e) { return fail(e); }
}

// Infobase -------------------------------------------------------------------
export async function addInfobaseAction(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const title = s(fd, "title"), content = s(fd, "content");
    if (!title || !content) return { error: "Add both a title and the details." };
    const ctx = await getCtx();
    const { error } = await ctx.supabase.from("fc_infobase_items").insert({ workspace_id: ctx.workspaceId, title, content, created_by: ctx.user.id });
    if (error) return { error: error.message };
    revalidatePath("/dashboard/infobase");
    return { ok: true, message: "Added to your Infobase." };
  } catch (e) { return fail(e); }
}

export async function deleteInfobaseAction(fd: FormData) {
  const ctx = await getCtx();
  await ctx.supabase.from("fc_infobase_items").delete().eq("id", s(fd, "id"));
  revalidatePath("/dashboard/infobase");
}

// Agents -------------------------------------------------------------------
export async function createAgentAction(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const name = s(fd, "name"), instructions = s(fd, "instructions");
    if (!name || instructions.length < 10) return { error: "Give the agent a name and clear instructions (10+ characters)." };
    const ctx = await getCtx();
    const { error } = await ctx.supabase.from("fc_agents").insert({
      workspace_id: ctx.workspaceId, name, description: s(fd, "description"), instructions, created_by: ctx.user.id,
    });
    if (error) return { error: error.message };
    revalidatePath("/dashboard", "layout");
    return { ok: true, message: "Agent created." };
  } catch (e) { return fail(e); }
}

export async function deleteAgentAction(fd: FormData) {
  const ctx = await getCtx();
  await ctx.supabase.from("fc_agents").delete().eq("id", s(fd, "id"));
  revalidatePath("/dashboard", "layout");
}

export async function runAgentAction(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const task = s(fd, "task");
    if (task.length < 3) return { error: "Tell the agent what to do." };
    const ctx = await getCtx();
    const { data: agent } = await ctx.supabase.from("fc_agents").select("name, instructions").eq("id", s(fd, "id")).maybeSingle();
    if (!agent) return { error: "Agent not found." };
    const system = await buildSystem(ctx, `You are an AI agent named "${agent.name}". Follow these instructions:\n${agent.instructions}`);
    return { ok: true, output: await generateText({ system, prompt: task, maxTokens: 2500 }) };
  } catch (e) { return fail(e); }
}

// Workflows ----------------------------------------------------------------
export async function createWorkflowAction(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const name = s(fd, "name");
    const steps = s(fd, "steps").split("\n").map((l) => l.replace(/^\s*(\d+[.)]|[-*])\s*/, "").trim()).filter(Boolean);
    if (!name) return { error: "Give the workflow a name." };
    if (steps.length < 1 || steps.length > 8) return { error: "Add between 1 and 8 steps, one per line." };
    const ctx = await getCtx();
    const { error } = await ctx.supabase.from("fc_workflows").insert({
      workspace_id: ctx.workspaceId, name, description: s(fd, "description"), steps: steps.map((instruction) => ({ instruction })), created_by: ctx.user.id,
    });
    if (error) return { error: error.message };
    revalidatePath("/dashboard", "layout");
    return { ok: true, message: "Workflow created." };
  } catch (e) { return fail(e); }
}

export async function deleteWorkflowAction(fd: FormData) {
  const ctx = await getCtx();
  await ctx.supabase.from("fc_workflows").delete().eq("id", s(fd, "id"));
  revalidatePath("/dashboard", "layout");
}

export async function runWorkflowAction(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const input = s(fd, "input");
    if (input.length < 3) return { error: "Provide the starting input for the workflow." };
    const ctx = await getCtx();
    const { data: wf } = await ctx.supabase.from("fc_workflows").select("name, steps").eq("id", s(fd, "id")).maybeSingle();
    const steps = (wf?.steps as { instruction: string }[] | undefined) ?? [];
    if (!wf || !steps.length) return { error: "Workflow not found or has no steps." };
    const outputs: string[] = [];
    let current = input;
    for (const [i, step] of steps.entries()) {
      const system = await buildSystem(ctx, `You are running step ${i + 1} of ${steps.length} in the content workflow "${wf.name}". Step instruction: ${step.instruction}`);
      current = await generateText({ system, prompt: i === 0 ? `Input:\n${current}` : `Output of the previous step:\n${current}`, maxTokens: 2500 });
      outputs.push(current);
    }
    return { ok: true, output: current, steps: outputs };
  } catch (e) { return fail(e); }
}
