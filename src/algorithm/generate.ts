import type { Match, Player, PairHistory, Round, SessionState } from "../types";
import { fisherYatesShuffle, pairKey } from "./utils";
import { scoreCandidate } from "./scoring";

function bestConfiguration(
  playerCount: number,
  courtCount: number
): { singles: number; doubles: number } {
  let best = { singles: 0, doubles: 0, playing: 0 };

  const maxDoubles = Math.min(courtCount, Math.floor(playerCount / 4));

  for (let d = maxDoubles; d >= 0; d--) {
    const remainingCourts = courtCount - d;
    const remainingPlayers = playerCount - 4 * d;
    const s = Math.min(remainingCourts, Math.floor(remainingPlayers / 2));
    const playing = 4 * d + 2 * s;

    if (playing > best.playing) {
      best = { singles: s, doubles: d, playing };
    }

    if (playing >= playerCount) break;
  }

  return { singles: best.singles, doubles: best.doubles };
}

function selectSitOuts(
  players: Player[],
  sitOutCounts: Record<string, number>,
  numSitOut: number
): Player[] {
  if (numSitOut <= 0) return [];

  const sorted = [...players].sort((a, b) => {
    const diff = (sitOutCounts[a.id] || 0) - (sitOutCounts[b.id] || 0);
    return diff !== 0 ? diff : Math.random() - 0.5;
  });

  return sorted.slice(0, numSitOut);
}

function generateCandidates(
  activePlayers: Player[],
  singles: number,
  doubles: number,
  numCandidates: number = 50
): Match[][] {
  const candidates: Match[][] = [];

  for (let i = 0; i < numCandidates; i++) {
    const shuffled = fisherYatesShuffle(activePlayers);
    const matches: Match[] = [];
    let idx = 0;

    for (let c = 0; c < doubles; c++) {
      matches.push({
        court: c + 1,
        format: "doubles",
        teamA: [shuffled[idx], shuffled[idx + 1]],
        teamB: [shuffled[idx + 2], shuffled[idx + 3]],
      });
      idx += 4;
    }

    for (let c = 0; c < singles; c++) {
      matches.push({
        court: doubles + c + 1,
        format: "singles",
        teamA: [shuffled[idx]],
        teamB: [shuffled[idx + 1]],
      });
      idx += 2;
    }

    candidates.push(matches);
  }

  return candidates;
}

export function generateRound(state: SessionState): Round {
  const { players, courts, sitOutCounts, pairHistory, rounds } = state;
  const { singles, doubles } = bestConfiguration(players.length, courts);
  const numPlaying = 2 * singles + 4 * doubles;
  const numSitOut = players.length - numPlaying;

  const sittingOut = selectSitOuts(players, sitOutCounts, numSitOut);
  const sittingOutIds = new Set(sittingOut.map((p) => p.id));
  const activePlayers = players.filter((p) => !sittingOutIds.has(p.id));

  const candidates = generateCandidates(activePlayers, singles, doubles);

  let bestMatches = candidates[0];
  let bestScore = Infinity;

  for (const candidate of candidates) {
    const score = scoreCandidate(candidate, pairHistory);
    if (score < bestScore) {
      bestScore = score;
      bestMatches = candidate;
    }
  }

  return {
    id: rounds.length + 1,
    matches: bestMatches,
    sittingOut,
  };
}

export function updateSitOutCounts(
  counts: Record<string, number>,
  sittingOut: Player[]
): Record<string, number> {
  const next = { ...counts };
  for (const p of sittingOut) {
    next[p.id] = (next[p.id] || 0) + 1;
  }
  return next;
}

export function updatePairHistory(
  history: PairHistory,
  matches: Match[]
): PairHistory {
  const teammate = { ...history.teammate };
  const opponent = { ...history.opponent };

  for (const match of matches) {
    if (match.format === "doubles") {
      const keyA = pairKey(match.teamA[0], match.teamA[1]);
      teammate[keyA] = (teammate[keyA] || 0) + 1;
      const keyB = pairKey(match.teamB[0], match.teamB[1]);
      teammate[keyB] = (teammate[keyB] || 0) + 1;
    }

    for (const a of match.teamA) {
      for (const b of match.teamB) {
        const key = pairKey(a, b);
        opponent[key] = (opponent[key] || 0) + 1;
      }
    }
  }

  return { teammate, opponent };
}
