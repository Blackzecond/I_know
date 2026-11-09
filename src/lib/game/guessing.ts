import { RULE_CARDS, type RuleCard } from "./catalog";

export interface RuleGuessState {
  secretRuleId: string;
  choices: RuleCard[];
  unusedRuleIds: string[];
  guesserOrder: string[];
  currentGuesserIndex: number;
  isComplete: boolean;
  correctGuesserId?: string;
}

export interface RuleGuessResult {
  state: RuleGuessState;
  correct: boolean;
  guessedRuleId: string;
  guesserId: string;
}

/** Creates three choices: the secret rule and two shuffled decoys. */
export function startRuleGuessing(
  secretRuleId: string,
  activePlayerIds: string[],
  firstGuesserId: string,
  random: () => number = Math.random,
  ruleDeck: RuleCard[] = RULE_CARDS,
): RuleGuessState {
  if (new Set(activePlayerIds).size !== activePlayerIds.length || activePlayerIds.length < 2) {
    throw new Error("Rule guessing requires at least two distinct active players.");
  }
  const firstIndex = activePlayerIds.indexOf(firstGuesserId);
  if (firstIndex < 0) throw new Error("The first guesser must be an active player.");

  const secretRule = ruleDeck.find((rule) => rule.id === secretRuleId);
  if (!secretRule) throw new Error("The secret rule is not in the rule deck.");

  const candidates = ruleDeck.filter((rule) => rule.id !== secretRuleId);
  if (candidates.length < 2) throw new Error("At least two decoy rules are required.");

  const shuffled = [...candidates];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const sample = random();
    if (sample < 0 || sample >= 1) {
      throw new RangeError("random() must return a value in the range [0, 1).");
    }
    const swapIndex = Math.floor(sample * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return {
    secretRuleId,
    choices: [secretRule, ...shuffled.slice(0, 2)],
    unusedRuleIds: shuffled.slice(2).map((rule) => rule.id),
    guesserOrder: [
      ...activePlayerIds.slice(firstIndex),
      ...activePlayerIds.slice(0, firstIndex),
    ],
    currentGuesserIndex: 0,
    isComplete: false,
  };
}

/**
 * A wrong guess removes that decoy, adds the next unused rule if available,
 * and passes the turn clockwise. Guessing loops until someone finds the rule.
 */
export function submitRuleGuess(
  current: RuleGuessState,
  guesserId: string,
  guessedRuleId: string,
  ruleDeck: RuleCard[] = RULE_CARDS,
): RuleGuessResult {
  if (current.isComplete) throw new Error("Rule guessing is already complete.");
  const expectedGuesser = current.guesserOrder[current.currentGuesserIndex];
  if (guesserId !== expectedGuesser) throw new Error("It is not this player's guessing turn.");
  if (!current.choices.some((rule) => rule.id === guessedRuleId)) {
    throw new Error("Choose one of the currently displayed rule cards.");
  }

  if (guessedRuleId === current.secretRuleId) {
    return {
      state: { ...current, isComplete: true, correctGuesserId: guesserId },
      correct: true,
      guessedRuleId,
      guesserId,
    };
  }

  const choices = current.choices.filter((rule) => rule.id !== guessedRuleId);
  const nextUnusedId = current.unusedRuleIds[0];
  const nextUnusedRule = nextUnusedId
    ? ruleDeck.find((rule) => rule.id === nextUnusedId)
    : undefined;

  if (nextUnusedRule) choices.push(nextUnusedRule);

  return {
    state: {
      ...current,
      choices,
      unusedRuleIds: nextUnusedRule ? current.unusedRuleIds.slice(1) : current.unusedRuleIds,
      currentGuesserIndex: (current.currentGuesserIndex + 1) % current.guesserOrder.length,
    },
    correct: false,
    guessedRuleId,
    guesserId,
  };
}
