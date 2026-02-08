import { useState } from "react";
import type { Player } from "../types";
import "./SetupPanel.css";

interface SetupPanelProps {
  players: Player[];
  courts: number;
  isLocked: boolean;
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (id: string) => void;
  onSetCourts: (count: number) => void;
  onReset: () => void;
}

export function SetupPanel({
  players,
  courts,
  isLocked,
  onAddPlayer,
  onRemovePlayer,
  onSetCourts,
  onReset,
}: SetupPanelProps) {
  const [nameInput, setNameInput] = useState("");

  function handleAdd() {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    const isDuplicate = players.some(
      (p) => p.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) return;
    onAddPlayer(trimmed);
    setNameInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleAdd();
  }

  return (
    <div className="setup-panel">
      <div className="setup-header">
        <h2>Session Setup</h2>
        {isLocked && (
          <button className="btn btn-danger" onClick={onReset}>
            Reset Session
          </button>
        )}
      </div>

      {!isLocked && (
        <div className="setup-inputs">
          <div className="player-input-row">
            <input
              type="text"
              placeholder="Player name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="btn btn-primary" onClick={handleAdd}>
              Add
            </button>
          </div>
          <div className="court-input-row">
            <label>
              Courts:
              <input
                type="number"
                min={1}
                max={20}
                value={courts}
                onChange={(e) =>
                  onSetCourts(Math.max(1, parseInt(e.target.value) || 1))
                }
              />
            </label>
          </div>
        </div>
      )}

      {isLocked && (
        <div className="setup-summary">
          <span>{players.length} players</span>
          <span>{courts} court{courts !== 1 ? "s" : ""}</span>
        </div>
      )}

      <div className="player-tags">
        {players.map((p) => (
          <span key={p.id} className="player-tag">
            {p.name}
            {!isLocked && (
              <button
                className="remove-btn"
                onClick={() => onRemovePlayer(p.id)}
              >
                &times;
              </button>
            )}
          </span>
        ))}
        {players.length === 0 && (
          <span className="empty-hint">Add players to get started</span>
        )}
      </div>
    </div>
  );
}
