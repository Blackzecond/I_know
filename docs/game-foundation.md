# Game foundation

The canonical, player-approved rules are maintained in [docs/game-rules.md](./game-rules.md). Read that file before changing game behavior. If implementation or another document conflicts with it, update the implementation/documentation to match the canonical rules; do not silently invent resolutions for items marked TBD.

## Character deck

- Animals: cat, rabbit, frog, fox
- Colors: pink, blue, gold
- Numbers: 1–6
- Total: 4 × 3 × 6 = 72 unique cards
- Card IDs use `ANIMAL_COLOR_NUMBER`, for example `CAT_PINK_01`.

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

After each completed round, the Rule Keeper role passes to the next occupied seat clockwise (the player to the current Rule Keeper's left). It never skips a seat and wraps around to the first seat. The next round starts with the player to the new Rule Keeper's left.

## Rule evaluation

A multi-card play is evaluated from left to right. Each proposed card is checked against the last previously accepted card, or the preceding card in the same proposed play. The whole play is accepted only if every card passes. A failed play must not partially change the public sequence.

Unknown condition types fail closed.

## Offline engine

The initial local round setup is implemented in `src/lib/game/setup.ts`. Offline actions are in `src/lib/game/actions.ts`. These are pure TypeScript and must not import Supabase, Next.js, browser APIs, or React.

## Security model for future online mode

The server is authoritative. Secret rule, draw pile, discard pile, and individual hands must be stored separately from public room/player metadata. Direct Data API access must be revoked for client roles; trusted server code uses the service role. Never ship the secret key to a browser.

## Initial database entities

- `card_definitions`: immutable character-card catalog
- `rule_definitions`: rule catalog and condition metadata
- `game_rooms`: public room lifecycle metadata
- `game_players`: player seats and connection state
- `game_private_state`: hidden rule, clue, accepted sequence and piles
- `game_player_private`: per-player hand
- `game_events`: append-only action log with idempotency key

## Migration history

The schema is tracked under `supabase/migrations`:
1. `20261109164600_create_game_foundation.sql`
2. `20261109170018_enforce_same_room_player_references.sql`
3. `20261109170153_add_guest_identity_and_room_rpc.sql`
4. `20261109170205_fix_room_rpc_search_path.sql`
5. `20261109170832_index_room_and_game_foreign_keys.sql`
6. `20261109171017_ensure_pgcrypto_extension.sql`

## Current implementation boundary

Online multiplayer work is paused while the offline game is completed. The current home/room implementation is retained but is not the active development target. See [docs/offline-first-plan.md](./offline-first-plan.md) for the work sequence and [docs/game-rules.md](./game-rules.md) for the authoritative rules and unresolved decisions.
