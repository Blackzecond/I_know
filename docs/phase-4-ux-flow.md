# Phase 4 — UX & Game Flow

## Goal

Make the offline pass-and-play experience understandable and deliberate from setup through the final result, without changing confirmed game rules or resuming online work.

## Implemented

- Added a compact rules preview to setup: starting hand size, the Rule Keeper's no-hand role, and one round per player.
- Added a confirmation step before exchanging an entire hand, explaining that the hand is inspected and the current turn ends.
- Added a confirmation step before ending a match early, explaining that the match stops and the current accumulated score is summarized.
- Kept both confirmations local to the UI; they do not mutate game state until the player confirms.
- Improved private handoff clarity by showing the actual recipient's name even when that person is the Rule Keeper.
- Styled the confirmation dialog for narrow screens, keyboard focus visibility, and reduced-motion preferences.

## Behavior constraints

- No game-rule or scoring changes.
- The Rule Keeper remains private; secret rules and private hands are not added to public table UI.
- Canceling a confirmation leaves the game state unchanged.
- Confirming an exchange delegates to the existing game action; the UI does not duplicate rule logic.
- Confirming early exit delegates to the existing match action.
- No Supabase, online-room, merge, or deployment work is included.

## Verification

- [ ] ESLint
- [ ] TypeScript typecheck
- [ ] Unit tests
- [ ] Production build
- [ ] Source review of confirmation branches and pass-and-play recipient labels
- [ ] Browser/device flow verification remains part of Phase 5 because no browser-control runner is available in this environment.

## Exit criteria

Phase 4 is complete when the full CI pipeline passes and the setup, handoff, irreversible actions, round transitions, early exit, and match completion paths have been reviewed. Browser/device playthrough remains a Phase 5 release gate.
