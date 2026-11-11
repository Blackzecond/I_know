# Phase 3 — Visual & Interaction Polish QA

## Current status

**OPEN — NOT COMPLETE.**

The earlier closeout was premature. Previous work covered interaction polish, source-level checks, and CSS depth, but did not deliver the approved production character paintings or a fully unified fantasy-pastel visual system. The earlier CI result remains historical evidence for that earlier code state only; it is not a Phase 3 visual acceptance result.

## Approved art direction

- Fantasy Minimalist Pastel — Stylized Semi-Realistic 2.5D.
- Magical, whimsical, and detailed through restrained glow, stardust, botanical flourishes, and soft material depth.
- Calm, uncluttered pastel palette with pink, blue, champagne gold, sage, lavender, and warm ivory.
- One coherent visual language across characters, cards, Rule Cards, card backs, playmat, piles, interface, and motion.
- Final character illustrations must be high-resolution 2D digital paintings. Existing SVG art is prototype-only.

See [visual-direction.md](./visual-direction.md) and [phase-3-art-production.md](./phase-3-art-production.md).

## Previously completed interaction work

- [x] Ordered multi-card selection displays a stable sequence number and exposes selection state to assistive technology.
- [x] Clearing a selection only clears the pending UI selection; it does not submit or mutate the hand.
- [x] Player status rail exposes public hand counts, current turn, and Rule Keeper without exposing private cards.
- [x] Roster uses list semantics and remains horizontally scrollable for narrow layouts.
- [x] Match progress segments derive from the configured number of rounds rather than a fixed player count.
- [x] Table context communicates the total card count and the five most recent visible cards.
- [x] Round and match leaders receive restrained visual emphasis.
- [x] Primary/secondary actions, setup fields, and selection controls have visible keyboard focus styles.
- [x] Reduced-motion rules disable existing card, handoff, pile, guessing, and score-entry animations.
- [x] Character atlas is documented as a low-resolution prototype, not final painted production art.

## Modular card composition scaffold

- [x] Character card markup now separates card stock, identity wash, frame, corner ornaments, portrait layer, foreground accents, and UI-rendered data.
- [x] Existing four-animal atlas is cropped through dedicated per-animal selectors inside the new portrait layer.
- [x] CSS supplies independent depth, material, and identity-color treatments without changing card data or game rules.
- [ ] Replace the prototype atlas with the approved 12 high-resolution production paintings.

This is a reusable composition scaffold, not completion of production artwork.

## Production visual deliverables — not yet complete

- [ ] 12 consistent painted character portrait masters: cat, rabbit, frog, fox × pink, blue, gold.
- [ ] Individual optimized image assets integrated into the card-art mapping; numbers remain UI-rendered.
- [ ] Character card face refined around production paintings and approved pastel-fantasy frame.
- [ ] Matching Rule Cards and card back.
- [ ] Unified magical tabletop / felt environment and card pile depth.
- [ ] Deal, play, draw, turn/handoff, and correct/incorrect feedback motion.
- [ ] Cohesion review across setup, gameplay, dialogs, scoring, and mobile layouts.

## Source-level / automated verification

Historical checks from the earlier interaction-polish implementation:
- [x] ESLint
- [x] TypeScript typecheck
- [x] Vitest unit tests
- [x] Next.js production build

Historical CI run: https://github.com/Blackzecond/I_know/actions/runs/42890369369

A new CI run must be checked after production visual implementation changes code. Do not treat the historical run as validation for new work.

## Browser/device playthrough

These checks have not been claimed as executed. Run them when a browser-control or Playwright runner is available:
- [ ] Desktop layout and keyboard-only navigation.
- [ ] Narrow mobile layout at 3, 4, 5, 6, and 7 players.
- [ ] Card selection, deselection, clear selection, and ordered submit.
- [ ] Deal/play/draw transitions and correct/incorrect feedback.
- [ ] Private handoff for every player and Rule Keeper; verify no hidden hand/rule leaks.
- [ ] Reduced-motion preference, focus visibility, and touch targets in an actual browser.

## Phase 3 exit gate

Phase 3 may close only when the production visual deliverables above are implemented, the complete visual system is reviewed for cohesion, responsive/accessibility/reduced-motion checks are satisfied, and the new code passes CI. Browser/device checks must be reported separately and never represented as passed without execution.
