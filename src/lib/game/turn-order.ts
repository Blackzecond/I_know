import type { GameParticipant } from "./setup";

/** Returns the next active player clockwise, never assigning a turn to the Rule Keeper. */
export function getNextTurnPlayer(
  players: GameParticipant[],
  currentPlayerId: string,
  ruleKeeperId: string,
): GameParticipant {
  const activePlayers = [...players]
    .filter((player) => player.id !== ruleKeeperId)
    .sort((a, b) => a.seatOrder - b.seatOrder);

  if (activePlayers.length < 2) {
    throw new Error("At least two active players are required.");
  }

  const currentIndex = activePlayers.findIndex((player) => player.id === currentPlayerId);
  if (currentIndex < 0) {
    throw new Error("Current player is not an active player in this round.");
  }

  return activePlayers[(currentIndex + 1) % activePlayers.length];
}
