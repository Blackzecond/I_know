import type { GameParticipant, OfflineRoundState, SetupRoundOptions } from "./setup";
import { setupOfflineRound } from "./setup";
import { getNextRuleKeeper } from "./rotation";
import type { RoundScoreSnapshot } from "./scoring";

export interface OfflineRoundRecord {
  roundNumber: number;
  ruleKeeperId: string;
  result: RoundScoreSnapshot;
}

export interface OfflineGameState {
  players: GameParticipant[];
  roundsToPlay: number;
  roundsCompleted: number;
  currentRound: OfflineRoundState;
  totalScores: Record<string, number>;
  roundHistory: OfflineRoundRecord[];
  phase: "playing" | "guessing" | "complete";
}

export interface StartOfflineGameOptions {
  players: GameParticipant[];
  startingRuleKeeperId: string;
  firstSecretRuleId: string;
  random?: () => number;
  handSize?: number;
}

/** Starts a match whose round count equals its player count. */
export function startOfflineGame(options: StartOfflineGameOptions): OfflineGameState {
  const roundOptions: SetupRoundOptions = {
    players: options.players,
    ruleKeeperId: options.startingRuleKeeperId,
    secretRuleId: options.firstSecretRuleId,
    roundNumber: 1,
    random: options.random,
    handSize: options.handSize,
  };
  const currentRound = setupOfflineRound(roundOptions);

  return {
    players: currentRound.players,
    roundsToPlay: currentRound.players.length,
    roundsCompleted: 0,
    currentRound,
    totalScores: Object.fromEntries(currentRound.players.map((player) => [player.id, 0])),
    roundHistory: [],
    phase: "playing",
  };
}

/** Stores the latest immutable round state after a game action. */
export function updateOfflineGameRound(
  current: OfflineGameState,
  updatedRound: OfflineRoundState,
): OfflineGameState {
  if (current.phase === "complete") throw new Error("The game has already ended.");
  if (updatedRound.roundNumber !== current.currentRound.roundNumber) {
    throw new Error("The updated round does not belong to this game turn.");
  }
  if (updatedRound.ruleKeeperId !== current.currentRound.ruleKeeperId) {
    throw new Error("The Rule Keeper cannot change during a round.");
  }

  return {
    ...current,
    currentRound: updatedRound,
    phase: updatedRound.phase === "playing" ? "playing"
      : updatedRound.phase === "guessing" ? "guessing"
      : "playing",
  };
}

/**
 * Records a completed round, adds its scores, and starts the next clockwise
 * Rule Keeper round. A draw-pile exhaustion ends the entire match immediately.
 */
export function advanceOfflineGame(
  current: OfflineGameState,
  nextSecretRuleId?: string,
  random: () => number = Math.random,
): OfflineGameState {
  const round = current.currentRound;
  if (current.phase === "complete") throw new Error("The game has already ended.");
  if (round.phase !== "complete" || !round.roundScore) {
    throw new Error("The current round must finish its rule-guessing phase first.");
  }

  const roundHistory = [
    ...current.roundHistory,
    {
      roundNumber: round.roundNumber,
      ruleKeeperId: round.ruleKeeperId,
      result: round.roundScore,
    },
  ];
  const totalScores = { ...current.totalScores };
  for (const playerScore of round.roundScore.players) {
    totalScores[playerScore.playerId] =
      (totalScores[playerScore.playerId] ?? 0) + playerScore.points;
  }

  const roundsCompleted = current.roundsCompleted + 1;
  if (round.endReason === "draw_pile_exhausted" || roundsCompleted >= current.roundsToPlay) {
    return {
      ...current,
      roundsCompleted,
      totalScores,
      roundHistory,
      phase: "complete",
    };
  }

  if (!nextSecretRuleId) {
    throw new Error("A secret rule must be selected before the next round starts.");
  }

  const nextKeeper = getNextRuleKeeper(current.players, round.ruleKeeperId);
  if (!nextKeeper) throw new Error("Could not find the next Rule Keeper.");

  const currentRound = setupOfflineRound({
    players: current.players,
    ruleKeeperId: nextKeeper.id,
    secretRuleId: nextSecretRuleId,
    roundNumber: roundsCompleted + 1,
    random,
  });

  return {
    ...current,
    roundsCompleted,
    currentRound,
    totalScores,
    roundHistory,
    phase: "playing",
  };
}

/** Allows the table to stop a match before all scheduled rounds are played. */
export function endOfflineGameEarly(current: OfflineGameState): OfflineGameState {
  if (current.phase === "complete") return current;
  return { ...current, phase: "complete" };
}
