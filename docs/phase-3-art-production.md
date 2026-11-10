# Phase 3 Art Production — Fantasy Minimalist Pastel

## Goal

Build a coherent premium fantasy card-game art system for I Know… You Don’t. The art should be whimsical and magical, with subtle effects and tactile depth, while remaining minimal, calm, and readable.

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
- Soft believable fur / skin texture, painterly detail, nuanced form shadows, gentle rim light, and expressive but restrained face.
- Each animal remains recognizable and consistent across all three color variants.
- Pastel costume/accessory and restrained magical accent express the assigned identity color.
- Quiet, low-detail background with subtle magical halo, sparse motes, and soft botanical / celestial cues.
- Consistent portrait scale, camera angle, lighting direction, and crop-safe composition across all 12.
- No text, numbers, watermark, frame, card border, collage, or UI inside production portrait files.
- Transparent background is preferred if it does not damage painterly edges; otherwise use a consistent quiet background.

## Card art layout

- Portrait is the visual focus and remains readable at small mobile card sizes.
- Use a warm ivory card surface, fine double border, small corner ornaments, and champagne-gold foil accents.
- Pink / blue / gold identity is communicated by restrained color wash, accent trim, and small emblem; keep portrait palette harmonious.
- Number 1–6 remains rendered by UI, not embedded in raster art.
- Rule Cards and card backs use the same frame geometry, materials, ornament density, and light direction.

## Asset pipeline

1. Generate and review a small style-consistency set before producing all 12 portraits.
2. Approve one visual language for the four animal identities and three color treatments.
3. Export each portrait as an individual high-resolution raster file with consistent dimensions and naming.
4. Optimize web delivery assets (WebP / AVIF where supported) and preserve editable source masters.
5. Add an explicit animal/color-to-path map in the UI asset layer.
6. Keep fallback artwork available until all production assets are integrated and verified.
7. Check crops and legibility at actual mobile card dimensions.

## Cohesion rules

- One light direction, one material language, one ornament vocabulary, and one pastel saturation range.
- Magic effects are small accents, never a layer of constant visual noise.
- Avoid neon, hard black outlines, plastic shine, heavy bloom, cluttered scenery, and mismatched illustration styles.
- Screen background and UI must support the cards, not compete with them.

## Current exploration

A generated full-screen concept board has been used to explore the world, pastel palette, character mood, gold detailing, and felt-table atmosphere. It is a direction reference only: lettering and small UI details in generated concept art are not production-ready, and composite character depictions are not individual card assets. Production portraits and code integration remain outstanding.
