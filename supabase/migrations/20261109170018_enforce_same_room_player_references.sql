alter table public.game_private_state
  drop constraint game_private_state_keeper_player_id_fkey,
  drop constraint game_private_state_current_turn_player_id_fkey;

alter table public.game_private_state
  add constraint game_private_state_keeper_same_room_fk
    foreign key (room_id, keeper_player_id)
    references public.game_players (room_id, player_id)
    deferrable initially deferred,
  add constraint game_private_state_turn_same_room_fk
    foreign key (room_id, current_turn_player_id)
    references public.game_players (room_id, player_id)
    deferrable initially deferred;

alter table public.game_events
  drop constraint game_events_actor_player_id_fkey;

alter table public.game_events
  add constraint game_events_actor_same_room_fk
    foreign key (room_id, actor_player_id)
    references public.game_players (room_id, player_id)
    deferrable initially deferred;
