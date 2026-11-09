create table public.card_definitions (
  card_id text primary key,
  animal text not null check (animal in ('cat', 'rabbit', 'frog', 'fox')),
  color text not null check (color in ('pink', 'blue', 'gold')),
  number smallint not null check (number between 1 and 6),
  art_key text not null,
  created_at timestamptz not null default now(),
  unique (animal, color, number)
);

create table public.rule_definitions (
  rule_id text primary key,
  title text not null,
  description text not null,
  difficulty smallint not null default 1 check (difficulty between 1 and 5),
  condition_type text not null,
  condition_value jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.game_rooms (
  room_id uuid primary key default gen_random_uuid(),
  room_code text not null unique,
  host_player_id uuid,
  status text not null default 'waiting'
    check (status in ('waiting', 'in_progress', 'finished', 'cancelled')),
  max_players smallint not null default 7 check (max_players between 3 and 7),
  round_number integer not null default 0 check (round_number >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.game_players (
  player_id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.game_rooms(room_id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 24),
  seat_order smallint not null check (seat_order between 0 and 6),
  is_connected boolean not null default true,
  joined_at timestamptz not null default now(),
  unique (room_id, player_id),
  unique (room_id, seat_order)
);

alter table public.game_rooms
  add constraint game_rooms_host_player_fk
  foreign key (room_id, host_player_id)
  references public.game_players(room_id, player_id)
  deferrable initially deferred;

create table public.game_private_state (
  room_id uuid primary key references public.game_rooms(room_id) on delete cascade,
  keeper_player_id uuid references public.game_players(player_id),
  secret_rule_id text references public.rule_definitions(rule_id),
  clue_card_id text references public.card_definitions(card_id),
  accepted_cards jsonb not null default '[]'::jsonb,
  draw_pile jsonb not null default '[]'::jsonb,
  discard_pile jsonb not null default '[]'::jsonb,
  current_turn_player_id uuid references public.game_players(player_id),
  phase text not null default 'setup'
    check (phase in ('setup', 'playing', 'guessing', 'finished')),
  state_version bigint not null default 0,
  updated_at timestamptz not null default now()
);

create table public.game_player_private (
  player_id uuid primary key references public.game_players(player_id) on delete cascade,
  hand jsonb not null default '[]'::jsonb,
  hand_size smallint not null default 0 check (hand_size >= 0),
  updated_at timestamptz not null default now()
);

create table public.game_events (
  event_id bigint generated always as identity primary key,
  room_id uuid not null references public.game_rooms(room_id) on delete cascade,
  actor_player_id uuid references public.game_players(player_id),
  idempotency_key text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (room_id, idempotency_key)
);

insert into public.card_definitions (card_id, animal, color, number, art_key)
select
  upper(a.animal) || '_' || upper(c.color) || '_' || lpad(n.number::text, 2, '0'),
  a.animal,
  c.color,
  n.number,
  a.animal || '_' || c.color
from (values ('cat'), ('rabbit'), ('frog'), ('fox')) as a(animal)
cross join (values ('pink'), ('blue'), ('gold')) as c(color)
cross join generate_series(1, 6) as n(number);

insert into public.rule_definitions
  (rule_id, title, description, difficulty, condition_type, condition_value)
values
  ('R001', 'สีชมพู', 'การ์ดต้องเป็นสีชมพู', 1, 'card_color_is', '{"color":"pink"}'::jsonb),
  ('R002', 'สีฟ้าหรือสีทอง', 'การ์ดต้องเป็นสีฟ้าหรือสีทอง', 1, 'card_color_in', '{"colors":["blue","gold"]}'::jsonb),
  ('R003', 'เลขคี่', 'การ์ดต้องมีหมายเลขเป็นเลขคี่', 1, 'card_number_is_odd', '{}'::jsonb),
  ('R004', 'ห้ามเลขซ้ำ', 'หมายเลขต้องไม่ซ้ำกับการ์ดก่อนหน้า', 2, 'number_differs_from_previous', '{}'::jsonb),
  ('R005', 'แมวหรือกระต่าย', 'การ์ดต้องเป็นแมวหรือกระต่าย', 1, 'card_animal_in', '{"animals":["cat","rabbit"]}'::jsonb);

alter table public.card_definitions enable row level security;
alter table public.rule_definitions enable row level security;
alter table public.game_rooms enable row level security;
alter table public.game_players enable row level security;
alter table public.game_private_state enable row level security;
alter table public.game_player_private enable row level security;
alter table public.game_events enable row level security;

revoke all on public.card_definitions, public.rule_definitions, public.game_rooms,
  public.game_players, public.game_private_state, public.game_player_private,
  public.game_events from anon, authenticated;

grant all on public.card_definitions, public.rule_definitions, public.game_rooms,
  public.game_players, public.game_private_state, public.game_player_private,
  public.game_events to service_role;
