-- Account deletion is scoped to the caller and requires recent password authentication.
create or replace function public.stillspace_delete_my_account() returns void
language plpgsql security definer set search_path = pg_catalog, public, auth as $$
declare uid uuid := auth.uid(); authenticated_at bigint;
begin
  if uid is null then raise exception 'Sign in first'; end if;
  select max((item->>'timestamp')::bigint) into authenticated_at
    from jsonb_array_elements(coalesce(auth.jwt()->'amr','[]'::jsonb)) item
    where item->>'method' = 'password' and item->>'timestamp' ~ '^[0-9]+$';
  if authenticated_at is null or authenticated_at < extract(epoch from now())::bigint - 300 or authenticated_at > extract(epoch from now())::bigint + 30 then
    raise exception 'Sign in again before deleting your account';
  end if;
  delete from auth.users where id = uid;
  if not found then raise exception 'Account not found'; end if;
end $$;
revoke all on function public.stillspace_delete_my_account() from public, anon;
grant execute on function public.stillspace_delete_my_account() to authenticated;
