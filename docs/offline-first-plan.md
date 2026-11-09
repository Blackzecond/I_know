# Offline-first development plan

Online room work is intentionally paused. The current target is a complete local game that can be started, played, and finished without Supabase, a server, or an internet connection.

## Source of truth

Before changing rules or game behavior, read [game-rules.md](./game-rules.md). It is the canonical rules document. Any unresolved item in that file must remain explicitly unresolved in code and UI; do not invent a tie-break or scoring rule.

## Work order

1. Keep the canonical rules document current and resolve its remaining TBD decisions with the user.
2. Complete the game engine as pure TypeScript functions with no UI, network, or database imports.
3. Add deterministic unit tests for setup, turns, actions, hidden information boundaries, scoring, guessing, and end conditions.
4. Build a local hot-seat / simulated-player UI on top of the engine.
5. Complete the card artwork and interaction design.
6. Test full games with 3–7 players.
7. Resume online multiplayer only after the offline rules and engine are stable and the user approves resuming online work.

## Implemented offline foundation

- `setupOfflineRound()` validates the player roster and selected rule.
- The Rule Keeper receives no hand.
- The clue card is selected from the deck using the secret rule and removed from the draw pile.
- Every active player other than the Rule Keeper receives seven cards.
- The first turn belongs to the player immediately clockwise from the Rule Keeper.
- The remaining cards stay in the draw pile.
- The setup accepts an injectable random function so tests can be deterministic.
- `playCards()` evaluates a submitted set atomically; an invalid set stays in the player's hand and ends the turn.
- `exchangeWholeHand()` implements whole-hand inspection and exchange, including the one-card no-playable-card case.

## Rules to implement next

The following are defined in the canonical rules document but are not yet fully implemented in the engine:

- Transition to the guessing phase when the first player empties their hand.
- Snapshot remaining hand sizes at that moment and rank players with fewer remaining cards higher.
- Rule-guessing choices: the actual secret rule plus two decoys; after a wrong guess, pass clockwise and add one unused rule card to keep three choices.
- Award the +1 correct-guess bonus.
- Apply round ranking scores, with tied hand counts receiving the same rank score and the Rule Keeper receiving zero points for that round.
- End the match after a fixed number of rounds equal to the number of players, so each player serves as Rule Keeper exactly once; sum scores across rounds.
- Advance the Rule Keeper clockwise after each completed round.
- End the game if the draw pile is exhausted; scoring for this exceptional end condition remains TBD.

## Decisions still open

See the full list in [game-rules.md](./game-rules.md). In particular:
- Whether the round score table is indexed by total seated players or by active card-playing players (the Rule Keeper receives zero points either way).
- How to score a game that ends because the draw pile is exhausted.
- Whether the clue card counts as the previous card for sequence-dependent rules.

## Architecture constraints

- The engine must remain pure TypeScript and deterministic when given a random source.
- UI components must call engine functions rather than reimplementing game rules.
- The future online server should reuse the same domain rules, but remain authoritative for all hidden information.
- Do not import Supabase, Next.js, browser APIs, or React into `src/lib/game`.
