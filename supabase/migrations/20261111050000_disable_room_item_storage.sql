-- Shared workspaces broadcast selected live data instead of storing room item copies.
-- The old mutation API is disabled so older clients cannot recreate those copies.
revoke execute on function public.stillspace_room_put(uuid,uuid,integer,jsonb) from anon, authenticated;
