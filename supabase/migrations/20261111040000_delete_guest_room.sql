-- Room codes are bearer capabilities; anyone with the code can delete the room.
create function public.stillspace_room_delete(p_code uuid) returns boolean
language plpgsql security definer set search_path = pg_catalog, public as $$
declare removed uuid;
begin
  delete from public.stillspace_rooms where id=p_code returning id into removed;
  return removed is not null;
end $$;
revoke all on function public.stillspace_room_delete(uuid) from public;
grant execute on function public.stillspace_room_delete(uuid) to anon, authenticated;
