import { CHARACTER_CARDS, RULE_CARDS, type CharacterCard, type RuleCard } from "./catalog";
import { evaluatePlay } from "./rule-engine";
import type { RoundScoreSnapshot } from "./scoring";
import type { RuleGuessState } from "./guessing";

export interface GameParticipant {
  id: string;
  displayName: string;
  seatOrder: number;
}

export interface OfflineRoundState {
  roundNumber: number;
  players: GameParticipant[];
  ruleKeeperId: string;
  secretRule: RuleCard;
  clueCard: CharacterCard;
  hands: Record<string, CharacterCard[]>;
  drawPile: CharacterCard[];
  discardPile: CharacterCard[];
  tableCards: CharacterCard[];
  currentPlayerId: string;
  phase: "playing" | "guessing" | "complete";
  pendingGuesserId?: string;
  endReason?: RoundScoreSnapshot["endReason"];
  roundScore?: RoundScoreSnapshot;
  ruleGuessState?: RuleGuessState;
}

export interface SetupRoundOptions {
  players: GameParticipant[];
  ruleKeeperId: string;
  secretRuleId: string;
  roundNumber?: number;
  random?: () => number;
  handSize?: number;
}

function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const sample = random();
    if (sample < 0 || sample >= 1) {
      throw new RangeError("random() must return a value in the range [0, 1).");
    }
    const swapIndex = Math.floor(sample * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function orderedPlayers(players: GameParticipant[]): GameParticipant[] {
  return [...players].sort((a, b) => a.seatOrder - b.seatOrder);
}

function nextPlayer(players: GameParticipant[], playerId: string): GameParticipant {
  const ordered = orderedPlayers(players);
  const index = ordered.findIndex((player) => player.id === playerId);
  if (index < 0) throw new Error("Player is not seated in this game.");
  return ordered[(index + 1) % ordered.length];
}

/** Creates a complete local round without network or database dependencies. */
export function setupOfflineRound(options: SetupRoundOptions): OfflineRoundState {
  const {
    players,
    ruleKeeperId,
    secretRuleId,
    roundNumber = 1,
    random = Math.random,
    handSize = 7,
  } = options;

  if (players.length < 3 || players.length > 7) {
    throw new RangeError("A game requires 3 to 7 players.");
  }
  if (new Set(players.map((player) => player.id)).size !== players.length) {
    throw new Error("Player IDs must be unique.");
  }
  if (new Set(players.map((player) => player.seatOrder)).size !== players.length) {
    throw new Error("Seat orders must be unique.");
  }
  if (!players.some((player) => player.id === ruleKeeperId)) {
    throw new Error("Rule Keeper must be seated in this game.");
  }
  if (!Number.isInteger(handSize) || handSize < 1) {
    throw new RangeError("Hand size must be a positive integer.");
  }

  const secretRule = RULE_CARDS.find((rule) => rule.id === secretRuleId);
  if (!secretRule) throw new Error("Unknown secret rule.");

  const shuffledDeck = shuffled(CHARACTER_CARDS, random);
  const clueIndex = shuffledDeck.findIndex(
    (card) => evaluatePlay(secretRule, [], [card]).accepted,
  );
  if (clueIndex < 0) throw new Error("No card in the deck satisfies the secret rule.");

  const [clueCard] = shuffledDeck.splice(clueIndex, 1);
  const drawPile = shuffledDeck;
  const playingOrder = orderedPlayers(players).filter((player) => player.id !== ruleKeeperId);

  if (playingOrder.length * handSize > drawPile.length) {
    throw new Error("Not enough cards to deal the requested starting hands.");
  }

  const hands: Record<string, CharacterCard[]> = Object.fromEntries(
    players.map((player) => [player.id, []]),
  );

  for (let cardIndex = 0; cardIndex < handSize; cardIndex += 1) {
    for (const player of playingOrder) {
      const card = drawPile.shift();
      if (!card) throw new Error("The deck ran out during the initial deal.");
      hands[player.id].push(card);
    }
  }

  const firstPlayer = nextPlayer(players, ruleKeeperId);

  return {
    roundNumber,
    players: orderedPlayers(players),
    ruleKeeperId,
    secretRule,
    clueCard,
    hands,
    drawPile,
    discardPile: [],
    tableCards: [clueCard],
    currentPlayerId: firstPlayer.id,
    phase: "playing",
  };
}
