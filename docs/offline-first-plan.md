# Offline-first development plan

Online room work is intentionally paused. The current target is a complete local game that can be started, played, and finished without Supabase, a server, or an internet connection.

## Work order

1. Complete and approve the game rules, including deck exhaustion, exchange-hand edge cases, guessing, and end-of-round conditions.
2. Implement the game engine as pure TypeScript functions with no UI, network, or database imports.
3. Add deterministic unit tests for setup, turns, actions, hidden information boundaries, and end conditions.
4. Build a local hot-seat / simulated-player UI on top of the engine.
5. Complete the card artwork and interaction design.
6. Test full games with 3–7 players.
7. Resume online multiplayer only after the offline rules and engine are stable.

## Implemented offline foundation

- setupOfflineRound() validates the player roster and selected rule.
- The Rule Keeper receives no hand.
- The clue card is selected from the deck using the secret rule and removed from the draw pile.
- Every other player receives seven cards.
- The first turn belongs to the player immediately clockwise from the Rule Keeper.
- The remaining cards stay in the draw pile.
- The setup accepts an injectable random function so tests can be deterministic.
- playCards() evaluates a submitted set atomically; an invalid set stays in the player's hand and ends the turn.
- exchangeWholeHand() implements the whole-hand inspection and exchange rules, including the one-card no-playable-card case.
- When a player empties their hand, the state enters a pending-guess phase; the actual guessing procedure remains to be specified.

## Rules still to be decided

- Whether the clue card counts as the first accepted card for sequence-dependent rules.
- Whether and when the draw pile is recycled from the discard pile.
- Exact guessing procedure after a player empties their hand.
- Whether the Rule Keeper can win and under what condition.
- How a round ends if the active player disconnects or a player leaves (online-only concern; not part of offline engine).

## Architecture constraints

- The engine must remain pure TypeScript and deterministic when given a random source.
- UI components must call engine functions rather than reimplementing game rules.
- The future online server should reuse the same domain rules, but remain authoritative for all hidden information.
- Do not import Supabase, Next.js, browser APIs, or React into src/lib/game.
