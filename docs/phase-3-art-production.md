# Phase 3 Art Production — Soft Fantasy / Cozy Pastel

## Goal

Build a coherent premium storybook card-game art system for I Know… You Don’t. The world is warm, soft, and welcoming, with understated fantasy details and tactile 2.5D depth. Reduce spectacle and visual noise; prioritize beautiful character art, calm composition, and consistent materials.

## Production character set

Create 12 portrait masters:

| Animal | Pink identity | Blue identity | Gold identity |
|---|---|---|---|
| Cat | CAT_PINK | CAT_BLUE | CAT_GOLD |
| Rabbit | RABBIT_PINK | RABBIT_BLUE | RABBIT_GOLD |
| Frog | FROG_PINK | FROG_BLUE | FROG_GOLD |
| Fox | FOX_PINK | FOX_BLUE | FOX_GOLD |

Each portrait master is reused by six numbered cards. Do not generate 72 separate paintings and do not bake numbers, names, labels, or rules into images.

## Character art brief

- Premium hand-painted 2D digital painting; stylized semi-realistic 2.5D appearance.
- Soft believable fur / skin texture, gentle painterly edges, natural form shadows, soft highlights, and restrained expressions.
- Friendly personality comes from face, pose, and small costume details rather than elaborate fantasy outfits.
- Simple pastel scarves, collars, ribbons, tiny charms, or botanical accessories; avoid heavy armor, large crowns, and oversized jewels.
- Quiet low-detail background; subtle natural light and only a few tiny magical motes if needed.
- Consistent portrait scale, camera angle, lighting direction, and crop-safe composition across all 12.
- No text, numbers, watermark, frame, card border, collage, or UI inside production portrait files.
- Transparent background is preferred when clean painterly edges can be preserved; otherwise use a consistent quiet background with safe crop margins.

## Modular asset composition

Use a layered asset approach for the game scene and card presentation. It makes pieces reusable, independently animatable, and easier to optimize.

Suggested card layer stack, back to front:
1. Card shadow / contact shadow.
2. Card stock base and subtle paper texture.
3. Card frame, inset line, and corner ornaments.
4. Soft identity-color wash or small accent panel.
5. Character portrait raster.
6. Number badge, labels, and game data rendered by UI.
7. Optional foreground accent (tiny leaf, glimmer, or highlight) kept clear of text.

Suggested table / scene stack:
1. Background atmosphere (quiet woodland / warm neutral backdrop).
2. Table or playmat surface.
3. Table edge, stitched trim, and subtle markings.
4. Piles and card shadows.
5. Cards and player panels.
6. Foreground botanical accents or rare particles.

Character paintings should remain cohesive complete portraits. Do not cut a character into arbitrary body fragments just to create layers; that can break anatomy, lighting, and painterly edges. Separate only pieces that have a clear reuse or animation purpose, such as a scarf tip, floating leaf, soft glow, or particle.

## Sprite sheets versus layered assets

- Use independent transparent PNG / WebP assets for large compositional layers that need different positioning, scaling, or depth.
- Use sprite sheets / atlases for small repeated UI symbols, particle variations, and frame-by-frame animation sequences with consistent cell dimensions.
- Do not combine unrelated full-size card layers into a single sprite sheet. It makes cropping, responsive scaling, and individual updates harder.
- Document each layer's dimensions, anchor point, z-order, and asset name.
- Compose with CSS positioning, z-index, transforms, perspective, soft gradients, and contact shadows. This creates layered 2.5D depth without 3D models.

## Card art layout

- Portrait is the visual focus and remains readable at small mobile card sizes.
- Use a warm ivory card surface, delicate double frame, fine botanical corner accents, and restrained satin champagne-gold details.
- Pink / blue / gold identity is communicated by a gentle color wash, accent trim, and small emblem; keep the portrait palette harmonious.
- Number 1–6 remains rendered by UI, not embedded in raster art.
- Rule Cards and card backs use the same frame geometry, materials, ornament density, and light direction.

## Asset pipeline

1. Generate and review a style-consistency sample before producing all 12 portraits.
2. Approve character proportions, rendering softness, palette, light direction, and ornament density.
3. Export each portrait as an individual high-resolution raster asset with consistent dimensions and naming.
4. Create optional transparent overlays only for pieces that need independent movement or reuse.
5. Create sprite atlases only for suitable small icons, particles, and animation frames.
6. Optimize web delivery assets (WebP / AVIF where supported) and preserve editable source masters.
7. Add an explicit animal/color-to-path map in the UI asset layer.
8. Keep fallback artwork until all production assets are integrated and verified.
9. Check crops, contrast, and legibility at actual mobile card dimensions.

## Cohesion rules

- One light direction, one material language, one ornament vocabulary, and one pastel saturation range.
- Magic effects are rare accents, never constant visual noise.
- Avoid neon, hard black outlines, plastic shine, heavy bloom, cluttered scenery, oversized fantasy props, and mismatched illustration styles.
- Screen background and UI must support the cards, not compete with them.

## Current exploration

The first generated concept board explored the general game world and card composition, but its fantasy spectacle is now intentionally toned down. Use it only as a broad composition reference, not as the final mood target. The approved direction is softer, cozier, more natural, and less ornate. Individual production portraits and code integration remain outstanding.
