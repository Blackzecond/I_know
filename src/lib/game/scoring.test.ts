import { describe, expect, it } from "vitest";
import { CHARACTER_CARDS, type CharacterCard } from "./catalog";
import { awardGuessBonus, calculateMatchStandings, calculateRoundScores } from "./scoring";
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
    const hands: Record<string, CharacterCard[]> = Object.fromEntries(
      sevenPlayers.map((player, index): [string, CharacterCard[]] => [
        player.id,
        cards(index),
      ]),
    );

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

  it("uses the full score ladder for every supported active-player count", () => {
    for (const activeCount of [2, 3, 4, 5, 6]) {
      const roster = Array.from({ length: activeCount + 1 }, (_, index) => ({
        id: `player-${index + 1}`,
        displayName: `Player ${index + 1}`,
        seatOrder: index + 1,
      }));
      const keeperId = roster[roster.length - 1].id;
      const hands: Record<string, CharacterCard[]> = Object.fromEntries(
        roster.map((player, index) => [
          player.id,
          player.id === keeperId ? [] : cards(index),
        ]),
      );

      const result = calculateRoundScores(roster, hands, keeperId, "player_empty_hand");
      const expectedStart = Math.floor(activeCount / 2);
      expect(result.activePlayerCount).toBe(activeCount);
      expect(result.players.filter((score) => !score.isRuleKeeper).map((score) => score.points))
        .toEqual(Array.from({ length: activeCount }, (_, index) => expectedStart - index));
      expect(result.players.find((score) => score.isRuleKeeper)?.points).toBe(0);
    }
  });

  it("uses competition ranking after a tie in the middle of the order", () => {
    const result = calculateRoundScores(
      players,
      { p1: [], p2: cards(1), p3: cards(2), p4: cards(2) },
      "p1",
      "draw_pile_exhausted",
    );

    expect(result.players.filter((score) => !score.isRuleKeeper).map((score) => score.rank))
      .toEqual([1, 2, 2]);
    expect(result.players.filter((score) => !score.isRuleKeeper).map((score) => score.points))
      .toEqual([1, 0, 0]);
  });

  it("does not mutate the source score snapshot when awarding a guess bonus", () => {
    const snapshot = calculateRoundScores(
      players,
      { p1: [], p2: cards(1), p3: cards(2), p4: cards(3) },
      "p1",
      "player_empty_hand",
    );
    const originalPoints = snapshot.players.map((score) => score.points);
    const updated = awardGuessBonus(snapshot, "p4");

    expect(snapshot.players.map((score) => score.points)).toEqual(originalPoints);
    expect(updated.players.find((score) => score.playerId === "p4")?.points).toBe(0);
  });

  it("ranks final match totals with shared places and competition ranking", () => {
    const standings = calculateMatchStandings(players, { p1: 8, p2: 5, p3: 5, p4: 1 });
    expect(standings).toEqual([
      { playerId: "p1", points: 8, rank: 1 },
      { playerId: "p2", points: 5, rank: 2 },
      { playerId: "p3", points: 5, rank: 2 },
      { playerId: "p4", points: 1, rank: 4 },
    ]);
  });

  it("uses seat order only to make tied standings display deterministic", () => {
    const standings = calculateMatchStandings(players, { p1: 3, p2: 3, p3: 3, p4: 3 });
    expect(standings.map((standing) => standing.playerId)).toEqual(["p1", "p2", "p3", "p4"]);
    expect(standings.map((standing) => standing.rank)).toEqual([1, 1, 1, 1]);
  });

});
