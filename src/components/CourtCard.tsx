import type { Match } from "../types";
import "./CourtCard.css";

interface CourtCardProps {
  match: Match;
  onWinner?: (winner: "teamA" | "teamB" | "draw") => void;
}

export function CourtCard({ match, onWinner }: CourtCardProps) {
  const winnerName =
    match.winner === "draw"
      ? "Draw"
      : match.winner === "teamA"
      ? match.teamA.map((p) => p.name).join(" & ")
      : match.winner === "teamB"
      ? match.teamB.map((p) => p.name).join(" & ")
      : null;

  return (
    <div className={`court-card${match.winner ? " has-winner" : ""}`}>
      <div className="court-header">
        <span className="court-number">Court {match.court}</span>
        <span className={`court-format ${match.format}`}>{match.format}</span>
      </div>
      <div className="court-matchup">
        <div className={`team team-a${match.winner === "teamA" ? " winner" : match.winner === "teamB" ? " loser" : match.winner === "draw" ? " draw" : ""}`}>
          {match.teamA.map((p) => p.name).join(" & ")}
        </div>
        <div className="vs">vs</div>
        <div className={`team team-b${match.winner === "teamB" ? " winner" : match.winner === "teamA" ? " loser" : match.winner === "draw" ? " draw" : ""}`}>
          {match.teamB.map((p) => p.name).join(" & ")}
        </div>
      </div>

      {winnerName && (
        <div className={`winner-badge${match.winner === "draw" ? " draw" : ""}`}>
          {match.winner === "draw" ? "Draw" : `${winnerName} won`}
        </div>
      )}

      {onWinner && !match.winner && (
        <div className="winner-buttons">
          <button
            className="winner-btn winner-btn-a"
            onClick={() => onWinner("teamA")}
          >
            {match.teamA.map((p) => p.name).join(" & ")} Won
          </button>
          <button
            className="winner-btn winner-btn-draw"
            onClick={() => onWinner("draw")}
          >
            Draw
          </button>
          <button
            className="winner-btn winner-btn-b"
            onClick={() => onWinner("teamB")}
          >
            {match.teamB.map((p) => p.name).join(" & ")} Won
          </button>
        </div>
      )}
    </div>
  );
}
