import { CHARACTER_CARDS, RULE_CARDS, type CharacterCard, type RuleCard } from "./catalog";
import type { OfflineGameState } from "./match";
import type { GameParticipant } from "./setup";

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

function isPlayer(value: unknown): value is GameParticipant {
  return isRecord(value)
    && typeof value.id === "string" && value.id.length > 0
    && typeof value.displayName === "string"
    && Number.isInteger(value.seatOrder);
}

function isCharacterCard(value: unknown): value is CharacterCard {
  if (!isRecord(value) || typeof value.id !== "string") return false;
  const canonical = CHARACTER_CARDS.find((card) => card.id === value.id);
  return Boolean(canonical
    && value.animal === canonical.animal
    && value.color === canonical.color
    && value.number === canonical.number
    && value.artKey === canonical.artKey);
}

function isRuleCard(value: unknown): value is RuleCard {
  if (!isRecord(value) || typeof value.id !== "string") return false;
  const canonical = RULE_CARDS.find((rule) => rule.id === value.id);
  return Boolean(canonical
    && value.title === canonical.title
    && value.description === canonical.description
    && value.conditionType === canonical.conditionType);
}

function isCardArray(value: unknown): value is CharacterCard[] {
  return Array.isArray(value) && value.every(isCharacterCard);
}

/** Rejects stale or malformed saves before they can enter the game UI. */
export function parseOfflineSession(raw: string): OfflineSessionData | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || value.version !== 1 || !isRecord(value.game)) return null;

    const game = value.game;
    const players = game.players;
    const round = game.currentRound;
    if (!Array.isArray(players) || players.length < 3 || players.length > 7
      || !players.every(isPlayer)) return null;
    const roster = players as GameParticipant[];
    const playerIds = roster.map((player) => player.id);
    if (new Set(playerIds).size !== roster.length
      || new Set(roster.map((player) => player.seatOrder)).size !== roster.length) return null;

    if (!isRecord(round) || !isRecord(round.hands)) return null;
    if (!playerIds.includes(String(round.ruleKeeperId))
      || !playerIds.includes(String(round.currentPlayerId))
      || round.currentPlayerId === round.ruleKeeperId) return null;
    if (!["playing", "guessing", "complete"].includes(String(round.phase))) return null;
    if (!Number.isInteger(round.roundNumber) || (round.roundNumber as number) < 1) return null;
    if (!Array.isArray(round.players) || !round.players.every(isPlayer)
      || round.players.length !== roster.length
      || !roster.every((player) => round.players.some((roundPlayer) => isPlayer(roundPlayer)
        && roundPlayer.id === player.id && roundPlayer.seatOrder === player.seatOrder))) return null;

    if (!isRuleCard(round.secretRule) || !isCharacterCard(round.clueCard)) return null;
    if (!isCardArray(round.drawPile) || !isCardArray(round.discardPile)
      || !isCardArray(round.tableCards)) return null;
    if (!roster.every((player) => isCardArray(round.hands[player.id]))) return null;
    if (round.tableCards.length === 0 || round.tableCards[0].id !== round.clueCard.id) return null;

    const allCards = [
      ...Object.values(round.hands).flatMap((hand) => Array.isArray(hand) ? hand : []),
      ...round.drawPile,
      ...round.discardPile,
      ...round.tableCards,
    ];
    const cardIds = allCards.map((card) => card.id);
    if (allCards.length !== CHARACTER_CARDS.length
      || new Set(cardIds).size !== CHARACTER_CARDS.length) return null;

    if (!Number.isInteger(game.roundsToPlay) || game.roundsToPlay !== roster.length
      || !Number.isInteger(game.roundsCompleted) || (game.roundsCompleted as number) < 0
      || (game.roundsCompleted as number) > (game.roundsToPlay as number)
      || !Number.isInteger(game.handSize) || (game.handSize as number) < 1) return null;
    if (!isRecord(game.totalScores) || !Array.isArray(game.roundHistory)
      || !["playing", "guessing", "round_complete", "complete"].includes(String(game.phase))) return null;
    if (!roster.every((player) => Number.isFinite(game.totalScores[player.id]))) return null;

    const keeperPlayableIds = value.keeperPlayableIds;
    if (keeperPlayableIds !== null && keeperPlayableIds !== undefined
      && (!isStringArray(keeperPlayableIds)
        || !keeperPlayableIds.every((id) => CHARACTER_CARDS.some((card) => card.id === id)))) return null;
    if (value.handoffTo !== null && value.handoffTo !== undefined
      && (typeof value.handoffTo !== "string" || !playerIds.includes(value.handoffTo))) return null;
    if (value.keeperBriefing !== undefined && typeof value.keeperBriefing !== "boolean") return null;
    if (value.choosingNextSecret !== undefined && typeof value.choosingNextSecret !== "boolean") return null;
    if (value.nextSecretRule !== undefined
      && (typeof value.nextSecretRule !== "string" || !RULE_CARDS.some((rule) => rule.id === value.nextSecretRule))) return null;
    if (value.notice !== undefined && typeof value.notice !== "string") return null;
    if (value.selectedCards !== undefined && !isStringArray(value.selectedCards)) return null;

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
