import type { Round } from "../types";
import { CourtCard } from "./CourtCard";
import "./RoundDisplay.css";

interface RoundDisplayProps {
  round: Round | null;
}

export function RoundDisplay({ round }: RoundDisplayProps) {
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
          <CourtCard key={match.court} match={match} />
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
