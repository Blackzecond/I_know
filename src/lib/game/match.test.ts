import { describe, expect, it } from "vitest";
import { advanceOfflineGame, endOfflineGameEarly, startOfflineGame, updateOfflineGameRound } from "./match";
import { calculateRoundScores } from "./scoring";
import type { GameParticipant } from "./setup";

const players: GameParticipant[] = [
  { id: "p1", displayName: "One", seatOrder: 1 },
  { id: "p2", displayName: "Two", seatOrder: 2 },
  { id: "p3", displayName: "Three", seatOrder: 3 },
];
const fixedRandom = () => 0.42;

function completedRound(
  game: ReturnType<typeof startOfflineGame>,
  endReason: "player_empty_hand" | "draw_pile_exhausted" = "player_empty_hand",
) {
  const round = game.currentRound;
  return {
    ...round,
    phase: "complete" as const,
    endReason,
    roundScore: calculateRoundScores(round.players, round.hands, round.ruleKeeperId, endReason),
  };
}

describe("offline match flow", () => {
  it("plays one round per player and rotates the Rule Keeper clockwise", () => {
    const game = startOfflineGame({
      players,
      startingRuleKeeperId: "p1",
      firstSecretRuleId: "R001",
      random: fixedRandom,
      handSize: 1,
    });
    expect(game.roundsToPlay).toBe(3);

    const firstCompleted = updateOfflineGameRound(game, completedRound(game));
    const second = advanceOfflineGame(firstCompleted, "R002", fixedRandom);
    expect(second.roundsCompleted).toBe(1);
    expect(second.currentRound.roundNumber).toBe(2);
    expect(second.currentRound.ruleKeeperId).toBe("p2");
    expect(second.currentRound.hands.p2).toHaveLength(0);
    expect(second.currentRound.hands.p1).toHaveLength(1);

    const secondCompleted = updateOfflineGameRound(second, completedRound(second));
    const third = advanceOfflineGame(secondCompleted, "R003", fixedRandom);
    expect(third.currentRound.ruleKeeperId).toBe("p3");

    const thirdCompleted = updateOfflineGameRound(third, completedRound(third));
    const finished = advanceOfflineGame(thirdCompleted);
    expect(finished.phase).toBe("complete");
    expect(finished.roundsCompleted).toBe(3);
    expect(finished.roundHistory).toHaveLength(3);
  });

  it("ends the whole match immediately after a draw-pile exhaustion round", () => {
    const game = startOfflineGame({
      players,
      startingRuleKeeperId: "p1",
      firstSecretRuleId: "R001",
      random: fixedRandom,
    });
    const updated = updateOfflineGameRound(game, completedRound(game, "draw_pile_exhausted"));
    const finished = advanceOfflineGame(updated);

    expect(finished.phase).toBe("complete");
    expect(finished.roundsCompleted).toBe(1);
    expect(finished.roundHistory).toHaveLength(1);
  });

  it("can be ended early without counting an unfinished round", () => {
    const game = startOfflineGame({
      players,
      startingRuleKeeperId: "p1",
      firstSecretRuleId: "R001",
      random: fixedRandom,
    });
    const ended = endOfflineGameEarly(game);
    expect(ended.phase).toBe("complete");
    expect(ended.roundsCompleted).toBe(0);
    expect(ended.roundHistory).toHaveLength(0);
  });

  it("keeps the score from a round that was completed before ending early", () => {
    const game = startOfflineGame({
      players,
      startingRuleKeeperId: "p1",
      firstSecretRuleId: "R001",
      random: fixedRandom,
    });
    const updated = updateOfflineGameRound(game, completedRound(game));
    const ended = endOfflineGameEarly(updated);

    expect(ended.phase).toBe("complete");
    expect(ended.roundsCompleted).toBe(1);
    expect(ended.roundHistory).toHaveLength(1);
    expect(Object.values(ended.totalScores).some((score) => score !== 0)).toBe(true);
  });

  it("requires the next secret rule when another round remains", () => {
    const game = startOfflineGame({
      players,
      startingRuleKeeperId: "p1",
      firstSecretRuleId: "R001",
      random: fixedRandom,
    });
    const updated = updateOfflineGameRound(game, completedRound(game));
    expect(() => advanceOfflineGame(updated)).toThrow(/secret rule/);
  });

  it("supports a complete clockwise keeper cycle for every player count from three to seven", () => {
    for (const playerCount of [3, 4, 5, 6, 7]) {
      const roster = Array.from({ length: playerCount }, (_, index) => ({
        id: `seat-${index + 1}`,
        displayName: `Seat ${index + 1}`,
        seatOrder: index + 1,
      }));
      let game = startOfflineGame({
        players: roster,
        startingRuleKeeperId: roster[playerCount - 1].id,
        firstSecretRuleId: "R001",
        random: fixedRandom,
        handSize: 1,
      });

      expect(game.roundsToPlay).toBe(playerCount);
      expect(game.currentRound.currentPlayerId).toBe(roster[0].id);

      for (let roundIndex = 0; roundIndex < playerCount; roundIndex += 1) {
        const expectedKeeper = roster[(playerCount - 1 + roundIndex) % playerCount].id;
        expect(game.currentRound.ruleKeeperId).toBe(expectedKeeper);
        const updated = updateOfflineGameRound(game, completedRound(game));
        game = advanceOfflineGame(
          updated,
          roundIndex + 1 < playerCount ? "R002" : undefined,
          fixedRandom,
        );
      }

      expect(game.phase).toBe("complete");
      expect(game.roundsCompleted).toBe(playerCount);
      expect(game.roundHistory.map((round) => round.ruleKeeperId))
        .toEqual(Array.from({ length: playerCount }, (_, index) =>
          roster[(playerCount - 1 + index) % playerCount].id,
        ));
    }
  });

  it("rejects a round update that changes the Rule Keeper or round number", () => {
    const game = startOfflineGame({
      players,
      startingRuleKeeperId: "p1",
      firstSecretRuleId: "R001",
      random: fixedRandom,
    });

    expect(() => updateOfflineGameRound(game, {
      ...game.currentRound,
      ruleKeeperId: "p2",
    })).toThrow(/Rule Keeper cannot change/);

    expect(() => updateOfflineGameRound(game, {
      ...game.currentRound,
      roundNumber: 2,
    })).toThrow(/does not belong/);
  });

});
