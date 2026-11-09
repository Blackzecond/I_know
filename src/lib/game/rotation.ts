export interface SeatedPlayer {
  id: string;
  seatOrder: number;
}

/**
 * Selects the next Rule Keeper one seat clockwise (to the current
 * keeper's left). Players are sorted by seat order, and rotation wraps.
 */
export function getNextRuleKeeper(
  players: SeatedPlayer[],
  currentKeeperId: string,
): SeatedPlayer | null {
  if (players.length === 0) return null;

  const ordered = [...players].sort((a, b) => a.seatOrder - b.seatOrder);
  const currentIndex = ordered.findIndex((player) => player.id === currentKeeperId);

  if (currentIndex === -1) return null;

  return ordered[(currentIndex + 1) % ordered.length];
}
