import { useReducer } from "react";
import type { SessionState } from "./types";
import {
  generateRound,
  updateSitOutCounts,
  updatePairHistory,
} from "./algorithm/generate";
import { SetupPanel } from "./components/SetupPanel";
import { GenerateButton } from "./components/GenerateButton";
import { RoundDisplay } from "./components/RoundDisplay";
import { PlayerList } from "./components/PlayerList";
import { RoundHistory } from "./components/RoundHistory";
import "./App.css";

type Action =
  | { type: "ADD_PLAYER"; name: string }
  | { type: "REMOVE_PLAYER"; id: string }
  | { type: "SET_COURTS"; count: number }
  | { type: "GENERATE_ROUND" }
  | { type: "RESET_SESSION" };

const initialState: SessionState = {
  players: [],
  courts: 1,
  rounds: [],
  sitOutCounts: {},
  pairHistory: { teammate: {}, opponent: {} },
};

function sessionReducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case "ADD_PLAYER":
      return {
        ...state,
        players: [
          ...state.players,
          { id: crypto.randomUUID(), name: action.name },
        ],
      };

    case "REMOVE_PLAYER":
      return {
        ...state,
        players: state.players.filter((p) => p.id !== action.id),
      };

    case "SET_COURTS":
      return { ...state, courts: action.count };

    case "GENERATE_ROUND": {
      const newRound = generateRound(state);
      return {
        ...state,
        rounds: [...state.rounds, newRound],
        sitOutCounts: updateSitOutCounts(state.sitOutCounts, newRound.sittingOut),
        pairHistory: updatePairHistory(state.pairHistory, newRound.matches),
      };
    }

    case "RESET_SESSION":
      return initialState;

    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  const isLocked = state.rounds.length > 0;
  const canGenerate = state.players.length >= 2 && state.courts >= 1;
  const currentRound =
    state.rounds.length > 0 ? state.rounds[state.rounds.length - 1] : null;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Matcha</h1>
        <p>Badminton Matchup Maker</p>
      </header>

      <main className="app-main">
        <SetupPanel
          players={state.players}
          courts={state.courts}
          isLocked={isLocked}
          onAddPlayer={(name) => dispatch({ type: "ADD_PLAYER", name })}
          onRemovePlayer={(id) => dispatch({ type: "REMOVE_PLAYER", id })}
          onSetCourts={(count) => dispatch({ type: "SET_COURTS", count })}
          onReset={() => dispatch({ type: "RESET_SESSION" })}
        />

        <GenerateButton
          disabled={!canGenerate}
          onGenerate={() => dispatch({ type: "GENERATE_ROUND" })}
        />

        <RoundDisplay round={currentRound} />

        <PlayerList
          players={state.players}
          sitOutCounts={state.sitOutCounts}
          currentSittingOut={currentRound?.sittingOut ?? []}
        />

        <RoundHistory rounds={state.rounds} />
      </main>
    </div>
  );
}

export default App;
