import { describe, expect, it } from "vitest";
import { CHARACTER_CARDS } from "./catalog";
import { exchangeWholeHand, playCards } from "./actions";
import { setupOfflineRound, type GameParticipant, type OfflineRoundState } from "./setup";

const players: GameParticipant[] = [
  { id: "p1", displayName: "One", seatOrder: 1 },
  { id: "p2", displayName: "Two", seatOrder: 2 },
  { id: "p3", displayName: "Three", seatOrder: 3 },
  { id: "p4", displayName: "Four", seatOrder: 4 },
];
const fixedRandom = () => 0.42;

function gameWithHand(
  ruleId: string,
  hand: string[],
  drawPile: string[] = [],
): OfflineRoundState {
  const game = setupOfflineRound({
    players,
    ruleKeeperId: "p1",
    secretRuleId: ruleId,
    random: fixedRandom,
  });
  const cardsById = new Map(CHARACTER_CARDS.map((card) => [card.id, card]));
  const reserved = new Set([game.clueCard.id, ...drawPile]);
  const requested = hand.map((id) => cardsById.get(id));
  if (requested.some((card) => !card)) throw new Error("Test card missing.");
  for (const id of hand) reserved.add(id);
  const rest = CHARACTER_CARDS.filter((card) => !reserved.has(card.id));
  return {
    ...game,
    hands: {
      p1: [],
      p2: requested as NonNullable<(typeof requested)[number]>[],
      p3: [],
      p4: [],
    },
    drawPile: drawPile.map((id) => cardsById.get(id)!).concat(rest),
    discardPile: [],
    tableCards: [game.clueCard],
    currentPlayerId: "p2",
  };
}

describe("playCards", () => {
  it("returns a failed play to the hand and ends the turn", () => {
    const game = gameWithHand("R001", ["CAT_BLUE_01"]);
    const result = playCards(game, "p2", ["CAT_BLUE_01"]);
    expect(result.accepted).toBe(false);
    expect(result.state.hands.p2.map((card) => card.id)).toEqual(["CAT_BLUE_01"]);
    expect(result.state.currentPlayerId).toBe("p3");
    expect(result.state.tableCards).toEqual(game.tableCards);
  });

  it("plays a valid card and advances clockwise", () => {
    const game = gameWithHand("R001", ["CAT_PINK_01"]);
    const result = playCards(game, "p2", ["CAT_PINK_01"]);
    expect(result.accepted).toBe(true);
    expect(result.state.tableCards.at(-1)?.id).toBe("CAT_PINK_01");
    expect(result.state.hands.p2).toHaveLength(0);
    expect(result.state.phase).toBe("guessing");
    expect(result.state.pendingGuesserId).toBe("p2");
  });

  it("does not partially play a multi-card submission", () => {
    const game = gameWithHand("R001", ["CAT_PINK_01", "CAT_BLUE_01"]);
    const result = playCards(game, "p2", ["CAT_PINK_01", "CAT_BLUE_01"]);
    expect(result.accepted).toBe(false);
    expect(result.state.hands.p2).toHaveLength(2);
    expect(result.state.tableCards).toHaveLength(1);
    expect(result.state.currentPlayerId).toBe("p3");
  });
});

describe("exchangeWholeHand", () => {
  it("discards an entirely unplayable hand and draws one fewer card", () => {
    const game = gameWithHand("R001", ["CAT_BLUE_01", "CAT_GOLD_02"], ["DOG_PINK_03", "FOX_BLUE_04"]);
    const result = exchangeWholeHand(game, "p2");
    expect(result.reason).toBe("no_playable_cards");
    expect(result.state.discardPile.map((card) => card.id)).toEqual(["CAT_BLUE_01", "CAT_GOLD_02"]);
    expect(result.state.hands.p2.map((card) => card.id)).toEqual(["DOG_PINK_03"]);
    expect(result.state.currentPlayerId).toBe("p3");
  });

  it("requires the Rule Keeper to choose a playable card, then returns the rest and draws one", () => {
    const game = gameWithHand("R001", ["CAT_PINK_01", "CAT_BLUE_01"], ["DOG_PINK_03"]);
    const pending = exchangeWholeHand(game, "p2");
    expect(pending.reason).toBe("keeper_selection_required");
    expect(pending.playableCardIds).toEqual(["CAT_PINK_01"]);
    const result = exchangeWholeHand(game, "p2", "CAT_PINK_01");
    expect(result.state.tableCards.at(-1)?.id).toBe("CAT_PINK_01");
    expect(result.state.hands.p2.map((card) => card.id)).toEqual(["CAT_BLUE_01", "DOG_PINK_03"]);
    expect(result.state.currentPlayerId).toBe("p3");
    expect(result.state.discardPile).toHaveLength(0);
  });

  it("handles a one-card unplayable hand without drawing", () => {
    const game = gameWithHand("R001", ["CAT_BLUE_01"]);
    const result = exchangeWholeHand(game, "p2");
    expect(result.state.hands.p2).toHaveLength(0);
    expect(result.state.discardPile.map((card) => card.id)).toEqual(["CAT_BLUE_01"]);
    expect(result.state.phase).toBe("guessing");
    expect(result.state.pendingGuesserId).toBe("p2");
  });

  it("does not mutate the input state when an exchange cannot draw", () => {
    const game = gameWithHand("R001", ["CAT_BLUE_01", "CAT_GOLD_02"]);
    const before = game.hands.p2.map((card) => card.id);
    expect(() => exchangeWholeHand(game, "p2")).toThrow(/Not enough cards/);
    expect(game.hands.p2.map((card) => card.id)).toEqual(before);
  });
});
