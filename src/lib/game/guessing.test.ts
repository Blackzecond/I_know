import { describe, expect, it } from "vitest";
import { RULE_CARDS } from "./catalog";
import { addRuleCardToGuess, startRuleGuessing, submitRuleGuess } from "./guessing";

describe("rule guessing", () => {
  it("starts with the secret rule and two distinct decoys", () => {
    const state = startRuleGuessing("R001", ["p2", "p3", "p4"], "p3", () => 0);

    expect(state.choices).toHaveLength(3);
    expect(state.choices.map((rule) => rule.id)).toContain("R001");
    expect(new Set(state.choices.map((rule) => rule.id)).size).toBe(3);
    expect(state.guesserOrder).toEqual(["p3", "p4", "p2"]);
    expect(state.currentGuesserIndex).toBe(0);
  });

  it("adds an unused rule after a wrong guess and passes clockwise", () => {
    const state = startRuleGuessing("R001", ["p2", "p3", "p4"], "p2", () => 0);
    const wrongRule = state.choices.find((rule) => rule.id !== "R001")!;
    const result = submitRuleGuess(state, "p2", wrongRule.id);

    expect(result.correct).toBe(false);
    expect(result.state.choices).toHaveLength(2);
    expect(result.state.choices.map((rule) => rule.id)).not.toContain(wrongRule.id);
    expect(result.state.awaitingKeeperChoice).toBe(true);
    expect(result.state.currentGuesserIndex).toBe(1);

    const replacementId = result.state.unusedRuleIds[0];
    const replenished = addRuleCardToGuess(result.state, replacementId);
    expect(replenished.choices).toHaveLength(3);
    expect(replenished.awaitingKeeperChoice).toBe(false);
  });

  it("awards success to the player who selects the secret rule", () => {
    const state = startRuleGuessing("R003", ["p2", "p3"], "p2", () => 0);
    const result = submitRuleGuess(state, "p2", "R003");

    expect(result.correct).toBe(true);
    expect(result.state.isComplete).toBe(true);
    expect(result.state.correctGuesserId).toBe("p2");
  });

  it("rejects guesses out of turn and guesses not shown", () => {
    const state = startRuleGuessing("R001", ["p2", "p3"], "p2", () => 0);
    expect(() => submitRuleGuess(state, "p3", "R001")).toThrow(/guessing turn/);
    expect(() => submitRuleGuess(state, "p2", "R005")).toThrow(/currently displayed/);
  });

  it("can continue with fewer than three options after all decoys are exhausted", () => {
    const twoRuleDeck = RULE_CARDS.slice(0, 3);
    let state = startRuleGuessing("R001", ["p2", "p3"], "p2", () => 0, twoRuleDeck);
    const wrongOne = state.choices.find((rule) => rule.id !== "R001")!;
    state = submitRuleGuess(state, "p2", wrongOne.id, twoRuleDeck).state;
    const wrongTwo = state.choices.find((rule) => rule.id !== "R001")!;
    state = submitRuleGuess(state, "p3", wrongTwo.id, twoRuleDeck).state;

    expect(state.choices.map((rule) => rule.id)).toEqual(["R001"]);
    expect(state.currentGuesserIndex).toBe(0);
  });
});
