import { describe, expect, it } from "vitest";
import { CHARACTER_CARDS } from "./catalog";
import { exchangeWholeHand, guessRoundRule, playCards } from "./actions";
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

  it("plays a valid card and enters the pending-guess phase when the hand is empty", () => {
    const game = gameWithHand("R001", ["CAT_PINK_02"]);
    const result = playCards(game, "p2", ["CAT_PINK_02"]);
    expect(result.accepted).toBe(true);
    expect(result.state.tableCards.at(-1)?.id).toBe("CAT_PINK_02");
    expect(result.state.hands.p2).toHaveLength(0);
    expect(result.state.phase).toBe("guessing");
    expect(result.state.pendingGuesserId).toBe("p2");
  });

  it("does not partially play a multi-card submission", () => {
    const game = gameWithHand("R001", ["CAT_PINK_02", "CAT_BLUE_01"]);
    const result = playCards(game, "p2", ["CAT_PINK_02", "CAT_BLUE_01"]);
    expect(result.accepted).toBe(false);
    expect(result.state.hands.p2).toHaveLength(2);
    expect(result.state.tableCards).toHaveLength(1);
    expect(result.state.currentPlayerId).toBe("p3");
  });
});

describe("exchangeWholeHand", () => {
  it("discards an entirely unplayable hand and draws one fewer card", () => {
    const game = gameWithHand("R001", ["CAT_BLUE_01", "CAT_GOLD_02"], ["FOX_PINK_03", "FOX_BLUE_04"]);
    const result = exchangeWholeHand(game, "p2");
    expect(result.reason).toBe("no_playable_cards");
    expect(result.state.discardPile.map((card) => card.id)).toEqual(["CAT_BLUE_01", "CAT_GOLD_02"]);
    expect(result.state.hands.p2.map((card) => card.id)).toEqual(["FOX_PINK_03"]);
    expect(result.state.currentPlayerId).toBe("p3");
  });

  it("requires the Rule Keeper to choose a playable card, then returns the rest and draws one", () => {
    const game = gameWithHand("R001", ["CAT_PINK_02", "CAT_BLUE_01"], ["FOX_PINK_03"]);
    const pending = exchangeWholeHand(game, "p2");
    expect(pending.reason).toBe("keeper_selection_required");
    expect(pending.playableCardIds).toEqual(["CAT_PINK_02"]);
    const result = exchangeWholeHand(game, "p2", "CAT_PINK_02");
    expect(result.state.tableCards.at(-1)?.id).toBe("CAT_PINK_02");
    expect(result.state.hands.p2.map((card) => card.id)).toEqual(["CAT_BLUE_01", "FOX_PINK_03"]);
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

  it("ends the game when the draw pile is exhausted during an exchange", () => {
    const game = gameWithHand("R001", ["CAT_BLUE_01", "CAT_GOLD_02"]);
    game.drawPile = [];
    const result = exchangeWholeHand(game, "p2");

    expect(result.state.discardPile).toHaveLength(2);
    expect(result.state.hands.p2).toHaveLength(0);
    expect(result.state.phase).toBe("guessing");
    expect(result.state.endReason).toBe("draw_pile_exhausted");
    expect(result.state.pendingGuesserId).toBe("p2");
  });

  it("still draws a replacement when the only playable card is the player's last card", () => {
    const game = gameWithHand("R001", ["CAT_PINK_02"], ["FOX_PINK_03"]);
    const result = exchangeWholeHand(game, "p2", "CAT_PINK_02");

    expect(result.state.hands.p2.map((card) => card.id)).toEqual(["FOX_PINK_03"]);
    expect(result.state.phase).toBe("playing");
  });

  it("ends by draw-pile exhaustion if a playable last card cannot be replaced", () => {
    const game = gameWithHand("R001", ["CAT_PINK_02"]);
    game.drawPile = [];
    const result = exchangeWholeHand(game, "p2", "CAT_PINK_02");

    expect(result.state.hands.p2).toHaveLength(0);
    expect(result.state.phase).toBe("guessing");
    expect(result.state.endReason).toBe("draw_pile_exhausted");
  });
});


describe("guessRoundRule", () => {
  it("passes a wrong guess clockwise and awards the bonus to the correct guesser", () => {
    const game = gameWithHand("R001", ["CAT_PINK_02"]);
    const ended = playCards(game, "p2", ["CAT_PINK_02"], fixedRandom).state;
    const wrongChoice = ended.ruleGuessState!.choices.find((rule) => rule.id !== "R001")!;

    const wrong = guessRoundRule(ended, "p2", wrongChoice.id);
    expect(wrong.correct).toBe(false);
    expect(wrong.state.pendingGuesserId).toBe("p3");

    const correct = guessRoundRule(wrong.state, "p3", "R001");
    expect(correct.correct).toBe(true);
    expect(correct.state.phase).toBe("complete");
    expect(correct.state.roundScore?.players.find((player) => player.playerId === "p3")?.points)
      .toBe(1);
  });
});
