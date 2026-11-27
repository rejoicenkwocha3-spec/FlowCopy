import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, BookOpen, FileText, Mic2, Workflow } from "lucide-react";
import { getCtx } from "@/lib/workspace";
import { typeLabel } from "@/lib/content-types";

export const metadata: Metadata = { title: "Overview" };

export default async function DashboardPage() {
  const { supabase, user, workspaceId, workspaceName } = await getCtx();
  const count = async (t: string) => (await supabase.from(t).select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId)).count ?? 0;
  const [content, agents, workflows, facts, profile, recent, voice] = await Promise.all([
    count("fc_content"), count("fc_agents"), count("fc_workflows"), count("fc_infobase_items"),
    supabase.from("fc_profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase.from("fc_content").select("id, title, type, created_at").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(5),
    supabase.from("fc_brand_voices").select("id").eq("workspace_id", workspaceId).maybeSingle(),
  ]);
  const first = (profile.data?.full_name ?? "").split(" ")[0];
  const stats = [
    ["Content pieces", content, "/dashboard/content", FileText],
    ["Infobase entries", facts, "/dashboard/infobase", BookOpen],
    ["Agents", agents, "/dashboard/agents", Bot],
    ["Workflows", workflows, "/dashboard/workflows", Workflow],
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Welcome{first ? `, ${first}` : ""}</h1>
        <p className="mt-1 text-sm text-text-muted">{workspaceName} · {user.email}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, n, href, Icon]) => (
          <Link key={label} href={href} className="card p-5 transition hover:border-brand/40">
            <Icon className="h-5 w-5 text-brand" />
            <p className="mt-3 text-3xl font-extrabold text-ink">{n}</p>
            <p className="text-sm text-text-muted">{label}</p>
          </Link>
        ))}
      </div>

      {!voice.data && (
        <Link href="/dashboard/brand-voice" className="card flex items-center gap-3 p-5 hover:border-brand/40">
          <Mic2 className="h-5 w-5 text-brand" />
          <div className="flex-1"><p className="font-bold text-ink">Set up your Brand Voice</p><p className="text-sm text-text-muted">Teach FlowCopy how you sound so everything it writes is on brand.</p></div>
          <ArrowRight className="h-4 w-4 text-brand" />
        </Link>
      )}

      <div className="card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-ink">Recent content</h2>
          <Link href="/dashboard/content" className="btn-primary h-9 px-3.5">Create content</Link>
        </div>
        {recent.data?.length ? (
          <ul className="mt-3 divide-y divide-line">
            {recent.data.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="truncate font-medium text-ink">{c.title}</span>
                <span className="shrink-0 text-xs text-text-muted">{typeLabel(c.type)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-text-muted">Nothing yet. Generate your first piece of content.</p>
        )}
      </div>
    </div>
  );
}
