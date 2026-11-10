import type { OfflineGameState } from "./match";

export interface OfflineSessionData {
  version: 1;
  game: OfflineGameState;
  selectedCards: string[];
  keeperPlayableIds: string[] | null;
  handoffTo: string | null;
  keeperBriefing: boolean;
  choosingNextSecret: boolean;
  nextSecretRule: string;
  notice: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

/** Parses and validates the minimum state shape required to safely resume a local match. */
export function parseOfflineSession(raw: string): OfflineSessionData | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || value.version !== 1 || !isRecord(value.game)) return null;

    const game = value.game;
    const players = game.players;
    const round = game.currentRound;
    if (!Array.isArray(players) || players.length < 3 || players.length > 7) return null;
    if (!players.every((player) => isRecord(player)
      && typeof player.id === "string"
      && typeof player.displayName === "string"
      && typeof player.seatOrder === "number")) return null;
    if (!isRecord(round) || !isRecord(round.hands)) return null;
    if (!players.some((player) => isRecord(player) && player.id === round.ruleKeeperId)) return null;
    if (typeof round.currentPlayerId !== "string"
      || !players.some((player) => isRecord(player) && player.id === round.currentPlayerId)) return null;
    if (!["playing", "guessing", "complete"].includes(String(round.phase))) return null;
    if (!Array.isArray(round.drawPile) || !Array.isArray(round.discardPile)
      || !Array.isArray(round.tableCards) || !Array.isArray(round.players)) return null;
    if (!isRecord(round.secretRule) || typeof round.secretRule.id !== "string"
      || !isRecord(round.clueCard) || typeof round.clueCard.id !== "string") return null;
    if (!players.every((player) => isRecord(round.hands)
      && Array.isArray(round.hands[player.id as string]))) return null;
    if (!Number.isInteger(game.roundsToPlay) || game.roundsToPlay !== players.length
      || !Number.isInteger(game.roundsCompleted) || (game.roundsCompleted as number) < 0
      || (game.roundsCompleted as number) > (game.roundsToPlay as number)
      || !Number.isInteger(game.handSize) || (game.handSize as number) < 1) return null;
    if (!isRecord(game.totalScores) || !Array.isArray(game.roundHistory)
      || !["playing", "guessing", "round_complete", "complete"].includes(String(game.phase))) return null;

    const keeperPlayableIds = value.keeperPlayableIds;
    if (keeperPlayableIds !== null && keeperPlayableIds !== undefined && !isStringArray(keeperPlayableIds)) return null;
    if (value.handoffTo !== null && value.handoffTo !== undefined
      && (typeof value.handoffTo !== "string" || !players.some((player) => isRecord(player) && player.id === value.handoffTo))) return null;

    return {
      version: 1,
      game: game as unknown as OfflineGameState,
      selectedCards: isStringArray(value.selectedCards) ? value.selectedCards : [],
      keeperPlayableIds: Array.isArray(keeperPlayableIds) ? keeperPlayableIds as string[] : null,
      handoffTo: typeof value.handoffTo === "string" ? value.handoffTo : null,
      keeperBriefing: value.keeperBriefing === true,
      choosingNextSecret: value.choosingNextSecret === true,
      nextSecretRule: typeof value.nextSecretRule === "string" ? value.nextSecretRule : "R001",
      notice: typeof value.notice === "string" ? value.notice : "",
    };
  } catch {
    return null;
  }
}
