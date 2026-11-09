import type { CharacterCard } from "./catalog";
import { startRuleGuessing, submitRuleGuess } from "./guessing";
import { awardGuessBonus, calculateRoundScores } from "./scoring";
import { evaluatePlay } from "./rule-engine";
import type { OfflineRoundState } from "./setup";
import { getNextTurnPlayer } from "./turn-order";

export interface GameActionResult {
  state: OfflineRoundState;
  accepted: boolean;
  reason?: "rule_failed" | "no_playable_cards" | "keeper_selection_required";
  playableCardIds?: string[];
}

export interface RuleGuessActionResult {
  state: OfflineRoundState;
  correct: boolean;
  guessedRuleId: string;
  guesserId: string;
}

function assertActiveTurn(state: OfflineRoundState, playerId: string): void {
  if (state.phase !== "playing") throw new Error("The round is not accepting turns.");
  if (state.currentPlayerId !== playerId) throw new Error("It is not this player's turn.");
  if (playerId === state.ruleKeeperId) throw new Error("The Rule Keeper does not take turns.");
}

function copyState(state: OfflineRoundState): OfflineRoundState {
  return {
    ...state,
    players: state.players.map((player) => ({ ...player })),
    hands: Object.fromEntries(
      Object.entries(state.hands).map(([id, hand]) => [id, [...hand]]),
    ),
    drawPile: [...state.drawPile],
    discardPile: [...state.discardPile],
    tableCards: [...state.tableCards],
    roundScore: state.roundScore
      ? { ...state.roundScore, players: state.roundScore.players.map((player) => ({ ...player })) }
      : undefined,
    ruleGuessState: state.ruleGuessState
      ? {
          ...state.ruleGuessState,
          choices: [...state.ruleGuessState.choices],
          unusedRuleIds: [...state.ruleGuessState.unusedRuleIds],
          guesserOrder: [...state.ruleGuessState.guesserOrder],
        }
      : undefined,
  };
}

function advanceTurn(state: OfflineRoundState, playerId: string): void {
  state.currentPlayerId = getNextTurnPlayer(
    state.players,
    playerId,
    state.ruleKeeperId,
  ).id;
}

function beginGuessing(
  state: OfflineRoundState,
  endReason: "player_empty_hand" | "draw_pile_exhausted",
  random: () => number,
): void {
  const snapshot = calculateRoundScores(
    state.players,
    state.hands,
    state.ruleKeeperId,
    endReason,
  );
  const activePlayerIds = state.players
    .filter((player) => player.id !== state.ruleKeeperId)
    .sort((a, b) => a.seatOrder - b.seatOrder)
    .map((player) => player.id);

  state.phase = "guessing";
  state.endReason = endReason;
  state.roundScore = snapshot;
  state.pendingGuesserId = snapshot.firstPlacePlayerId;
  state.ruleGuessState = startRuleGuessing(
    state.secretRule.id,
    activePlayerIds,
    snapshot.firstPlacePlayerId,
    random,
  );
}

/** A failed attempted play returns all cards to the hand and ends the turn. */
export function playCards(
  current: OfflineRoundState,
  playerId: string,
  cardIds: string[],
  random: () => number = Math.random,
): GameActionResult {
  assertActiveTurn(current, playerId);
  if (cardIds.length === 0 || new Set(cardIds).size !== cardIds.length) {
    throw new Error("Choose one or more distinct cards from your hand.");
  }

  const hand = current.hands[playerId];
  const selected = cardIds.map((id) => {
    const card = hand.find((candidate) => candidate.id === id);
    if (!card) throw new Error("A selected card is not in this player's hand.");
    return card;
  });

  const next = copyState(current);
  const check = evaluatePlay(current.secretRule, current.tableCards, selected);

  if (!check.accepted) {
    advanceTurn(next, playerId);
    return { state: next, accepted: false, reason: "rule_failed" };
  }

  const selectedIds = new Set(cardIds);
  next.hands[playerId] = next.hands[playerId].filter((card) => !selectedIds.has(card.id));
  next.tableCards.push(...selected);

  if (next.hands[playerId].length === 0) {
    beginGuessing(next, "player_empty_hand", random);
  } else {
    advanceTurn(next, playerId);
  }

  return { state: next, accepted: true };
}

/**
 * The active player submits their whole hand for inspection.
 * No playable cards: discard all and draw handSize - 1 (up to the cards
 * available). A one-card hand therefore empties and wins the round.
 * Playable card found: the keeper plays one, the rest return, and one card
 * is drawn. If the draw pile cannot provide it, the pile-exhaustion ending
 * takes precedence and players are ranked by their resulting hand sizes.
 */
export function exchangeWholeHand(
  current: OfflineRoundState,
  playerId: string,
  keeperSelectedCardId?: string,
  random: () => number = Math.random,
): GameActionResult {
  assertActiveTurn(current, playerId);
  const hand = current.hands[playerId];
  if (hand.length === 0) throw new Error("A player with an empty hand cannot exchange cards.");

  const playableCards = hand.filter(
    (card) => evaluatePlay(current.secretRule, current.tableCards, [card]).accepted,
  );
  const next = copyState(current);

  if (playableCards.length === 0) {
    const requestedDrawCount = Math.max(0, hand.length - 1);
    const actualDrawCount = Math.min(requestedDrawCount, next.drawPile.length);

    next.discardPile.push(...next.hands[playerId]);
    next.hands[playerId] = next.drawPile.splice(0, actualDrawCount);

    if (requestedDrawCount > 0 && next.drawPile.length === 0) {
      beginGuessing(next, "draw_pile_exhausted", random);
    } else if (next.hands[playerId].length === 0) {
      beginGuessing(next, "player_empty_hand", random);
    } else {
      advanceTurn(next, playerId);
    }

    return {
      state: next,
      accepted: true,
      reason: "no_playable_cards",
      playableCardIds: [],
    };
  }

  if (!keeperSelectedCardId) {
    return {
      state: current,
      accepted: false,
      reason: "keeper_selection_required",
      playableCardIds: playableCards.map((card) => card.id),
    };
  }

  const chosen = playableCards.find((card) => card.id === keeperSelectedCardId);
  if (!chosen) throw new Error("The Rule Keeper must choose one of the playable cards.");

  next.hands[playerId] = next.hands[playerId].filter((card) => card.id !== chosen.id);
  next.tableCards.push(chosen);

  if (next.drawPile.length > 0) {
    next.hands[playerId].push(next.drawPile.shift() as CharacterCard);
  }

  if (next.drawPile.length === 0) {
    beginGuessing(next, "draw_pile_exhausted", random);
  } else {
    advanceTurn(next, playerId);
  }

  return { state: next, accepted: true, playableCardIds: playableCards.map((card) => card.id) };
}

/** Applies a guess, awards the +1 bonus on success, and completes the round. */
export function guessRoundRule(
  current: OfflineRoundState,
  playerId: string,
  guessedRuleId: string,
): RuleGuessActionResult {
  if (current.phase !== "guessing" || !current.ruleGuessState || !current.roundScore) {
    throw new Error("The round is not accepting rule guesses.");
  }

  const result = submitRuleGuess(current.ruleGuessState, playerId, guessedRuleId);
  const next = copyState(current);
  next.ruleGuessState = result.state;

  if (result.correct) {
    next.roundScore = awardGuessBonus(current.roundScore, playerId);
    next.phase = "complete";
    next.pendingGuesserId = undefined;
  } else {
    next.pendingGuesserId =
      result.state.guesserOrder[result.state.currentGuesserIndex];
  }

  return {
    state: next,
    correct: result.correct,
    guessedRuleId,
    guesserId: playerId,
  };
}
