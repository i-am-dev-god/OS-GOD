-- Permanent note/reminder deletion retains only IDs to prevent stale caches restoring content.
create table public.stillspace_purged_notes (
  user_id uuid not null references auth.users(id) on delete cascade,
  id uuid not null,
  primary key (user_id,id)
);
alter table public.stillspace_purged_notes enable row level security;
create policy purged_notes_read_own on public.stillspace_purged_notes for select to authenticated using (auth.uid() = user_id);
revoke all on public.stillspace_purged_notes from public, anon, authenticated;
grant select on public.stillspace_purged_notes to authenticated;

create function public.stillspace_block_purged_notes() returns trigger
language plpgsql security definer set search_path = pg_catalog, public, pg_temp as $$
begin
  perform pg_advisory_xact_lock(hashtextextended('stillspace-purge:' || new.user_id::text, 0));
  if exists(select 1 from public.stillspace_purged_notes where user_id = new.user_id and id = new.id) then
    raise exception 'This note was permanently deleted';
  end if;
  return new;
end $$;
revoke all on function public.stillspace_block_purged_notes() from public, anon, authenticated;
create trigger block_purged_note before insert or update on public.memo_os_notes for each row execute function public.stillspace_block_purged_notes();

create function public.stillspace_purge_my_notes(p_local_ids uuid[]) returns integer
language plpgsql security definer set search_path = pg_catalog, public, auth, pg_temp as $$
declare uid uuid := auth.uid(); authenticated_at bigint; removed integer;
begin
  if uid is null then raise exception 'Sign in first'; end if;
  select max((item->>'timestamp')::bigint) into authenticated_at
    from jsonb_array_elements(coalesce(auth.jwt()->'amr','[]'::jsonb)) item
    where item->>'method' = 'password' and item->>'timestamp' ~ '^[0-9]+$';
  if authenticated_at is null or authenticated_at < extract(epoch from now())::bigint - 300 or authenticated_at > extract(epoch from now())::bigint + 30 then
    raise exception 'Sign in again before deleting your data';
  end if;
  if coalesce(array_length(p_local_ids,1),0) > 10000 then raise exception 'Too many local items to delete at once'; end if;
  perform pg_advisory_xact_lock(hashtextextended('stillspace-purge:' || uid::text, 0));
  insert into public.stillspace_purged_notes(user_id,id) select uid,id from public.memo_os_notes where user_id=uid on conflict do nothing;
  insert into public.stillspace_purged_notes(user_id,id) select uid,x from unnest(coalesce(p_local_ids, array[]::uuid[])) x where x is not null on conflict do nothing;
  delete from public.memo_os_notes where user_id=uid;
  get diagnostics removed = row_count;
  if exists(select 1 from public.memo_os_notes where user_id=uid) then raise exception 'Deletion verification failed'; end if;
  return removed;
end $$;
revoke all on function public.stillspace_purge_my_notes(uuid[]) from public, anon;
grant execute on function public.stillspace_purge_my_notes(uuid[]) to authenticated;
