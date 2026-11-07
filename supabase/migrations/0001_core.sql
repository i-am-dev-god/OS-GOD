-- OS-GOD core schema: text-only objects, ownership, RLS, versions, links, queries, settings.
-- Safe for a static GitHub Pages client: no service-role key is required by the browser.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  github_login text check (github_login is null or char_length(github_login) between 1 and 39),
  display_name text check (display_name is null or char_length(display_name) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.objects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'note' check (kind in ('note','task','project','source','decision')),
  title text not null check (char_length(btrim(title)) between 1 and 200),
  body text not null default '' check (octet_length(body) <= 262144),
  status text not null default 'active' check (status in ('inbox','active','waiting','done','archived')),
  tags text[] not null default '{}' check (cardinality(tags) <= 12 and octet_length(array_to_string(tags, '')) <= 2048),
  due_date date,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  search_vector tsvector generated always as (
    to_tsvector('simple'::regconfig, coalesce(title, '') || ' ' || coalesce(body, ''))
  ) stored,
  unique (id, owner_id)
);

create table if not exists public.object_versions (
  id uuid primary key default gen_random_uuid(),
  object_id uuid not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  version integer not null check (version > 0),
  kind text not null check (kind in ('note','task','project','source','decision')),
  title text not null check (char_length(btrim(title)) between 1 and 200),
  body text not null default '' check (octet_length(body) <= 262144),
  status text not null check (status in ('inbox','active','waiting','done','archived')),
  tags text[] not null default '{}' check (cardinality(tags) <= 12 and octet_length(array_to_string(tags, '')) <= 2048),
  due_date date,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (object_id, version),
  foreign key (object_id, owner_id) references public.objects(id, owner_id) on delete cascade
);

create table if not exists public.links (
  owner_id uuid not null references auth.users(id) on delete cascade,
  source_id uuid not null,
  target_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (source_id, target_id),
  check (source_id <> target_id),
  foreign key (source_id, owner_id) references public.objects(id, owner_id) on delete cascade,
  foreign key (target_id, owner_id) references public.objects(id, owner_id) on delete cascade
);

create table if not exists public.saved_queries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  definition jsonb not null default '{}'::jsonb check (pg_column_size(definition) <= 4096),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb check (pg_column_size(state) <= 65536),
  theme text not null default 'system' check (theme in ('system','light','dark')),
  quality text not null default 'auto' check (quality in ('auto','lite','standard','rich')),
  updated_at timestamptz not null default now()
);

create index if not exists objects_owner_active_idx on public.objects(owner_id, updated_at desc) where deleted_at is null;
create index if not exists objects_owner_kind_idx on public.objects(owner_id, kind, status);
create index if not exists objects_search_idx on public.objects using gin(search_vector);
create index if not exists objects_tags_idx on public.objects using gin(tags);
create index if not exists object_versions_object_idx on public.object_versions(object_id, version desc);
create index if not exists links_target_idx on public.links(owner_id, target_id);
create index if not exists saved_queries_owner_idx on public.saved_queries(owner_id, updated_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists saved_queries_touch on public.saved_queries;
create trigger saved_queries_touch before update on public.saved_queries
for each row execute function public.touch_updated_at();

drop trigger if exists user_settings_touch on public.user_settings;
create trigger user_settings_touch before update on public.user_settings
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, github_login, display_name)
  values (
    new.id,
    nullif(left(new.raw_user_meta_data ->> 'user_name', 39), ''),
    nullif(left(coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'user_name'), 120), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.enforce_object_quota()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if (select count(*) from public.objects where owner_id = new.owner_id) >= 5000 then
    raise exception 'object quota exceeded' using errcode = '22023';
  end if;
  return new;
end;
$$;

drop trigger if exists objects_quota on public.objects;
create trigger objects_quota before insert on public.objects
for each row execute function public.enforce_object_quota();

create or replace function public.prepare_object_mutation()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.created_at = now();
    new.updated_at = now();
    new.version = 1;
    return new;
  end if;

  if new.owner_id <> old.owner_id or new.id <> old.id then
    raise exception 'object identity is immutable' using errcode = '22023';
  end if;

  new.created_at = old.created_at;
  new.updated_at = now();

  if row(new.title, new.body, new.kind, new.status, new.tags, new.due_date, new.deleted_at)
     is distinct from row(old.title, old.body, old.kind, old.status, old.tags, old.due_date, old.deleted_at) then
    new.version = old.version + 1;
  else
    new.version = old.version;
  end if;

  return new;
end;
$$;

drop trigger if exists objects_prepare on public.objects;
create trigger objects_prepare before insert or update on public.objects
for each row execute function public.prepare_object_mutation();

create or replace function public.record_object_version()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' or new.version <> old.version then
    insert into public.object_versions (
      object_id, owner_id, version, kind, title, body, status, tags, due_date, deleted_at
    ) values (
      new.id, new.owner_id, new.version, new.kind, new.title, new.body, new.status, new.tags, new.due_date, new.deleted_at
    );

    delete from public.object_versions
    where object_id = new.id
      and version not in (
        select version from public.object_versions
        where object_id = new.id
        order by version desc
        limit 50
      );
  end if;
  return new;
end;
$$;

revoke all on function public.record_object_version() from public, anon, authenticated;

drop trigger if exists objects_version on public.objects;
create trigger objects_version after insert or update on public.objects
for each row execute function public.record_object_version();

create or replace function public.enforce_query_quota()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if (select count(*) from public.saved_queries where owner_id = new.owner_id) >= 100 then
    raise exception 'saved query quota exceeded' using errcode = '22023';
  end if;
  return new;
end;
$$;

drop trigger if exists saved_queries_quota on public.saved_queries;
create trigger saved_queries_quota before insert on public.saved_queries
for each row execute function public.enforce_query_quota();

alter table public.profiles enable row level security;
alter table public.objects enable row level security;
alter table public.object_versions enable row level security;
alter table public.links enable row level security;
alter table public.saved_queries enable row level security;
alter table public.user_settings enable row level security;

alter table public.profiles force row level security;
alter table public.objects force row level security;
alter table public.object_versions force row level security;
alter table public.links force row level security;
alter table public.saved_queries force row level security;
alter table public.user_settings force row level security;

revoke all on public.profiles, public.objects, public.object_versions, public.links, public.saved_queries, public.user_settings from anon;

grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;

grant select, insert, update, delete on public.objects to authenticated;
grant select on public.object_versions to authenticated;
grant select, insert, delete on public.links to authenticated;
grant select, insert, update, delete on public.saved_queries to authenticated;
grant select, insert, update on public.user_settings to authenticated;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated using (id = (select auth.uid()));
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists objects_select_own on public.objects;
create policy objects_select_own on public.objects for select to authenticated using (owner_id = (select auth.uid()));
drop policy if exists objects_insert_own on public.objects;
create policy objects_insert_own on public.objects for insert to authenticated with check (owner_id = (select auth.uid()));
drop policy if exists objects_update_own on public.objects;
create policy objects_update_own on public.objects for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
drop policy if exists objects_delete_own on public.objects;
create policy objects_delete_own on public.objects for delete to authenticated using (owner_id = (select auth.uid()));

drop policy if exists versions_select_own on public.object_versions;
create policy versions_select_own on public.object_versions for select to authenticated using (owner_id = (select auth.uid()));

drop policy if exists links_select_own on public.links;
create policy links_select_own on public.links for select to authenticated using (owner_id = (select auth.uid()));
drop policy if exists links_insert_own on public.links;
create policy links_insert_own on public.links for insert to authenticated with check (owner_id = (select auth.uid()));
drop policy if exists links_delete_own on public.links;
create policy links_delete_own on public.links for delete to authenticated using (owner_id = (select auth.uid()));

drop policy if exists queries_select_own on public.saved_queries;
create policy queries_select_own on public.saved_queries for select to authenticated using (owner_id = (select auth.uid()));
drop policy if exists queries_insert_own on public.saved_queries;
create policy queries_insert_own on public.saved_queries for insert to authenticated with check (owner_id = (select auth.uid()));
drop policy if exists queries_update_own on public.saved_queries;
create policy queries_update_own on public.saved_queries for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
drop policy if exists queries_delete_own on public.saved_queries;
create policy queries_delete_own on public.saved_queries for delete to authenticated using (owner_id = (select auth.uid()));

drop policy if exists settings_select_own on public.user_settings;
create policy settings_select_own on public.user_settings for select to authenticated using (owner_id = (select auth.uid()));
drop policy if exists settings_insert_own on public.user_settings;
create policy settings_insert_own on public.user_settings for insert to authenticated with check (owner_id = (select auth.uid()));
drop policy if exists settings_update_own on public.user_settings;
create policy settings_update_own on public.user_settings for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
