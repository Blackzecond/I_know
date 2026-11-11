# Visual Direction — I Know… You Don’t

## Approved visual identity

**Soft Fantasy / Cozy Pastel — Stylized Semi-Realistic 2.5D.**

A premium, gentle storybook tabletop game. It should feel warm, soft, and welcoming, with a little hidden magic rather than grand fantasy spectacle. The whole product must feel like one coherent illustrated world.

The target is softer and less overtly fantastical than the first concept board: natural light, quiet enchanted woodland details, delicate materials, and restrained magical accents. Keep the charm; reduce the visual noise.

## Mood and world

- A peaceful garden / woodland clearing with soft morning or late-afternoon light.
- Warm diffused lighting, gentle atmospheric depth, soft shadows, and a little natural haze.
- Small botanical details: leaves, tiny flowers, petals, seed heads, and occasional firefly-like motes.
- Magic is subtle: a faint glimmer, a delicate halo, a tiny star detail, or a soft light trail only when it supports feedback.
- Avoid grand castles, dramatic fantasy skies, large magical circles, dense sparkles, oversized crowns, and ornate high-fantasy decoration.
- Keep negative space around the play area and character portraits.

## Core palette

Use muted, low-saturation pastels with warm neutral foundations.

| Role | Color direction | Suggested token |
|---|---|---|
| Pink identity | Powder rose | #EFBBCB |
| Blue identity | Mist blue | #AFCFE8 |
| Gold identity | Soft champagne | #E8D39A |
| World / play surface | Muted sage | #C7D8C2 |
| Secondary accent | Dusty lavender | #D5C6E6 |
| Card / panel surface | Warm ivory | #F3EBDD |
| Main ink | Soft plum-charcoal | #51485D |
| Fine ornament | Muted antique gold | #C6A96B |

These are starting tokens, not rigid limits. Maintain sufficient contrast. Pink, blue, and gold remain canonical card identities.

## Character art direction

- Final character illustrations are high-resolution 2D digital paintings, not SVG cartoons and not 3D renders.
- Four animal identities: cat, rabbit, frog, and fox.
- Soft, believable fur / skin texture; gentle painterly edges; natural form shadows; soft highlights; restrained expressions.
- Friendly, charming characters with personality conveyed through face, pose, and small costume details rather than elaborate fantasy outfits.
- Use simple pastel scarves, collars, ribbons, tiny charms, or botanical accessories. Avoid heavy armor, elaborate crowns, oversized jewels, and complex costume silhouettes.
- Keep the character as the focal point against a quiet, low-detail background.
- Plan for 12 reusable portrait masters (4 animals × 3 color identities). Card numbers 1–6 remain live UI elements and must not be baked into art.
- Keep consistent camera angle, light direction, portrait scale, and crop-safe margins.

## Card system

- Warm ivory paper/card stock with subtle tactile grain.
- Delicate double frame, softly raised bevel, rounded corners, and fine botanical corner accents.
- Champagne-gold details should be thin and matte / satin rather than bright metallic glare.
- Character portrait occupies the visual center. Animal identity, color, and number remain high-contrast and immediately scannable.
- Use a gentle color wash or small identity accent, not a full saturated background.
- Rule Cards share the same paper, frame, typography, and ornament language, with simple symbolic illustrations.
- Card backs feel like the reverse of the same deck, with one quiet, memorable emblem.
- Depth comes from layered assets, CSS gradients, perspective, inset highlights, and contact shadows.

## Table and play environment

- Muted sage / soft green fabric play surface with a fine, low-contrast texture.
- Warm ivory and subtle antique-gold edging; botanical markings are sparse and low contrast.
- Card piles show layered edges, small natural rotations, and consistent cast shadows.
- Keep the central play area quiet so card identity and turn state remain clear.
- Environment decoration stays near the perimeter and never competes with cards or blocks interaction.

## Motion and effects

- Deal: cards rise gently from the deck, travel on a short soft arc, then settle with a contact shadow.
- Play: selected cards lift, tilt slightly, and glide to the table; preserve selected order.
- Draw: one card separates from the pile and moves into the player's hand.
- Turn / handoff: a soft highlight or short fade signals whose turn it is.
- Correct / incorrect feedback: warm tiny sparkle or muted pulse; avoid flashing, explosive bursts, or aggressive shaking.
- Selection: gentle lift, fine outline, and clear order marker.
- Keep motion short, purposeful, and non-blocking. Respect reduced-motion preferences and provide equivalent static feedback.

## Interface consistency

- Use one shared design language for landing, setup, table, score summaries, dialogs, buttons, icons, player indicators, and Rule Cards.
- Typography is calm and legible; reserve decorative display lettering for small brand moments, not gameplay instructions.
- Use consistent radii, border weights, spacing, shadows, glow intensity, and icon stroke language.
- Maintain responsive layouts and high-density mobile rendering.
- Effects must not obscure game state, hidden-information boundaries, card labels, or focus indicators.

## Rendering and asset pipeline

1. Use high-resolution raster paintings for final character art. Use SVG only for scalable emblems, icons, fine ornaments, and simple interface details.
2. Compose the visual scene from independent layers where useful: background, play surface, card shadows, card body/frame, portrait, number/labels, and foreground accents.
3. Keep character portrait paintings cohesive as individual raster assets; do not slice a finished character into arbitrary fragments if that damages painterly continuity. Optional accessories or small effects may be separate transparent layers when they genuinely need independent motion.
4. Use transparent PNG or WebP layers for compositional pieces, with documented dimensions, anchor points, and naming. Keep source masters separate from optimized delivery exports.
5. Use sprite sheets / atlases for small repeated icons, particles, and frame-by-frame animation sequences where a shared cell size is useful. Do not put unrelated full-screen layers into one sprite sheet.
6. Assemble layers with CSS positioning, z-index, transforms, perspective, gradients, and contact shadows. This creates parallax-like 2.5D depth without 3D models.
7. Keep art assets independent of game rules and card data; the same portrait master may be reused by six numbered cards.
8. Optimize raster assets for responsive high-density screens; preserve editable source masters and provide a documented animal/color-to-asset map.
9. Include reduced-motion behavior and verify text contrast, focus visibility, and mobile crop safety.

## Quality guardrails

- Avoid flat clip-art, harsh outlines, plastic gloss, heavy bloom, noisy textures, oversaturated gradients, cluttered scenery, and unrelated visual styles.
- A dense ornate screen is not automatically premium; whitespace and hierarchy are essential.
- Do not bake numbers, text, or game state into character paintings.
- Current SVG animal art is prototype-only, not final digital painting.
- No 3D models or real-time 3D engine are required.
