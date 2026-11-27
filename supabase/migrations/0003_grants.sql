-- FlowCopy migration 0003: table privileges for the authenticated role.
-- Newer Supabase projects do not grant these by default; RLS still limits rows.

grant usage on schema public to authenticated;

grant select on public.fc_profiles, public.fc_organizations, public.fc_organization_members,
                public.fc_workspaces, public.fc_workspace_members to authenticated;
grant update on public.fc_profiles, public.fc_organizations, public.fc_workspaces to authenticated;

grant select, insert, update, delete on public.fc_brand_voices, public.fc_infobase_items,
                public.fc_content, public.fc_agents, public.fc_workflows to authenticated;
