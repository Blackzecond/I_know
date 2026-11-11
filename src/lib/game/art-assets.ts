import type { CharacterCard } from "./catalog";

export type CharacterArtStatus = "prototype" | "production";

export interface CharacterArtAsset {
  src: string;
  status: CharacterArtStatus;
  /** Horizontal atlas cell, from left to right. */
  atlasColumn: number;
  /** Vertical atlas cell, from top to bottom. */
  atlasRow: number;
  atlasColumns: number;
  atlasRows: number;
  alt: string;
}

const ANIMAL_COLUMN: Record<CharacterCard["animal"], number> = {
  cat: 0,
  rabbit: 1,
  frog: 2,
  fox: 3,
};

const ANIMAL_ALT: Record<CharacterCard["animal"], string> = {
  cat: "ภาพวาดแมว",
  rabbit: "ภาพวาดกระต่าย",
  frog: "ภาพวาดกบ",
  fox: "ภาพวาดสุนัขจิ้งจอก",
};

/**
 * Central art manifest. The current atlas is deliberately marked prototype;
 * replace entries with individual transparent WebP/PNG portraits as they pass
 * the production-art review. Card identity and game rules never depend on art.
 */
export function getCharacterArt(
  animal: CharacterCard["animal"],
  _color: CharacterCard["color"],
): CharacterArtAsset {
  return {
    src: "/game/animal-painted-atlas.webp",
    status: "prototype",
    atlasColumn: ANIMAL_COLUMN[animal],
    atlasRow: 0,
    atlasColumns: 4,
    atlasRows: 1,
    alt: ANIMAL_ALT[animal],
  };
}

export const CHARACTER_ART_PRODUCTION_TARGET = {
  animals: ["cat", "rabbit", "frog", "fox"] as const,
  colors: ["pink", "blue", "gold"] as const,
  portraitCount: 12,
  preferredFormat: "webp",
  preferredBackground: "transparent",
} as const;
