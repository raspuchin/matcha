import type { Round } from "../types";
import { CourtCard } from "./CourtCard";
import "./RoundDisplay.css";

interface RoundDisplayProps {
  round: Round | null;
  onRecordWinner: (courtId: number, winner: "teamA" | "teamB" | "draw") => void;
}

export function RoundDisplay({ round, onRecordWinner }: RoundDisplayProps) {
  if (!round) {
    return (
      <div className="round-display empty">
        <p>No round generated yet. Add players and hit Generate.</p>
      </div>
    );
  }

  return (
    <div className="round-display">
      <h2>Round {round.id}</h2>
      <div className="courts-grid">
        {round.matches.map((match) => (
          <CourtCard
            key={match.court}
            match={match}
            onWinner={(winner) => onRecordWinner(match.court, winner)}
          />
        ))}
      </div>
      {round.sittingOut.length > 0 && (
        <div className="sitting-out">
          Sitting out: {round.sittingOut.map((p) => p.name).join(", ")}
        </div>
      )}
    </div>
  );
}
