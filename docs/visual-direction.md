# Visual Direction — I Know… You Don’t

## Approved art direction

**Stylized Semi-Realistic 2.5D**, built from 2D Digital Painting assets and layered web presentation. The game should feel like a premium, tactile tabletop card game without requiring real-time 3D models or a 3D rendering engine.

## Visual principles

- Character illustrations: hand-painted 2D assets with soft, dimensional lighting, believable fur/material texture, nuanced shadows, and expressive but restrained stylization.
- Cards: layered paper/card stock, subtly raised bevels, inset double frames, restrained foil or metallic accents, and soft contact shadows.
- Table: a muted, tactile felt or fabric surface with perspective cues, ambient shading, and a warm tabletop atmosphere.
- Piles: visibly layered card edges, small rotations, consistent cast shadows, and clear count labels.
- Motion: subtle lift, tilt, perspective, and shadow changes using CSS; never make animation interfere with card selection or readability.
- Palette: preserve pink, blue, and gold as the core card identities, balanced by warm ivory, muted sage, and soft plum neutrals.

## Rendering approach

1. Use high-resolution 2D raster paintings for final character art; keep SVG for icons, emblems, simple ornaments, and scalable interface details.
2. Use CSS gradients, inset highlights, layered shadows, perspective transforms, and pseudo-elements to add depth to the interface.
3. Keep the artwork and game logic separate so illustrations can be replaced without changing rules or card data.
4. Export artwork at sufficient resolution for high-density mobile displays and use responsive sizing with sensible image formats.
5. Keep effects lightweight and include reduced-motion behavior.

## Quality guardrails

- Avoid flat clip-art, harsh outlines, plastic-looking gloss, excessive bloom, noisy textures, and over-saturated gradients.
- Do not describe the current SVG character art as digital painting; it is a temporary stylized vector implementation until painted assets are supplied.
- Maintain strong text contrast, legible card information, accessible focus states, and responsive mobile layouts.
- No 3D models are required for the intended visual style.

## Implementation status

The current offline interface has a first CSS depth pass for card faces, rule cards, the felt playmat, card piles, and the player's hand panel. The existing character drawings remain SVG vector art; replacing them with painted raster assets is a separate art-asset phase.


## Offline table status layer

- Keep public information visible without exposing private hands: show each participant's remaining hand count, highlight the active player, and distinguish the Rule Keeper.
- Keep the roster horizontally scrollable on narrow screens so 3–7 players remain readable without compressing names.
- Ordered card selection must communicate its sequence visually and accessibly; clearing the selection must never submit or alter game state.
