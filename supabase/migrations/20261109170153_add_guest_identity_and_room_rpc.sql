alter table public.game_players
  add column auth_user_id uuid references auth.users(id) on delete set null;

create unique index game_players_room_auth_user_uidx
  on public.game_players (room_id, auth_user_id)
  where auth_user_id is not null;

create or replace function public.create_game_room(
  p_user_id uuid,
  p_display_name text,
  p_max_players smallint default 7
)
returns table (room_id uuid, room_code text, player_id uuid)
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_room_id uuid;
  v_room_code text;
  v_player_id uuid;
  v_attempt integer := 0;
  v_name text := btrim(p_display_name);
begin
  if p_user_id is null then
    raise exception 'authentication_required' using errcode = '28000';
  end if;
  if v_name is null or char_length(v_name) not between 1 and 24 then
    raise exception 'invalid_display_name' using errcode = '22023';
  end if;
  if p_max_players not between 3 and 7 then
    raise exception 'invalid_max_players' using errcode = '22023';
  end if;

  loop
    v_room_code := upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 6));
    begin
      insert into public.game_rooms (room_code, max_players)
      values (v_room_code, p_max_players)
      returning game_rooms.room_id into v_room_id;
      exit;
    exception when unique_violation then
      v_attempt := v_attempt + 1;
      if v_attempt >= 10 then
        raise exception 'room_code_generation_failed';
      end if;
    end;
  end loop;

  insert into public.game_players (room_id, auth_user_id, display_name, seat_order)
  values (v_room_id, p_user_id, v_name, 0)
  returning game_players.player_id into v_player_id;

  update public.game_rooms
  set host_player_id = v_player_id, updated_at = now()
  where game_rooms.room_id = v_room_id;

  return query select v_room_id, v_room_code, v_player_id;
end;
$$;

create or replace function public.join_game_room(
  p_user_id uuid,
  p_room_code text,
  p_display_name text
)
returns table (room_id uuid, room_code text, player_id uuid)
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_room public.game_rooms%rowtype;
  v_player_id uuid;
  v_seat smallint;
  v_name text := btrim(p_display_name);
begin
  if p_user_id is null then
    raise exception 'authentication_required' using errcode = '28000';
  end if;
  if v_name is null or char_length(v_name) not between 1 and 24 then
    raise exception 'invalid_display_name' using errcode = '22023';
  end if;
  if p_room_code is null or char_length(btrim(p_room_code)) <> 6 then
    raise exception 'invalid_room_code' using errcode = '22023';
  end if;

  select * into v_room
  from public.game_rooms
  where game_rooms.room_code = upper(btrim(p_room_code))
  for update;

  if not found then
    raise exception 'room_not_found' using errcode = 'P0002';
  end if;
  if v_room.status <> 'waiting' then
    raise exception 'room_not_joinable' using errcode = '55000';
  end if;

  select gp.player_id into v_player_id
  from public.game_players gp
  where gp.room_id = v_room.room_id
    and gp.auth_user_id = p_user_id;

  if v_player_id is not null then
    update public.game_players
    set display_name = v_name, is_connected = true
    where game_players.player_id = v_player_id;
    return query select v_room.room_id, v_room.room_code, v_player_id;
    return;
  end if;

  if (select count(*) from public.game_players gp where gp.room_id = v_room.room_id) >= v_room.max_players then
    raise exception 'room_full' using errcode = '54000';
  end if;

  select seat_no into v_seat
  from generate_series(0, v_room.max_players - 1) as seat_no
  where not exists (
    select 1 from public.game_players gp
    where gp.room_id = v_room.room_id and gp.seat_order = seat_no
  )
  order by seat_no
  limit 1;

  if v_seat is null then
    raise exception 'room_full' using errcode = '54000';
  end if;

  insert into public.game_players (room_id, auth_user_id, display_name, seat_order)
  values (v_room.room_id, p_user_id, v_name, v_seat)
  returning game_players.player_id into v_player_id;

  update public.game_rooms
  set updated_at = now()
  where game_rooms.room_id = v_room.room_id;

  return query select v_room.room_id, v_room.room_code, v_player_id;
end;
$$;

revoke all on function public.create_game_room(uuid, text, smallint) from public, anon, authenticated;
revoke all on function public.join_game_room(uuid, text, text) from public, anon, authenticated;
grant execute on function public.create_game_room(uuid, text, smallint) to service_role;
grant execute on function public.join_game_room(uuid, text, text) to service_role;
