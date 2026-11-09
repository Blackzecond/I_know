# Game foundation

## Character deck

The first deck is a complete Cartesian product:

- Animals: cat, rabbit, frog, fox
- Colors: pink, blue, gold
- Numbers: 1–6
- Total: 4 × 3 × 6 = 72 unique cards

Card IDs use `ANIMAL_COLOR_NUMBER`, for example `CAT_PINK_01`.

## Initial rule deck

| ID | Rule | Condition type |
|---|---|---|
| R001 | Card must be pink | `card_color_is` |
| R002 | Card must be blue or gold | `card_color_in` |
| R003 | Card number must be odd | `card_number_is_odd` |
| R004 | Number must differ from the previous accepted card | `number_differs_from_previous` |
| R005 | Card must be a cat or rabbit | `card_animal_in` |

R005 is adapted to this game's animal set rather than claimed as a verbatim original-game rule.

## Rule Keeper rotation

At the start of the first round, the room selects an initial Rule Keeper. After each completed round, the role passes to the next occupied seat clockwise (the player to the current Rule Keeper's left). It never skips a player and wraps around to the first seat. The next round starts with the player to the new Rule Keeper's left, matching the published turn direction.

## Rule evaluation

A multi-card play is evaluated from left to right. Each proposed card is checked against the last previously accepted card, or the preceding card in the same proposed play. The whole play is accepted only if every card passes. A failed play must not partially change the public sequence.

Unknown condition types fail closed.

## Security model

The server is authoritative. Secret rule, draw pile, discard pile, and individual hands are stored separately from public room/player metadata. Direct Data API access is revoked for client roles; trusted server code uses the service role. Never ship the secret key to a browser.

## Initial database entities

- `card_definitions`: immutable character-card catalog
- `rule_definitions`: rule catalog and condition metadata
- `game_rooms`: public room lifecycle metadata
- `game_players`: player seats and connection state
- `game_private_state`: hidden rule, clue, accepted sequence and piles
- `game_player_private`: per-player hand
- `game_events`: append-only action log with idempotency key

## Decisions still required before full turn implementation

- Rule Keeper rotates one seat to the left (clockwise) after every completed round. The next round's Rule Keeper is the next player in seat order, wrapping from the last seat to the first.
- Exact rule-guessing flow and whether all players can guess after the first player empties their hand
- Deck-exhaustion behavior
- Whether the initial clue card is removed from the draw pile
- Exact hand exchange behavior and edge cases

## Private rooms and guest identity

- Players use Supabase anonymous authentication; no email or password is required.
- A Next.js Proxy refreshes cookie-backed sessions before server rendering, following Supabase SSR guidance.
- Each room seat stores the authenticated Supabase user ID in `game_players.auth_user_id`.
- A player can rejoin the same waiting room with the same anonymous session without taking another seat.
- Room creation and joining run through server-only RPC calls. The API verifies the current user with `auth.getUser()` before calling the RPC with the server-side Supabase client using the secret key.
- Room codes are six uppercase hexadecimal characters. Joining locks the room row while checking status and capacity, preventing concurrent joins from exceeding the player limit.
- RPC execution is revoked from `PUBLIC`, `anon`, and `authenticated`; only `service_role` can execute these functions.
- The browser never receives the secret key. Keep it only in server environment variables.

## Migration history

The schema is tracked under `supabase/migrations`:
1. `20261109164600_create_game_foundation.sql`
2. `20261109170018_enforce_same_room_player_references.sql`
3. `20261109170153_add_guest_identity_and_room_rpc.sql`
4. `20261109170205_fix_room_rpc_search_path.sql`
5. `20261109170832_index_room_and_game_foreign_keys.sql`
6. `20261109171017_ensure_pgcrypto_extension.sql`

## Current implementation boundary

The home screen can create a private room or join by code. The room page shows the public lobby roster and refreshes every five seconds for now. Realtime push updates, ready states, host controls, and starting the game are not implemented yet.

Before using the app, enable **Anonymous Sign-Ins** in Supabase Authentication settings and configure the three variables listed in `.env.example`. The secret key must never use a `NEXT_PUBLIC_` prefix.


## Offline-first development

Online multiplayer implementation is paused while the local game engine is built. See docs/offline-first-plan.md for the sequence and outstanding rule decisions.

The initial local round setup is implemented in src/lib/game/setup.ts. It deals seven cards to each non-keeper, chooses a clue card that satisfies the secret rule, removes that clue from the draw pile, and starts with the player to the keeper's left. The random source is injectable for deterministic tests.
