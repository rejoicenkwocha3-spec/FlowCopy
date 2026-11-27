-- FlowCopy migration 0002: content library, brand voice, infobase, agents, workflows.

create table if not exists public.fc_brand_voices (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references public.fc_workspaces(id) on delete cascade,
  name text not null default 'My Brand',
  tone text not null default '',
  guidelines text not null default '',
  avoid text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fc_infobase_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.fc_workspaces(id) on delete cascade,
  title text not null,
  content text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.fc_content (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.fc_workspaces(id) on delete cascade,
  type text not null default 'other',
  title text not null,
  prompt text,
  body text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fc_agents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.fc_workspaces(id) on delete cascade,
  name text not null,
  description text not null default '',
  instructions text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.fc_workflows (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.fc_workspaces(id) on delete cascade,
  name text not null,
  description text not null default '',
  steps jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists fc_infobase_ws_idx on public.fc_infobase_items(workspace_id);
create index if not exists fc_content_ws_idx on public.fc_content(workspace_id, created_at desc);
create index if not exists fc_agents_ws_idx on public.fc_agents(workspace_id);
create index if not exists fc_workflows_ws_idx on public.fc_workflows(workspace_id);

create trigger fc_brand_voices_updated before update on public.fc_brand_voices for each row execute function public.flowcopy_set_updated_at();
create trigger fc_content_updated before update on public.fc_content for each row execute function public.flowcopy_set_updated_at();

do $$
declare t text;
begin
  foreach t in array array['fc_brand_voices','fc_infobase_items','fc_content','fc_agents','fc_workflows'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for select to authenticated using (public.flowcopy_is_workspace_member(workspace_id))', t || '_sel', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.flowcopy_is_workspace_member(workspace_id))', t || '_ins', t);
    execute format('create policy %I on public.%I for update to authenticated using (public.flowcopy_is_workspace_member(workspace_id)) with check (public.flowcopy_is_workspace_member(workspace_id))', t || '_upd', t);
    execute format('create policy %I on public.%I for delete to authenticated using (public.flowcopy_is_workspace_member(workspace_id))', t || '_del', t);
  end loop;
end $$;
