import type { CharacterCard, RuleCard } from "./catalog";

export interface RuleCheck {
  accepted: boolean;
  failedAt?: number;
  reason?: string;
}

/**
 * Evaluates a proposed play in order. Each card is checked against the
 * previously accepted card, including cards earlier in the same proposal.
 * The caller should commit the entire proposal only when accepted is true.
 */
export function evaluatePlay(
  rule: RuleCard,
  previouslyAccepted: CharacterCard[],
  proposedCards: CharacterCard[],
): RuleCheck {
  if (proposedCards.length === 0) {
    return { accepted: false, reason: "empty_play" };
  }

  let previous = previouslyAccepted.at(-1);

  for (let index = 0; index < proposedCards.length; index += 1) {
    const card = proposedCards[index];
    const valid = evaluateSingle(rule, card, previous);

    if (!valid) {
      return { accepted: false, failedAt: index, reason: rule.conditionType };
    }

    previous = card;
  }

  return { accepted: true };
}

function evaluateSingle(
  rule: RuleCard,
  card: CharacterCard,
  previous: CharacterCard | undefined,
): boolean {
  const value = rule.conditionValue;

  switch (rule.conditionType) {
    case "card_color_is":
      return card.color === value.color;

    case "card_color_in":
      return Array.isArray(value.colors) && value.colors.includes(card.color);

    case "card_number_is_odd":
      return card.number % 2 === 1;

    case "number_differs_from_previous":
      return previous === undefined || card.number !== previous.number;

    case "card_animal_in":
      return Array.isArray(value.animals) && value.animals.includes(card.animal);

    default:
      return false;
  }
}
