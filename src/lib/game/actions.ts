import type { CharacterCard } from "./catalog";
import { evaluatePlay } from "./rule-engine";
import { getNextTurnPlayer } from "./turn-order";
import type { OfflineRoundState } from "./setup";

export interface GameActionResult {
  state: OfflineRoundState;
  accepted: boolean;
  reason?: "rule_failed" | "no_playable_cards" | "keeper_selection_required";
  playableCardIds?: string[];
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
  };
}

function advanceTurn(state: OfflineRoundState, playerId: string): void {
  state.currentPlayerId = getNextTurnPlayer(
    state.players,
    playerId,
    state.ruleKeeperId,
  ).id;
}

/** A failed attempted play returns all cards to the hand and ends the turn. */
export function playCards(
  current: OfflineRoundState,
  playerId: string,
  cardIds: string[],
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
    next.phase = "guessing";
    next.pendingGuesserId = playerId;
  } else {
    advanceTurn(next, playerId);
  }

  return { state: next, accepted: true };
}

/**
 * The active player submits their whole hand for the Rule Keeper to inspect.
 * If none can be played, all are discarded and the player draws handSize - 1.
 * Otherwise the keeper must choose one playable card; it is played, the rest
 * return to the hand, and the player draws one replacement card.
 */
export function exchangeWholeHand(
  current: OfflineRoundState,
  playerId: string,
  keeperSelectedCardId?: string,
): GameActionResult {
  assertActiveTurn(current, playerId);
  const hand = current.hands[playerId];
  if (hand.length === 0) throw new Error("A player with an empty hand cannot exchange cards.");

  const playableCards = hand.filter(
    (card) => evaluatePlay(current.secretRule, current.tableCards, [card]).accepted,
  );
  const next = copyState(current);

  if (playableCards.length === 0) {
    const drawCount = Math.max(0, hand.length - 1);
    if (current.drawPile.length < drawCount) {
      throw new Error("Not enough cards remain in the draw pile to complete this exchange.");
    }

    next.discardPile.push(...next.hands[playerId]);
    next.hands[playerId] = [];
    next.hands[playerId].push(...next.drawPile.splice(0, drawCount));

    if (next.hands[playerId].length === 0) {
      next.phase = "guessing";
      next.pendingGuesserId = playerId;
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
  if (current.drawPile.length < 1) {
    throw new Error("Not enough cards remain in the draw pile to complete this exchange.");
  }

  next.hands[playerId] = next.hands[playerId].filter((card) => card.id !== chosen.id);
  next.tableCards.push(chosen);
  next.hands[playerId].push(next.drawPile.shift() as CharacterCard);
  advanceTurn(next, playerId);

  return { state: next, accepted: true, playableCardIds: playableCards.map((card) => card.id) };
}
