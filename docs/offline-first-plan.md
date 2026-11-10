# Offline-first development plan

Online room work is intentionally paused. The current target is a complete local game that can be started, played, and finished without Supabase, a server, or an internet connection.

## Source of truth

Before changing rules or game behavior, read [game-rules.md](./game-rules.md). It is the canonical rules document. Any unresolved item in that file must remain explicitly unresolved in code and UI; do not invent a tie-break or scoring rule.

## Work order

1. Keep the canonical rules document current and resolve its remaining TBD decisions with the user.
2. Complete the game engine as pure TypeScript functions with no UI, network, or database imports.
3. Add deterministic unit tests for setup, turns, actions, hidden information boundaries, scoring, guessing, and end conditions.
4. Build a local hot-seat UI on top of the engine.
5. Complete the visual identity, production character artwork, card system, table environment, motion, and interaction polish.
6. Test full games with 3–7 players and verify privacy handoffs.
7. Resume online multiplayer only after the offline rules, engine, visual implementation, and QA are stable and the user approves resuming online work.

## Implemented offline engine foundation

- Setup validates the player roster and selected rule, deals the hands, and treats the clue card as the first previous card on the table.
- The Rule Keeper receives no hand; all other players receive the configured starting hand size.
- Multi-card submissions are evaluated atomically and failed attempts advance the turn.
- Whole-hand exchange implements both keeper-inspection outcomes, including the one-card no-playable-card win and replacement draws after a playable card is selected.
- Draw-pile exhaustion ends the round immediately and snapshots rankings using remaining hand sizes.
- Scoring calculates active-player rank scores, competition-ranking ties, and the Rule Keeper's zero score.
- Guessing creates the secret-plus-decoys choices, rotates guesses clockwise, pauses for the Rule Keeper to add an unused rule after a wrong guess, and records the correct guesser.
- Correct guesses award the +1 bonus and complete the round.
- Match flow runs one round per player, rotates the Rule Keeper clockwise, accumulates scores, and ends after all rounds or draw-pile exhaustion.
- Random sources are injectable so tests can be deterministic.

## Implemented hot-seat UI foundation

- Added the /offline route with local player setup for 3–7 players and a selectable starting Rule Keeper.
- Added local card selection and ordered multi-card play, whole-hand exchange, table display, and draw-pile count.
- Added privacy handoff screens before showing a player's hand, the Rule Keeper's secret rule, keeper-only exchange choices, replacement-rule selection, and next-round secret-rule selection.
- Added rule-guessing choices, round score summaries, total match scores, early ending, and one-round-per-player progression.
- Added a direct Offline entry point from the home page.
- A previous full CI run passed lint, TypeScript typecheck, unit tests, and production build.

## Phase 3 — Visual & Interaction Polish (REOPENED)

Phase 3 was previously marked complete too early. Earlier work delivered interaction polish and CSS depth, but did not deliver the high-quality production artwork and cohesive fantasy-pastel visual identity required by the approved direction. Phase 3 is therefore **open and incomplete**. Do not begin Phase 5 or declare Phase 3 complete until its visual deliverables are implemented and reviewed.

Approved identity: **Fantasy Minimalist Pastel — Stylized Semi-Realistic 2.5D**. The game should be magical and detailed through restrained glow, stardust, botanical flourishes, and soft material depth, while remaining calm, minimal, readable, and stylistically unified. See [visual-direction.md](./visual-direction.md) and [phase-3-art-production.md](./phase-3-art-production.md).

### Phase 3 work packages

1. **3.1 Character artwork — highest priority:** create 12 coherent painted portrait masters (4 animals × 3 card colors). Numbers 1–6 remain UI elements. Deliver high-resolution, individually exportable assets with consistent lighting, framing, palette, and character identity.
2. **3.2 Card system:** integrate portraits into character cards; refine paper stock, double frames, champagne-gold ornament, restrained magical glow, number typography, matching card backs, and Rule Cards.
3. **3.3 Table environment:** unify playmat, piles, card zones, player rail, and panels under the same enchanted-garden visual language while preserving gameplay readability.
4. **3.4 Motion and feedback:** implement purposeful deal, play, draw, turn/handoff, selection, correct-guess, and incorrect-action feedback. Include reduced-motion equivalents.
5. **3.5 Responsive and accessibility pass:** review mobile crops, card text, contrast, focus states, touch targets, and keyboard / screen-reader semantics.
6. **3.6 Cohesion review:** inspect the complete game as one product; remove visual inconsistencies, excessive ornament, and effects that compete with gameplay.

### Phase 3 acceptance criteria

- Final production character art is raster digital painting, not the existing SVG prototype.
- All 12 animal/color portraits have consistent visual treatment and are mapped to card data without changing game rules.
- Cards, Rule Cards, backs, table, piles, interface, and feedback effects share one coherent fantasy-pastel design system.
- Magical details are visible but restrained; gameplay hierarchy and readability remain primary.
- Deal/play/draw/turn/guess feedback is implemented and does not block actions.
- Responsive behavior, accessibility, and reduced-motion behavior are preserved.
- Documentation accurately distinguishes concept art, prototype art, and integrated production assets.

## Phase 4 — UX & Game Flow

- Added a setup rules preview explaining the seven-card starting hand, the Rule Keeper role, and one round per player.
- Added explicit confirmation before exchanging a whole hand or ending a match early; canceling leaves game state unchanged.
- Improved pass-and-play handoff screens to identify the actual recipient, including the named Rule Keeper.
- Added responsive confirmation-dialog styling and keyboard-focus/reduced-motion considerations.
- Source review and full CI passed on commit 1d4f035. Browser/device playthrough remains a QA requirement because no browser-control runner is available here.
- See [phase-4-ux-flow.md](./phase-4-ux-flow.md) for the verification record.

## Remaining offline work

- Phase 3 remains open; see its six work packages and acceptance criteria above.
- Browser-level/manual playthrough checks for 3–7 players, especially device handoffs and hidden-information privacy, remain unverified. No browser playthrough is claimed.
- Versioned localStorage persistence restores the match, current handoff, selected cards, and private keeper/guessing screens after refresh; malformed or incompatible sessions are discarded safely.
- Continue strengthening state invariants and cover any issues found during full-game playtests.
- Resume online multiplayer only after the offline rules and engine are stable, Phase 3 visual acceptance criteria are met, QA is complete, and the user approves resuming online work.

## Decisions still open

No core rule decisions remain open. The canonical rules document records the confirmed behavior. The score table uses the number of active card-playing players (total players minus the Rule Keeper); the Rule Keeper independently receives zero points for that round.

## Architecture constraints

- The engine must remain pure TypeScript and deterministic when given a random source.
- UI components must call engine functions rather than reimplementing game rules.
- The future online server should reuse the same domain rules, but remain authoritative for all hidden information.
- Do not import Supabase, Next.js, browser APIs, or React into src/lib/game.
