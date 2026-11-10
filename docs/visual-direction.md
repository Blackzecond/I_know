# Visual Direction — I Know… You Don’t

## Approved visual identity

**Fantasy Minimalist Pastel — Stylized Semi-Realistic 2.5D.**

A premium magical tabletop card game: whimsical and enchanted, with refined fantasy details and gentle effects, while remaining calm, uncluttered, and easy to read. Every screen, card, illustration, icon, and animation must look as though it belongs to one coherent world.

This is neither generic high-fantasy spectacle nor flat minimal UI. It is a soft storybook world with controlled ornament, material depth, and restrained glow.

## Mood and world

- A peaceful enchanted garden / woodland realm with a warm, welcoming atmosphere.
- Soft ambient light, delicate haze, tiny floating motes, subtle stardust, and occasional magical glimmers.
- Organic motifs such as leaves, petals, moon-stars, small runes, and elegant botanical flourishes.
- Fantasy details frame the content rather than compete with it.
- Avoid dark, threatening, overly medieval, or aggressively dramatic styling.

## Core palette

Use muted, low-saturation pastel colors with warm neutral foundations.

| Role | Color direction | Suggested token |
|---|---|---|
| Pink identity | Powder rose | #EFBBCB |
| Blue identity | Mist blue | #AFCFE8 |
| Gold identity | Champagne gold | #E8D39A |
| World / play surface | Muted sage | #C7D8C2 |
| Magical accent | Soft lavender | #D5C6E6 |
| Card / panel surface | Warm ivory | #F3EBDD |
| Main ink | Deep plum-charcoal | #51485D |
| Fine ornament | Muted antique gold | #C6A96B |

These are starting tokens, not rigid limits. Maintain sufficient contrast. Pink, blue, and gold remain canonical card identities.

## Character art direction

- Final character illustrations are high-resolution 2D digital paintings, not SVG cartoons and not 3D renders.
- Four animal identities: cat, rabbit, frog, and fox.
- Each animal has a consistent recognizable silhouette and personality across all color variants.
- Soft believable fur / skin / material texture, painterly edge control, nuanced form shadows, gentle rim light, and expressive but restrained faces.
- Pastel clothing, magical accessories, tiny botanical details, and subtle particles may be used where they support the character.
- Keep the character as the unmistakable focal point; backgrounds remain quiet and uncluttered.
- Plan for 12 reusable portrait masters (4 animals × 3 color identities). Card numbers 1–6 remain live UI elements and must not be baked into art.
- Preserve clean silhouettes and safe margins for mobile crops.

## Card system

- Warm ivory paper/card stock with subtle tactile grain.
- Delicate double frames, softly raised bevels, rounded corners, fine corner flourishes, and restrained champagne-gold foil.
- Contained soft glow or a few sparkles may identify magical states; avoid thick neon outlines and excessive bloom.
- Character portrait occupies the visual center. Animal name, color identity, and number remain high-contrast and scannable.
- Rule Cards share the same paper, frame, typography, and ornament language, but use distinct symbolic illustrations.
- Card backs feel like the reverse of the same deck, with one memorable magical emblem.
- Depth comes from layered 2D assets, CSS gradients, perspective, inset highlights, and contact shadows.

## Table and play environment

- Calm sage / muted green felt or fabric play surface with fine, low-contrast texture.
- Warm ivory and antique-gold edging, subtle botanical / celestial markings, and soft ambient shading.
- Card piles show layered edges, small natural rotations, and consistent cast shadows.
- Keep the central play area quiet so card identity and turn state remain clear.
- Decorative elements stay at the periphery and never obstruct interaction or contrast.

## Motion and magical effects

- Deal: cards rise gently from the deck, travel with a small arc, then settle with a soft shadow.
- Play: selected cards lift, tilt slightly, and glide to the table; preserve selected order.
- Draw: one card separates from the pile and moves into the player's hand.
- Turn / handoff: restrained glow or short transition signals whose turn it is.
- Correct / incorrect feedback: distinct but calm magical responses (warm sparkle / muted pulse), never aggressive flashing or shaking.
- Selection: gentle lift, fine outline, and clear order marker.
- Motion is short, purposeful, and non-blocking. Respect reduced-motion preferences and provide equivalent non-animated feedback.

## Interface consistency

- Use one shared design language for landing, setup, table, score summaries, dialogs, buttons, icons, player indicators, and Rule Cards.
- Typography is calm and legible; reserve decorative display lettering for small brand moments, not gameplay instructions.
- Use consistent radii, border weights, spacing, shadows, glow intensity, and icon stroke language.
- Maintain responsive layouts and high-density mobile rendering.
- Effects must not obscure game state, hidden-information boundaries, card labels, or focus indicators.

## Rendering and asset pipeline

1. Use high-resolution raster paintings for final character art. Use SVG only for scalable emblems, icons, fine ornaments, and simple interface details.
2. Keep art assets independent of game rules and card data; the same portrait master may be reused by six numbered cards.
3. Store source artwork and optimized web exports separately when practical. Preserve a documented animal/color-to-asset mapping.
4. Use CSS for layered paper depth, soft shadows, foil-like gradients, subtle glow, perspective, and transitions.
5. Optimize raster assets for responsive high-density screens; prefer modern formats such as WebP / AVIF for delivery, retaining editable source masters.
6. Include reduced-motion behavior and verify text contrast, focus visibility, and mobile crop safety.

## Quality guardrails

- Avoid flat clip-art, harsh outlines, plastic gloss, heavy bloom, noisy textures, oversaturated gradients, and unrelated visual styles.
- A dense ornate screen is not automatically premium; whitespace and hierarchy are essential.
- Do not bake numbers, text, or game state into character paintings.
- Current SVG animal art is prototype-only, not final digital painting.
- No 3D models or real-time 3D engine are required.

## Current asset status

The existing SVG animal illustrations and CSS card treatment are prototypes, not final production character art.

A generated full-screen concept board is an art-direction exploration only. It is not a shippable game screen, final character asset set, or verified implementation. Production character portraits still need to be generated, reviewed for consistency, exported as individual assets, and integrated into the card component.
