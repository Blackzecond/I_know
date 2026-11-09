import { describe, expect, it } from "vitest";
import { CHARACTER_CARDS, RULE_CARDS } from "./catalog";
import { evaluatePlay } from "./rule-engine";

const card = (id: string) => {
  const found = CHARACTER_CARDS.find((item) => item.id === id);
  if (!found) throw new Error(`Missing test card: ${id}`);
  return found;
};

describe("game catalog", () => {
  it("contains exactly 72 unique character cards", () => {
    expect(CHARACTER_CARDS).toHaveLength(72);
    expect(new Set(CHARACTER_CARDS.map((item) => item.id)).size).toBe(72);
  });

  it("contains the five initial rules", () => {
    expect(RULE_CARDS.map((rule) => rule.id)).toEqual([
      "R001", "R002", "R003", "R004", "R005",
    ]);
  });
});

describe("evaluatePlay", () => {
  it("accepts a pink card under R001", () => {
    expect(evaluatePlay(RULE_CARDS[0], [], [card("CAT_PINK_01")]).accepted).toBe(true);
    expect(evaluatePlay(RULE_CARDS[0], [], [card("CAT_BLUE_01")]).accepted).toBe(false);
  });

  it("checks every card in a multi-card play", () => {
    const result = evaluatePlay(RULE_CARDS[2], [], [
      card("CAT_PINK_01"),
      card("FROG_BLUE_03"),
    ]);
    expect(result.accepted).toBe(true);
  });

  it("checks a multi-card play sequentially against the previous card", () => {
    const result = evaluatePlay(RULE_CARDS[3], [card("CAT_PINK_01")], [
      card("RABBIT_BLUE_02"),
      card("FOX_GOLD_02"),
    ]);
    expect(result.accepted).toBe(false);
    expect(result.failedAt).toBe(1);
  });

  it("accepts only cats or rabbits under R005", () => {
    expect(evaluatePlay(RULE_CARDS[4], [], [card("CAT_PINK_01")]).accepted).toBe(true);
    expect(evaluatePlay(RULE_CARDS[4], [], [card("FOX_PINK_01")]).accepted).toBe(false);
  });

  it("fails closed for an unknown condition type", () => {
    const unknownRule = { ...RULE_CARDS[0], conditionType: "not_implemented" };
    expect(evaluatePlay(unknownRule, [], [card("CAT_PINK_01")]).accepted).toBe(false);
  });
});
