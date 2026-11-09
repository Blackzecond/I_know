alter function public.create_game_room(uuid, text, smallint)
  set search_path = public, extensions, pg_temp;

alter function public.join_game_room(uuid, text, text)
  set search_path = public, extensions, pg_temp;
