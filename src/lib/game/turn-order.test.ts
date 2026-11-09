import { describe, expect, it } from "vitest";
import { getNextTurnPlayer } from "./turn-order";
import type { GameParticipant } from "./setup";

const players: GameParticipant[] = [
  { id: "p1", displayName: "One", seatOrder: 1 },
  { id: "p2", displayName: "Two", seatOrder: 2 },
  { id: "keeper", displayName: "Keeper", seatOrder: 3 },
  { id: "p4", displayName: "Four", seatOrder: 4 },
];

describe("getNextTurnPlayer", () => {
  it("advances clockwise and skips the Rule Keeper", () => {
    expect(getNextTurnPlayer(players, "p2", "keeper").id).toBe("p4");
    expect(getNextTurnPlayer(players, "p4", "keeper").id).toBe("p1");
  });

  it("rejects a current player who is not active", () => {
    expect(() => getNextTurnPlayer(players, "keeper", "keeper")).toThrow(/not an active player/);
  });

  it("does not mutate the player roster", () => {
    const original = players.map((player) => player.id);
    getNextTurnPlayer(players, "p1", "keeper");
    expect(players.map((player) => player.id)).toEqual(original);
  });
});
