-- Links are unlisted bearer URLs; only signed-in users can create them.
create table public.stillspace_layouts (id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade, layout jsonb not null check (octet_length(layout::text) <= 1024), created_at timestamptz not null default now());
alter table public.stillspace_layouts enable row level security;
revoke all on public.stillspace_layouts from anon, authenticated;
create function public.create_workspace_layout(p_layout jsonb) returns uuid language plpgsql security definer set search_path = public, pg_temp as $$ declare new_id uuid; begin if auth.uid() is null then raise exception 'Sign in to create a link'; end if; if jsonb_typeof(p_layout) <> 'array' or jsonb_array_length(p_layout) > 8 or octet_length(p_layout::text) > 1024 then raise exception 'Invalid layout'; end if; if (select count(*) from public.stillspace_layouts where owner_id = auth.uid()) >= 30 then raise exception 'Workspace share limit reached'; end if; insert into public.stillspace_layouts(owner_id,layout) values(auth.uid(),p_layout) returning id into new_id; return new_id; end $$;
create function public.get_workspace_layout(p_id uuid) returns jsonb language sql stable security definer set search_path = public, pg_temp as $$ select layout from public.stillspace_layouts where id=p_id $$;
revoke all on function public.create_workspace_layout(jsonb) from public; revoke all on function public.get_workspace_layout(uuid) from public;
grant execute on function public.create_workspace_layout(jsonb) to authenticated; grant execute on function public.get_workspace_layout(uuid) to anon, authenticated;
create table public.stillspace_preferences (user_id uuid primary key references auth.users(id) on delete cascade, data jsonb not null check(octet_length(data::text) <= 1100000), updated_at timestamptz not null default now());
alter table public.stillspace_preferences enable row level security;
create policy preferences_owner on public.stillspace_preferences for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
grant select,insert,update on public.stillspace_preferences to authenticated;
