import type { Match, PairHistory } from "../types";
import { pairKey } from "./utils";

const TEAMMATE_WEIGHT = 3;
const OPPONENT_WEIGHT = 2;

export function scoreCandidate(
  matches: Match[],
  pairHistory: PairHistory
): number {
  let penalty = 0;

  for (const match of matches) {
    if (match.format === "doubles") {
      const keyA = pairKey(match.teamA[0], match.teamA[1]);
      penalty += (pairHistory.teammate[keyA] || 0) * TEAMMATE_WEIGHT;

      const keyB = pairKey(match.teamB[0], match.teamB[1]);
      penalty += (pairHistory.teammate[keyB] || 0) * TEAMMATE_WEIGHT;
    }

    for (const a of match.teamA) {
      for (const b of match.teamB) {
        const key = pairKey(a, b);
        penalty += (pairHistory.opponent[key] || 0) * OPPONENT_WEIGHT;
      }
    }
  }

  return penalty;
}
