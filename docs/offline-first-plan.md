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

## Implemented offline engine foundation

- `setupOfflineRound()` validates the player roster and selected rule, deals the hands, and treats the clue card as the first previous card on the table.
- The Rule Keeper receives no hand; all other players receive the configured starting hand size.
- `playCards()` evaluates multi-card submissions atomically and advances the turn after a failed attempt.
- `exchangeWholeHand()` implements both keeper-inspection outcomes, including the one-card no-playable-card win and replacement draws after a playable card is selected.
- Draw-pile exhaustion ends the round immediately and snapshots rankings using remaining hand sizes.
- `scoring.ts` calculates active-player rank scores, competition-ranking ties, and the Rule Keeper's zero score.
- `guessing.ts` creates the secret-plus-decoys choices, rotates guesses clockwise, adds unused rules after wrong guesses, and records the correct guesser.
- `guessRoundRule()` awards the +1 correct-guess bonus and completes the round.
- `match.ts` runs one round per player, rotates the Rule Keeper clockwise, accumulates scores, and ends the match after all rounds or draw-pile exhaustion.
- Random sources are injectable in setup and the game actions so tests can be deterministic.

## Remaining offline work

- Run the full lint, TypeScript, unit-test, and production-build checks; fix any failures.
- Add additional edge-case tests and strengthen state invariants.
- Build the local hot-seat UI on top of the engine.
- Complete the card artwork and interaction design.
- Test full games with 3–7 players.
- Resume online multiplayer only after the offline rules and engine are stable and the user approves resuming online work.

## Decisions still open

No core rule decisions remain open. The canonical rules document records the confirmed behavior. The score table uses the number of active card-playing players (total players minus the Rule Keeper); the Rule Keeper independently receives zero points for that round.

## Architecture constraints

- The engine must remain pure TypeScript and deterministic when given a random source.
- UI components must call engine functions rather than reimplementing game rules.
- The future online server should reuse the same domain rules, but remain authoritative for all hidden information.
- Do not import Supabase, Next.js, browser APIs, or React into `src/lib/game`.
