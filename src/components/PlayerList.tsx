import type { Player } from "../types";
import "./PlayerList.css";

interface PlayerListProps {
  players: Player[];
  sitOutCounts: Record<string, number>;
  currentSittingOut: Player[];
}

export function PlayerList({
  players,
  sitOutCounts,
  currentSittingOut,
}: PlayerListProps) {
  if (players.length === 0) return null;

  const sittingOutIds = new Set(currentSittingOut.map((p) => p.id));

  return (
    <div className="player-list">
      <h2>Players</h2>
      <div className="player-list-grid">
        {players.map((p) => (
          <div
            key={p.id}
            className={`player-list-item ${sittingOutIds.has(p.id) ? "sitting-out" : ""}`}
          >
            <span className="player-name">{p.name}</span>
            <span className="sit-out-count">
              sat out: {sitOutCounts[p.id] || 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
