import type { Match } from "../types";
import "./CourtCard.css";

interface CourtCardProps {
  match: Match;
}

export function CourtCard({ match }: CourtCardProps) {
  return (
    <div className="court-card">
      <div className="court-header">
        <span className="court-number">Court {match.court}</span>
        <span className={`court-format ${match.format}`}>{match.format}</span>
      </div>
      <div className="court-matchup">
        <div className="team team-a">
          {match.teamA.map((p) => p.name).join(" & ")}
        </div>
        <div className="vs">vs</div>
        <div className="team team-b">
          {match.teamB.map((p) => p.name).join(" & ")}
        </div>
      </div>
    </div>
  );
}
