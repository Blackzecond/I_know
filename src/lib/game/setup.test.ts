import { describe, expect, it } from "vitest";
import { CHARACTER_CARDS } from "./catalog";
import { evaluatePlay } from "./rule-engine";
import { setupOfflineRound, type GameParticipant } from "./setup";

const players: GameParticipant[] = [
  { id: "p1", displayName: "One", seatOrder: 1 },
  { id: "p2", displayName: "Two", seatOrder: 2 },
  { id: "p3", displayName: "Three", seatOrder: 3 },
  { id: "p4", displayName: "Four", seatOrder: 4 },
];
const fixedRandom = () => 0.42;

describe("setupOfflineRound", () => {
  it("deals seven cards to everyone except the Rule Keeper", () => {
    const game = setupOfflineRound({ players, ruleKeeperId: "p1", secretRuleId: "R001", random: fixedRandom });
    expect(game.hands.p1).toHaveLength(0);
    expect(game.hands.p2).toHaveLength(7);
    expect(game.hands.p3).toHaveLength(7);
    expect(game.hands.p4).toHaveLength(7);
    expect(game.tableCards).toEqual([game.clueCard]);
    expect(game.currentPlayerId).toBe("p2");
    expect(game.clueCard.color).toBe("pink");
  });

  it("keeps every card in exactly one zone", () => {
    const game = setupOfflineRound({ players, ruleKeeperId: "p3", secretRuleId: "R003", random: fixedRandom });
    const allCards = [game.clueCard, ...game.drawPile, ...game.discardPile, ...Object.values(game.hands).flat()];
    expect(allCards).toHaveLength(CHARACTER_CARDS.length);
    expect(new Set(allCards.map((card) => card.id)).size).toBe(CHARACTER_CARDS.length);
  });

  it("starts with the player to the Rule Keeper's left, wrapping around", () => {
    const game = setupOfflineRound({ players, ruleKeeperId: "p4", secretRuleId: "R002", random: fixedRandom });
    expect(game.currentPlayerId).toBe("p1");
  });

  it("rejects invalid player counts and unknown rules", () => {
    expect(() => setupOfflineRound({ players: players.slice(0, 2), ruleKeeperId: "p1", secretRuleId: "R001", random: fixedRandom })).toThrow(/3 to 7/);
    expect(() => setupOfflineRound({ players, ruleKeeperId: "p1", secretRuleId: "R999", random: fixedRandom })).toThrow(/Unknown secret rule/);
  });

  it("uses the initial clue card as the previous card for sequence rules", () => {
    const game = setupOfflineRound({
      players,
      ruleKeeperId: "p1",
      secretRuleId: "R004",
      random: fixedRandom,
    });
    const repeatedNumber = CHARACTER_CARDS.find(
      (card) => card.id !== game.clueCard.id && card.number === game.clueCard.number,
    )!;

    expect(evaluatePlay(game.secretRule, [game.clueCard], [repeatedNumber]).accepted).toBe(false);
  });

  it("does not mutate the shared card catalog", () => {
    const before = CHARACTER_CARDS.map((card) => card.id);
    setupOfflineRound({ players, ruleKeeperId: "p1", secretRuleId: "R004", random: fixedRandom });
    expect(CHARACTER_CARDS.map((card) => card.id)).toEqual(before);
  });

  it("rejects duplicate player IDs and seat positions", () => {
    expect(() => setupOfflineRound({
      players: [...players, { ...players[0], displayName: "Duplicate ID", seatOrder: 5 }],
      ruleKeeperId: "p1",
      secretRuleId: "R001",
      random: fixedRandom,
    })).toThrow(/Player IDs must be unique/);

    expect(() => setupOfflineRound({
      players: players.map((player, index) => ({
        ...player,
        seatOrder: index === 3 ? players[0].seatOrder : player.seatOrder,
      })),
      ruleKeeperId: "p1",
      secretRuleId: "R001",
      random: fixedRandom,
    })).toThrow(/Seat orders must be unique/);
  });

  it("rejects a keeper outside the roster and invalid hand sizes", () => {
    expect(() => setupOfflineRound({
      players,
      ruleKeeperId: "missing",
      secretRuleId: "R001",
      random: fixedRandom,
    })).toThrow(/Rule Keeper must be seated/);

    expect(() => setupOfflineRound({
      players,
      ruleKeeperId: "p1",
      secretRuleId: "R001",
      handSize: 0,
      random: fixedRandom,
    })).toThrow(/positive integer/);
  });

  it("rejects an invalid random source", () => {
    expect(() => setupOfflineRound({
      players,
      ruleKeeperId: "p1",
      secretRuleId: "R001",
      random: () => 1,
    })).toThrow(/range \[0, 1\)/);
  });

});
