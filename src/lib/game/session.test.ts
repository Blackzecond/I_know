import { describe, expect, it } from "vitest";
import { startOfflineGame } from "./match";
import { parseOfflineSession } from "./session";

const players = [
  { id: "p1", displayName: "One", seatOrder: 1 },
  { id: "p2", displayName: "Two", seatOrder: 2 },
  { id: "p3", displayName: "Three", seatOrder: 3 },
];

function validSession() {
  return {
    version: 1,
    game: startOfflineGame({
      players,
      startingRuleKeeperId: "p1",
      firstSecretRuleId: "R001",
      random: () => 0.42,
    }),
    selectedCards: ["CAT_PINK_01"],
    keeperPlayableIds: null,
    handoffTo: "p2",
    keeperBriefing: false,
    choosingNextSecret: false,
    nextSecretRule: "R002",
    notice: "ready",
  };
}

describe("parseOfflineSession", () => {
  it("restores a valid saved match and its handoff state", () => {
    const saved = validSession();
    const restored = parseOfflineSession(JSON.stringify(saved));

    expect(restored?.game.currentRound.ruleKeeperId).toBe("p1");
    expect(restored?.selectedCards).toEqual(["CAT_PINK_01"]);
    expect(restored?.handoffTo).toBe("p2");
    expect(restored?.nextSecretRule).toBe("R002");
  });

  it("rejects malformed JSON, unknown versions, and incomplete game state", () => {
    expect(parseOfflineSession("{")).toBeNull();
    expect(parseOfflineSession(JSON.stringify({ ...validSession(), version: 2 }))).toBeNull();
    expect(parseOfflineSession(JSON.stringify({ version: 1, game: {} }))).toBeNull();
  });

  it("rejects a saved session with a keeper outside the roster", () => {
    const saved = validSession();
    saved.game.currentRound.ruleKeeperId = "missing";
    expect(parseOfflineSession(JSON.stringify(saved))).toBeNull();
  });

  it("rejects invalid handoff targets and malformed hand zones", () => {
    const invalidHandoff = validSession();
    invalidHandoff.handoffTo = "missing";
    expect(parseOfflineSession(JSON.stringify(invalidHandoff))).toBeNull();

    const invalidHands = validSession();
    (invalidHands.game.currentRound.hands as Record<string, unknown>).p2 = "not-a-hand";
    expect(parseOfflineSession(JSON.stringify(invalidHands))).toBeNull();
  });

  it("rejects unknown cards and duplicate cards across saved zones", () => {
    const unknownCard = validSession();
    unknownCard.game.currentRound.hands.p2[0] = {
      ...unknownCard.game.currentRound.hands.p2[0],
      id: "UNKNOWN_CARD",
    };
    expect(parseOfflineSession(JSON.stringify(unknownCard))).toBeNull();

    const duplicateCard = validSession();
    duplicateCard.game.currentRound.discardPile.push(
      duplicateCard.game.currentRound.hands.p2[0],
    );
    expect(parseOfflineSession(JSON.stringify(duplicateCard))).toBeNull();
  });

  it("rejects invalid player rosters and non-numeric match totals", () => {
    const duplicateSeat = validSession();
    duplicateSeat.game.players[1].seatOrder = duplicateSeat.game.players[0].seatOrder;
    expect(parseOfflineSession(JSON.stringify(duplicateSeat))).toBeNull();

    const invalidScore = validSession();
    (invalidScore.game.totalScores as Record<string, unknown>).p2 = "many";
    expect(parseOfflineSession(JSON.stringify(invalidScore))).toBeNull();
  });

  it("uses safe defaults for optional UI state fields", () => {
    const saved = validSession() as Record<string, unknown>;
    delete saved.selectedCards;
    delete saved.keeperBriefing;
    delete saved.notice;
    const restored = parseOfflineSession(JSON.stringify(saved));

    expect(restored?.selectedCards).toEqual([]);
    expect(restored?.keeperBriefing).toBe(false);
    expect(restored?.notice).toBe("");
  });
});
