-- FlowCopy migration 0001: profiles, organizations, workspaces, signup bootstrap, RLS.

create extension if not exists pgcrypto;

create or replace function public.flowcopy_set_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- Tables -------------------------------------------------------------------
create table if not exists public.fc_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fc_organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fc_organization_members (
  organization_id uuid not null references public.fc_organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member','viewer')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);
create index if not exists fc_organization_members_user_idx on public.fc_organization_members(user_id);

create table if not exists public.fc_workspaces (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.fc_organizations(id) on delete cascade,
  name text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists fc_workspaces_org_idx on public.fc_workspaces(organization_id);

create table if not exists public.fc_workspace_members (
  workspace_id uuid not null references public.fc_workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','editor','reviewer','viewer')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);
create index if not exists fc_workspace_members_user_idx on public.fc_workspace_members(user_id);

create trigger fc_profiles_updated before update on public.fc_profiles for each row execute function public.flowcopy_set_updated_at();
create trigger fc_organizations_updated before update on public.fc_organizations for each row execute function public.flowcopy_set_updated_at();
create trigger fc_workspaces_updated before update on public.fc_workspaces for each row execute function public.flowcopy_set_updated_at();

-- Bootstrap ----------------------------------------------------------------
-- Creates profile, organization, workspace and memberships for one user. Idempotent.
create or replace function public.flowcopy_bootstrap_user(p_user uuid, p_email text, p_name text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_org uuid;
  v_ws uuid;
  v_name text := nullif(btrim(coalesce(p_name, '')), '');
  v_slug text;
begin
  insert into public.fc_profiles (id, email, full_name)
  values (p_user, p_email, v_name)
  on conflict (id) do nothing;

  if exists (select 1 from public.fc_organization_members where user_id = p_user) then
    return;
  end if;

  v_slug := lower(regexp_replace(coalesce(v_name, split_part(p_email, '@', 1), 'team'), '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug := trim(both '-' from v_slug) || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);

  insert into public.fc_organizations (name, slug, owner_id)
  values (coalesce(v_name, split_part(p_email, '@', 1)) || '''s Organization', v_slug, p_user)
  returning id into v_org;

  insert into public.fc_organization_members (organization_id, user_id, role) values (v_org, p_user, 'owner');

  insert into public.fc_workspaces (organization_id, name, created_by)
  values (v_org, 'My Workspace', p_user)
  returning id into v_ws;

  insert into public.fc_workspace_members (workspace_id, user_id, role) values (v_ws, p_user, 'owner');
end $$;

create or replace function public.flowcopy_handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform public.flowcopy_bootstrap_user(new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end $$;

drop trigger if exists flowcopy_on_auth_user_created on auth.users;
create trigger flowcopy_on_auth_user_created after insert on auth.users
  for each row execute function public.flowcopy_handle_new_user();

-- Self heal for accounts that predate the trigger.
create or replace function public.flowcopy_ensure_workspace() returns void
language plpgsql security definer set search_path = public as $$
declare u auth.users;
begin
  select * into u from auth.users where id = auth.uid();
  if u.id is null then return; end if;
  perform public.flowcopy_bootstrap_user(u.id, u.email, u.raw_user_meta_data ->> 'full_name');
end $$;

revoke all on function public.flowcopy_bootstrap_user(uuid, text, text) from public, anon, authenticated;
revoke all on function public.flowcopy_handle_new_user() from public, anon, authenticated;
revoke all on function public.flowcopy_ensure_workspace() from public, anon;
grant execute on function public.flowcopy_ensure_workspace() to authenticated;

-- Membership helpers (security definer avoids recursive RLS) ---------------
create or replace function public.flowcopy_is_org_member(p_org uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.fc_organization_members where organization_id = p_org and user_id = auth.uid());
$$;
create or replace function public.flowcopy_is_org_admin(p_org uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.fc_organization_members
    where organization_id = p_org and user_id = auth.uid() and role in ('owner','admin'));
$$;
create or replace function public.flowcopy_is_workspace_member(p_ws uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.fc_workspace_members where workspace_id = p_ws and user_id = auth.uid());
$$;
grant execute on function public.flowcopy_is_org_member(uuid), public.flowcopy_is_org_admin(uuid), public.flowcopy_is_workspace_member(uuid) to authenticated;

-- Row Level Security -------------------------------------------------------
alter table public.fc_profiles enable row level security;
alter table public.fc_organizations enable row level security;
alter table public.fc_organization_members enable row level security;
alter table public.fc_workspaces enable row level security;
alter table public.fc_workspace_members enable row level security;

create policy profiles_select_own on public.fc_profiles for select to authenticated using (id = auth.uid());
create policy profiles_update_own on public.fc_profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy orgs_select_member on public.fc_organizations for select to authenticated using (public.flowcopy_is_org_member(id));
create policy orgs_update_admin on public.fc_organizations for update to authenticated
  using (public.flowcopy_is_org_admin(id)) with check (public.flowcopy_is_org_admin(id));

create policy org_members_select on public.fc_organization_members for select to authenticated
  using (user_id = auth.uid() or public.flowcopy_is_org_member(organization_id));

create policy workspaces_select_member on public.fc_workspaces for select to authenticated using (public.flowcopy_is_workspace_member(id));
create policy workspaces_update_admin on public.fc_workspaces for update to authenticated
  using (public.flowcopy_is_org_admin(organization_id)) with check (public.flowcopy_is_org_admin(organization_id));

create policy ws_members_select on public.fc_workspace_members for select to authenticated
  using (user_id = auth.uid() or public.flowcopy_is_workspace_member(workspace_id));

-- No insert/delete policies on membership tables: changes go through server side functions only.
