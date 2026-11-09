import { describe, expect, it } from "vitest";
import { getNextRuleKeeper } from "./rotation";

const seats = [
  { id: "player-c", seatOrder: 2 },
  { id: "player-a", seatOrder: 0 },
  { id: "player-b", seatOrder: 1 },
];

describe("getNextRuleKeeper", () => {
  it("passes the role to the next seat clockwise", () => {
    expect(getNextRuleKeeper(seats, "player-a")?.id).toBe("player-b");
    expect(getNextRuleKeeper(seats, "player-b")?.id).toBe("player-c");
  });

  it("wraps from the last seat back to the first", () => {
    expect(getNextRuleKeeper(seats, "player-c")?.id).toBe("player-a");
  });

  it("returns null when there are no seated players", () => {
    expect(getNextRuleKeeper([], "player-a")).toBeNull();
  });

  it("returns null when the current keeper is not seated", () => {
    expect(getNextRuleKeeper(seats, "missing") ).toBeNull();
  });
});
