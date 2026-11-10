# Offline-first development plan

Online room work is intentionally paused. The current target is a complete local game that can be started, played, and finished without Supabase, a server, or an internet connection.

## Source of truth

Before changing rules or game behavior, read [game-rules.md](./game-rules.md). It is the canonical rules document. Any unresolved item in that file must remain explicitly unresolved in code and UI; do not invent a tie-break or scoring rule.

## Work order

1. Keep the canonical rules document current and resolve its remaining TBD decisions with the user.
2. Complete the game engine as pure TypeScript functions with no UI, network, or database imports.
3. Add deterministic unit tests for setup, turns, actions, hidden information boundaries, scoring, guessing, and end conditions.
4. Build a local hot-seat UI on top of the engine.
5. Complete the card artwork and interaction design.
6. Test full games with 3–7 players and verify privacy handoffs.
7. Resume online multiplayer only after the offline rules and engine are stable and the user approves resuming online work.

## Implemented offline engine foundation

- `setupOfflineRound()` validates the player roster and selected rule, deals the hands, and treats the clue card as the first previous card on the table.
- The Rule Keeper receives no hand; all other players receive the configured starting hand size.
- `playCards()` evaluates multi-card submissions atomically and advances the turn after a failed attempt.
- `exchangeWholeHand()` implements both keeper-inspection outcomes, including the one-card no-playable-card win and replacement draws after a playable card is selected.
- Draw-pile exhaustion ends the round immediately and snapshots rankings using remaining hand sizes.
- `scoring.ts` calculates active-player rank scores, competition-ranking ties, and the Rule Keeper's zero score.
- `guessing.ts` creates the secret-plus-decoys choices, rotates guesses clockwise, pauses for the Rule Keeper to add an unused rule after a wrong guess, and records the correct guesser.
- `guessRoundRule()` awards the +1 correct-guess bonus and completes the round.
- `match.ts` runs one round per player, rotates the Rule Keeper clockwise, accumulates scores, and ends the match after all rounds or draw-pile exhaustion.
- Random sources are injectable in setup and the game actions so tests can be deterministic.

## Implemented hot-seat UI foundation

- Added the `/offline` route with local player setup for 3–7 players and a selectable starting Rule Keeper.
- Added local card selection and ordered multi-card play, whole-hand exchange, table display, and draw-pile count.
- Added privacy handoff screens before showing a player's hand, the Rule Keeper's secret rule, keeper-only exchange choices, replacement-rule selection, and the next round's secret-rule selection.
- Added rule-guessing choices, round score summaries, total match scores, early ending, and one-round-per-player progression.
- Added a direct Offline entry point from the home page.
- The latest full CI run passed: lint, TypeScript typecheck, unit tests, and production build.

## Phase 3 exit status

Phase 3 — Visual & Interaction Polish is implementation-complete and has passed source-level review plus the full CI pipeline on the current branch. Browser/device playthrough is intentionally tracked as a Phase 5 QA gate because no browser automation/control runner is available in this environment.

## Phase 4 exit status — UX & Game Flow

- Added a setup rules preview explaining the seven-card starting hand, the Rule Keeper role, and one round per player.
- Added explicit confirmation before exchanging a whole hand or ending a match early; canceling leaves game state unchanged.
- Improved pass-and-play handoff screens to identify the actual recipient, including the named Rule Keeper.
- Added responsive confirmation-dialog styling and keyboard-focus/reduced-motion considerations.
- Source review and full CI passed on commit 1d4f035. Browser/device playthrough remains part of Phase 5 because no browser-control runner is available here.
- See [phase-4-ux-flow.md](./phase-4-ux-flow.md) for the verification record.

## Remaining offline work

- Phase 3 visual and interaction implementation is complete: ordered selection markers, clear-selection action, public player hand counts, active-turn/Rule Keeper highlights, recent-table-card context, segmented match-round progress, semantic roster, keyboard focus indicators, and reduced-motion behavior. See [phase-3-qa.md](./phase-3-qa.md) for the verification record.
- Browser-level/manual playthrough checks for 3–7 players, especially device handoffs and hidden-information privacy, remain explicitly scheduled for Phase 5 QA. Automated CI and source-level review pass; no browser playthrough is claimed.
- Versioned localStorage persistence now restores the match, current handoff, selected cards, and private keeper/guessing screens after refresh; malformed or incompatible sessions are discarded safely.
- Continue strengthening state invariants and cover any issues found during full-game playtests.
- Resume online multiplayer only after the offline rules and engine are stable and the user approves resuming online work.

## Decisions still open

No core rule decisions remain open. The canonical rules document records the confirmed behavior. The score table uses the number of active card-playing players (total players minus the Rule Keeper); the Rule Keeper independently receives zero points for that round.

## Architecture constraints

- The engine must remain pure TypeScript and deterministic when given a random source.
- UI components must call engine functions rather than reimplementing game rules.
- The future online server should reuse the same domain rules, but remain authoritative for all hidden information.
- Do not import Supabase, Next.js, browser APIs, or React into `src/lib/game`.
