export interface Player {
  id: string;
  name: string;
}

export interface Match {
  court: number;
  format: "singles" | "doubles";
  teamA: Player[];
  teamB: Player[];
}

export interface Round {
  id: number;
  matches: Match[];
  sittingOut: Player[];
}

export interface PairHistory {
  teammate: Record<string, number>;
  opponent: Record<string, number>;
}

export interface SessionState {
  players: Player[];
  courts: number;
  rounds: Round[];
  sitOutCounts: Record<string, number>;
  pairHistory: PairHistory;
}
