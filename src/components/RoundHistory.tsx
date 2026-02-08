import { useState } from "react";
import type { Round } from "../types";
import { CourtCard } from "./CourtCard";
import "./RoundHistory.css";

interface RoundHistoryProps {
  rounds: Round[];
}

export function RoundHistory({ rounds }: RoundHistoryProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (rounds.length <= 1) return null;

  const pastRounds = rounds.slice(0, -1).reverse();

  return (
    <div className="round-history">
      <h2>Round History</h2>
      {pastRounds.map((round) => (
        <div key={round.id} className="history-item">
          <button
            className="history-toggle"
            onClick={() =>
              setExpandedId(expandedId === round.id ? null : round.id)
            }
          >
            <span>Round {round.id}</span>
            <span className="toggle-icon">
              {expandedId === round.id ? "\u25B2" : "\u25BC"}
            </span>
          </button>
          {expandedId === round.id && (
            <div className="history-detail">
              <div className="courts-grid">
                {round.matches.map((match) => (
                  <CourtCard key={match.court} match={match} />
                ))}
              </div>
              {round.sittingOut.length > 0 && (
                <div className="sitting-out">
                  Sat out: {round.sittingOut.map((p) => p.name).join(", ")}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
