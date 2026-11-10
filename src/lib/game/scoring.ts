import type { CharacterCard } from "./catalog";
import type { GameParticipant } from "./setup";

export interface PlayerRoundScore {
  playerId: string;
  rank: number | null;
  cardsRemaining: number;
  points: number;
  isRuleKeeper: boolean;
}

export interface RoundScoreSnapshot {
  players: PlayerRoundScore[];
  activePlayerCount: number;
  endReason: "player_empty_hand" | "draw_pile_exhausted";
  firstPlacePlayerId: string;
}

/**
 * Rank active players by remaining hand size. Ties use competition ranking:
 * 1, 2, 2, 4. The Rule Keeper is listed separately and always scores zero.
 */
export function calculateRoundScores(
  players: GameParticipant[],
  hands: Record<string, CharacterCard[]>,
  ruleKeeperId: string,
  endReason: RoundScoreSnapshot["endReason"],
): RoundScoreSnapshot {
  const activePlayers = players.filter((player) => player.id !== ruleKeeperId);
  if (activePlayers.length < 2) {
    throw new Error("At least two active players are required to score a round.");
  }

  for (const player of players) {
    if (!hands[player.id]) throw new Error(`Missing hand for player ${player.id}.`);
  }

  const ordered = [...activePlayers].sort((a, b) => {
    const handDifference = hands[a.id].length - hands[b.id].length;
    return handDifference || a.seatOrder - b.seatOrder;
  });

  const startingPoints = Math.floor(activePlayers.length / 2);
  let previousHandSize: number | undefined;
  let previousRank = 0;

  const ranked = ordered.map((player, index): PlayerRoundScore => {
    const cardsRemaining = hands[player.id].length;
    const rank = cardsRemaining === previousHandSize ? previousRank : index + 1;
    previousHandSize = cardsRemaining;
    previousRank = rank;

    return {
      playerId: player.id,
      rank,
      cardsRemaining,
      points: startingPoints - (rank - 1),
      isRuleKeeper: false,
    };
  });

  const firstPlacePlayerId = ranked[0].playerId;
  const keeper = players.find((player) => player.id === ruleKeeperId);
  if (!keeper) throw new Error("Rule Keeper must be seated in this round.");

  return {
    players: [
      ...ranked,
      {
        playerId: keeper.id,
        rank: null,
        cardsRemaining: hands[keeper.id].length,
        points: 0,
        isRuleKeeper: true,
      },
    ],
    activePlayerCount: activePlayers.length,
    endReason,
    firstPlacePlayerId,
  };
}

/** Adds the correct-guess bonus without changing the saved ranking. */
export function awardGuessBonus(
  snapshot: RoundScoreSnapshot,
  playerId: string,
): RoundScoreSnapshot {
  const target = snapshot.players.find(
    (player) => player.playerId === playerId && !player.isRuleKeeper,
  );
  if (!target) throw new Error("Only an active player can receive the guess bonus.");

  return {
    ...snapshot,
    players: snapshot.players.map((player) =>
      player.playerId === playerId ? { ...player, points: player.points + 1 } : player,
    ),
  };
}

export interface MatchStanding {
  playerId: string;
  points: number;
  rank: number;
}

/** Ranks final match totals in descending order using competition ranking. */
export function calculateMatchStandings(
  players: GameParticipant[],
  totalScores: Record<string, number>,
): MatchStanding[] {
  const ordered = [...players].sort((a, b) => {
    const scoreDifference = (totalScores[b.id] ?? 0) - (totalScores[a.id] ?? 0);
    return scoreDifference || a.seatOrder - b.seatOrder;
  });

  let previousPoints: number | undefined;
  let previousRank = 0;

  return ordered.map((player, index) => {
    const points = totalScores[player.id] ?? 0;
    const rank = points === previousPoints ? previousRank : index + 1;
    previousPoints = points;
    previousRank = rank;
    return { playerId: player.id, points, rank };
  });
}
