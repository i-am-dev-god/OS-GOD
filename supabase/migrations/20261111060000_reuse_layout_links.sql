-- Reuse an owner's identical layout link instead of storing another copy.
-- Existing links are not removed: they remain valid for their recipients.
create or replace function public.create_workspace_layout(p_layout jsonb)
returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare new_id uuid; owner uuid := auth.uid();
begin
  if owner is null then raise exception 'Sign in to create a link'; end if;
  if p_layout is null or jsonb_typeof(p_layout) <> 'array' or jsonb_array_length(p_layout) > 8 or octet_length(p_layout::text) > 1024 then
    raise exception 'Invalid layout';
  end if;
  -- Serialize creation per owner, so concurrent requests cannot create duplicates.
  perform pg_advisory_xact_lock(hashtextextended(owner::text, 0));
  select id into new_id from public.stillspace_layouts
    where owner_id = owner and layout = p_layout order by created_at, id limit 1;
  if new_id is not null then return new_id; end if;
  if (select count(*) from public.stillspace_layouts where owner_id = owner) >= 30 then
    raise exception 'Workspace share limit reached';
  end if;
  insert into public.stillspace_layouts(owner_id,layout) values(owner,p_layout) returning id into new_id;
  return new_id;
end $$;
revoke all on function public.create_workspace_layout(jsonb) from public;
grant execute on function public.create_workspace_layout(jsonb) to authenticated;
