-- Versioned, capability-protected ephemeral rooms. Room codes are bearer secrets.
create table public.stillspace_rooms (
  id uuid primary key default gen_random_uuid(),
  state jsonb not null default '{"version":1,"items":{}}'::jsonb,
  touched_at timestamptz not null default now(),
  check (octet_length(state::text) <= 131072)
);
alter table public.stillspace_rooms enable row level security;
revoke all on public.stillspace_rooms from anon, authenticated;

create function public.stillspace_room_create() returns uuid language plpgsql security definer set search_path = pg_catalog, public as $$
declare new_id uuid;
begin
  perform pg_advisory_xact_lock(7341001);
  delete from public.stillspace_rooms where touched_at < now() - interval '24 hours';
  if (select count(*) from public.stillspace_rooms) >= 100 then raise exception 'Room capacity reached; try again later'; end if;
  insert into public.stillspace_rooms default values returning id into new_id;
  return new_id;
end $$;
create function public.stillspace_room_get(p_code uuid) returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare result jsonb;
begin
  update public.stillspace_rooms set touched_at = now() where id=p_code and touched_at >= now() - interval '24 hours' returning state into result;
  return result;
end $$;
create function public.stillspace_room_put(p_code uuid,p_item uuid,p_expected integer,p_value jsonb) returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare s jsonb; current_item jsonb; next_item jsonb; rev integer;
begin
  if p_expected is null or p_expected < 0 or jsonb_typeof(p_value) is distinct from 'object' or jsonb_typeof(p_value->'title') is distinct from 'string' or jsonb_typeof(p_value->'body') is distinct from 'string' or jsonb_typeof(p_value->'author') is distinct from 'string' or coalesce(p_value->>'kind','') not in ('note','reminder') or length(p_value->>'title') > 500 or length(p_value->>'body') > 12000 or length(p_value->>'author') not between 1 and 40 then raise exception 'Invalid room item'; end if;
  select state into s from public.stillspace_rooms where id=p_code and touched_at >= now() - interval '24 hours' for update;
  if s is null then raise exception 'Room not found or expired'; end if;
  current_item := s->'items'->p_item::text; rev := coalesce((current_item->>'rev')::integer,0);
  if rev <> p_expected then return jsonb_build_object('ok',false,'item',current_item); end if;
  if current_item is null and (select count(*) from jsonb_object_keys(s->'items')) >= 50 then raise exception 'Room has reached its 50 item limit'; end if;
  next_item := jsonb_build_object('rev',rev+1,'title',p_value->>'title','body',p_value->>'body','kind',p_value->>'kind','author',p_value->>'author');
  s := jsonb_set(s,array['items',p_item::text],next_item,true);
  if octet_length(s::text) > 131072 then raise exception 'Room storage is full'; end if;
  update public.stillspace_rooms set state=s,touched_at=now() where id=p_code;
  return jsonb_build_object('ok',true,'item',next_item);
end $$;
revoke all on function public.stillspace_room_create() from public;
revoke all on function public.stillspace_room_get(uuid) from public;
revoke all on function public.stillspace_room_put(uuid,uuid,integer,jsonb) from public;
grant execute on function public.stillspace_room_create(), public.stillspace_room_get(uuid), public.stillspace_room_put(uuid,uuid,integer,jsonb) to anon, authenticated;
create extension if not exists pg_cron;
select cron.schedule('stillspace-room-cleanup','17 * * * *', $job$delete from public.stillspace_rooms where touched_at < now() - interval '24 hours'$job$);
