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

## Rule evaluation

A multi-card play is evaluated from left to right. Each proposed card is checked against the last previously accepted card, or the preceding card in the same proposed play. The whole play is accepted only if every card passes. A failed play must not partially change the public sequence.

Unknown condition types fail closed.

## Security model

The server is authoritative. Secret rule, draw pile, discard pile, and individual hands are stored separately from public room/player metadata. Direct Data API access is revoked for client roles; trusted server code uses the service role. Never ship the service-role key to a browser.

## Initial database entities

- `card_definitions`: immutable character-card catalog
- `rule_definitions`: rule catalog and condition metadata
- `game_rooms`: public room lifecycle metadata
- `game_players`: player seats and connection state
- `game_private_state`: hidden rule, clue, accepted sequence and piles
- `game_player_private`: per-player hand
- `game_events`: append-only action log with idempotency key

## Decisions still required before full turn implementation

- Whether the Rule Keeper rotates after each round
- Exact rule-guessing flow and whether all players can guess after the first player empties their hand
- Deck-exhaustion behavior
- Whether the initial clue card is removed from the draw pile
- Exact hand exchange behavior and edge cases
