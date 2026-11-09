import { describe, expect, it } from "vitest";
import { CHARACTER_CARDS } from "./catalog";
import { awardGuessBonus, calculateRoundScores } from "./scoring";
import type { GameParticipant } from "./setup";

const players: GameParticipant[] = [
  { id: "p1", displayName: "One", seatOrder: 1 },
  { id: "p2", displayName: "Two", seatOrder: 2 },
  { id: "p3", displayName: "Three", seatOrder: 3 },
  { id: "p4", displayName: "Four", seatOrder: 4 },
];

const cards = (count: number) => CHARACTER_CARDS.slice(0, count);

describe("calculateRoundScores", () => {
  it("uses active-player scoring and awards tied players the same competition rank", () => {
    const result = calculateRoundScores(
      players,
      { p1: [], p2: cards(2), p3: cards(2), p4: cards(4) },
      "p1",
      "player_empty_hand",
    );

    expect(result.players).toEqual([
      { playerId: "p2", rank: 1, cardsRemaining: 2, points: 1, isRuleKeeper: false },
      { playerId: "p3", rank: 1, cardsRemaining: 2, points: 1, isRuleKeeper: false },
      { playerId: "p4", rank: 3, cardsRemaining: 4, points: -1, isRuleKeeper: false },
      { playerId: "p1", rank: null, cardsRemaining: 0, points: 0, isRuleKeeper: true },
    ]);
  });

  it("uses the correct score ladder for six active players", () => {
    const sevenPlayers = Array.from({ length: 7 }, (_, index) => ({
      id: `p${index + 1}`,
      displayName: `Player ${index + 1}`,
      seatOrder: index + 1,
    }));
    const hands = Object.fromEntries(sevenPlayers.map((player, index) => [
      player.id,
      cards(index),
    ]));

    const result = calculateRoundScores(sevenPlayers, hands, "p7", "draw_pile_exhausted");
    expect(result.players.filter((player) => !player.isRuleKeeper).map((player) => player.points))
      .toEqual([3, 2, 1, 0, -1, -2]);
    expect(result.players.at(-1)?.points).toBe(0);
  });

  it("adds the guessing bonus to the correct player only", () => {
    const snapshot = calculateRoundScores(
      players,
      { p1: [], p2: cards(1), p3: cards(2), p4: cards(3) },
      "p1",
      "player_empty_hand",
    );
    const result = awardGuessBonus(snapshot, "p4");

    expect(result.players.find((player) => player.playerId === "p4")?.points).toBe(0);
    expect(snapshot.players.find((player) => player.playerId === "p4")?.points).toBe(-1);
  });
});
