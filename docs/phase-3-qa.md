# Phase 3 — Visual & Interaction Polish QA

## Automated verification

- [x] CI on `c987adc89cb7accae4b452ba78af09003bdc3c32` completed successfully.
- [x] ESLint
- [x] TypeScript typecheck
- [x] Vitest unit tests
- [x] Next.js production build

CI run: https://github.com/Blackzecond/I_know/actions/runs/42890369369

## Source-level review

- [x] Ordered multi-card selection displays a stable sequence number and exposes selection state to assistive technology.
- [x] Clearing a selection only clears the pending UI selection; it does not submit or mutate the hand.
- [x] Player status rail exposes public hand counts, current turn, and Rule Keeper without exposing private cards.
- [x] Roster uses list semantics and remains horizontally scrollable for narrow layouts.
- [x] Match progress segments derive from the configured number of rounds rather than a fixed player count.
- [x] Table context communicates the total card count and the five most recent visible cards.
- [x] Round and match leaders receive restrained visual emphasis.
- [x] Primary/secondary actions, setup fields, and selection controls have visible keyboard focus styles.
- [x] Reduced-motion rules disable card, handoff, pile, guessing, and score-entry animations.
- [x] Character atlas is documented as a low-resolution prototype, not final painted production art.

## Browser/device playthrough — deferred to Phase 5

This environment does not currently expose a browser-control or Playwright runner, so these checks have **not** been claimed as executed. Run them against the local app before release:

- [ ] Desktop layout and keyboard-only navigation.
- [ ] Narrow mobile layout at 3, 4, 5, 6, and 7 players.
- [ ] Ordered single/multi-card selection, deselection, clear selection, and submit.
- [ ] Failed play, whole-hand exchange, both Rule Keeper inspection outcomes, and one-card exchange edge case.
- [ ] Private handoff for every player and Rule Keeper; verify no hidden hand/rule leaks between handoffs.
- [ ] Guessing rotation, wrong-guess replacement rule, correct guess bonus, and next Rule Keeper.
- [ ] Round summary, tie display, match summary, early exit, refresh/restore, and draw-pile exhaustion.
- [ ] Reduced-motion preference and visible keyboard focus in an actual browser.

## Phase 3 exit

Implementation, source review, and automated CI are complete. Browser/device playthrough remains an explicit Phase 5 QA item; it is not represented as passed.
