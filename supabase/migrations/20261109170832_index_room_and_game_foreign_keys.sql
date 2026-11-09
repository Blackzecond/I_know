create index game_events_room_actor_idx
  on public.game_events (room_id, actor_player_id);

create index game_players_auth_user_idx
  on public.game_players (auth_user_id);

create index game_private_state_clue_card_idx
  on public.game_private_state (clue_card_id);

create index game_private_state_keeper_idx
  on public.game_private_state (room_id, keeper_player_id);

create index game_private_state_secret_rule_idx
  on public.game_private_state (secret_rule_id);

create index game_private_state_turn_idx
  on public.game_private_state (room_id, current_turn_player_id);

create index game_rooms_room_host_idx
  on public.game_rooms (room_id, host_player_id);
