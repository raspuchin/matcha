import { useRef } from "react";
import type { Player, Round } from "../types";
import "./ResultsView.css";

interface PlayerStat {
  player: Player;
  wins: number;
  losses: number;
  draws: number;
  ratio: string;
}

interface ResultsViewProps {
  rounds: Round[];
  players: Player[];
  onClose: () => void;
}

function computeStats(players: Player[], rounds: Round[]): PlayerStat[] {
  return players
    .map((player) => {
      let wins = 0;
      let losses = 0;
      let draws = 0;
      rounds.forEach((round) => {
        round.matches.forEach((match) => {
          if (!match.winner) return;
          const onA = match.teamA.some((p) => p.id === player.id);
          const onB = match.teamB.some((p) => p.id === player.id);
          if (match.winner === "draw" && (onA || onB)) draws++;
          else if (onA && match.winner === "teamA") wins++;
          else if (onB && match.winner === "teamB") wins++;
          else if (onA && match.winner === "teamB") losses++;
          else if (onB && match.winner === "teamA") losses++;
        });
      });
      const ratio =
        losses === 0
          ? wins > 0
            ? "∞"
            : "-"
          : (wins / losses).toFixed(2);
      return { player, wins, losses, draws, ratio };
    })
    .sort((a, b) => b.wins - a.wins || a.losses - b.losses);
}

function exportCSV(_players: Player[], rounds: Round[], stats: PlayerStat[]) {
  let csv = "Player,Wins,Losses,Draws,W/L Ratio\n";
  stats.forEach((s) => {
    csv += `${s.player.name},${s.wins},${s.losses},${s.draws},${s.ratio}\n`;
  });

  csv += "\nMatch History\n";
  csv += "Round,Court,Format,Team A,Team B,Winner\n";
  rounds.forEach((round) => {
    round.matches.forEach((match) => {
      const winner =
        match.winner === "draw"
          ? "Draw"
          : match.winner === "teamA"
          ? match.teamA.map((p) => p.name).join(" & ")
          : match.winner === "teamB"
          ? match.teamB.map((p) => p.name).join(" & ")
          : "-";
      csv += `${round.id},${match.court},${match.format},"${match.teamA
        .map((p) => p.name)
        .join(" & ")}","${match.teamB.map((p) => p.name).join(" & ")}",${winner}\n`;
    });
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "matcha-results.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function truncate(text: string, maxLen: number) {
  return text.length > maxLen ? text.slice(0, maxLen - 1) + "…" : text;
}

function exportPNG(players: Player[], rounds: Round[], stats: PlayerStat[]) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const padding = 28;
  const rowH = 30;
  const headerRowH = 34;
  const titleH = 52;
  const sectionLabelH = 28;
  const sectionGap = 20;

  // Stats table columns
  const sCols = ["Player", "Wins", "Losses", "Draws", "W/L Ratio"];
  const sWidths = [160, 60, 60, 60, 80];
  const sTableW = sWidths.reduce((a, b) => a + b, 0);

  // Match history columns
  const mCols = ["Round", "Court", "Format", "Team A", "Team B", "Winner"];
  const mWidths = [60, 60, 75, 155, 155, 155];
  const mTableW = mWidths.reduce((a, b) => a + b, 0);

  const tableW = Math.max(sTableW, mTableW);
  const canvasW = tableW + padding * 2;

  const allMatches = rounds.flatMap((r) =>
    r.matches.map((m) => ({ ...m, roundId: r.id }))
  );

  const canvasH =
    padding +
    titleH +
    sectionLabelH +
    headerRowH +
    stats.length * rowH +
    sectionGap +
    sectionLabelH +
    headerRowH +
    allMatches.length * rowH +
    padding;

  const canvas = document.createElement("canvas");
  canvas.width = canvasW * dpr;
  canvas.height = canvasH * dpr;

  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  // Background
  ctx.fillStyle = "#f1f5f9";
  ctx.fillRect(0, 0, canvasW, canvasH);

  let y = padding;

  // Title
  ctx.fillStyle = "#2563eb";
  ctx.font = `bold 20px Inter, system-ui, sans-serif`;
  ctx.fillText("Matcha — Match Results", padding, y + 22);
  ctx.fillStyle = "#64748b";
  ctx.font = `13px Inter, system-ui, sans-serif`;
  ctx.fillText(
    `${rounds.length} round${rounds.length !== 1 ? "s" : ""} · ${players.length} player${players.length !== 1 ? "s" : ""}`,
    padding,
    y + 42
  );
  y += titleH;

  function drawTable(
    headers: string[],
    widths: number[],
    rows: string[][],
    startY: number
  ) {
    const tW = widths.reduce((a, b) => a + b, 0);
    let cy = startY;

    // Header row
    ctx.fillStyle = "#2563eb";
    ctx.fillRect(padding, cy, tW, headerRowH);
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold 12px Inter, system-ui, sans-serif`;
    let cx = padding;
    headers.forEach((h, i) => {
      ctx.fillText(h, cx + 8, cy + 21);
      cx += widths[i];
    });
    cy += headerRowH;

    // Data rows
    rows.forEach((row, ri) => {
      ctx.fillStyle = ri % 2 === 0 ? "#ffffff" : "#f1f5f9";
      ctx.fillRect(padding, cy, tW, rowH);
      ctx.fillStyle = "#1e293b";
      ctx.font = `12px Inter, system-ui, sans-serif`;
      let cx2 = padding;
      row.forEach((cell, i) => {
        ctx.fillText(truncate(cell, 22), cx2 + 8, cy + 19);
        cx2 += widths[i];
      });
      cy += rowH;
    });

    // Outer border
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;
    ctx.strokeRect(padding, startY, tW, headerRowH + rows.length * rowH);

    // Column dividers
    let divX = padding;
    widths.slice(0, -1).forEach((w) => {
      divX += w;
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(divX, startY);
      ctx.lineTo(divX, cy);
      ctx.stroke();
    });

    return cy;
  }

  // Player Statistics section
  ctx.fillStyle = "#1e293b";
  ctx.font = `bold 14px Inter, system-ui, sans-serif`;
  ctx.fillText("Player Statistics", padding, y + 18);
  y += sectionLabelH;

  const statsRows = stats.map((s) => [
    s.player.name,
    String(s.wins),
    String(s.losses),
    String(s.draws),
    s.ratio,
  ]);
  y = drawTable(sCols, sWidths, statsRows, y);
  y += sectionGap;

  // Match History section
  ctx.fillStyle = "#1e293b";
  ctx.font = `bold 14px Inter, system-ui, sans-serif`;
  ctx.fillText("Match History", padding, y + 18);
  y += sectionLabelH;

  const matchRows = allMatches.map((m) => {
    const winner =
      m.winner === "draw"
        ? "Draw"
        : m.winner === "teamA"
        ? m.teamA.map((p) => p.name).join(" & ")
        : m.winner === "teamB"
        ? m.teamB.map((p) => p.name).join(" & ")
        : "-";
    return [
      String(m.roundId),
      String(m.court),
      m.format,
      m.teamA.map((p) => p.name).join(" & "),
      m.teamB.map((p) => p.name).join(" & "),
      winner,
    ];
  });
  drawTable(mCols, mWidths, matchRows, y);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "matcha-results.png";
    a.click();
    URL.revokeObjectURL(url);
  });
}

export function ResultsView({ rounds, players, onClose }: ResultsViewProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const stats = computeStats(players, rounds);

  const allMatches = rounds.flatMap((r) =>
    r.matches.map((m) => ({ ...m, roundId: r.id }))
  );

  return (
    <div className="results-overlay" onClick={onClose}>
      <div
        className="results-modal"
        onClick={(e) => e.stopPropagation()}
        ref={contentRef}
      >
        <div className="results-header">
          <h2>Results</h2>
          <div className="results-export">
            <button
              className="export-btn"
              onClick={() => exportPNG(players, rounds, stats)}
            >
              Export PNG
            </button>
            <button
              className="export-btn"
              onClick={() => exportCSV(players, rounds, stats)}
            >
              Export CSV
            </button>
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div className="results-body">
          <section className="results-section">
            <h3>Player Statistics</h3>
            <table className="results-table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>W</th>
                  <th>L</th>
                  <th>D</th>
                  <th>W/L</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s) => (
                  <tr key={s.player.id}>
                    <td>{s.player.name}</td>
                    <td className="stat-cell wins">{s.wins}</td>
                    <td className="stat-cell losses">{s.losses}</td>
                    <td className="stat-cell draws">{s.draws}</td>
                    <td className="stat-cell ratio">{s.ratio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="results-section">
            <h3>Match History</h3>
            <table className="results-table match-history-table">
              <thead>
                <tr>
                  <th>Round</th>
                  <th>Court</th>
                  <th>Format</th>
                  <th>Team A</th>
                  <th>Team B</th>
                  <th>Winner</th>
                </tr>
              </thead>
              <tbody>
                {allMatches.map((m, i) => {
                  const winnerDisplay =
                    m.winner === "draw"
                      ? <span className="draw-result">Draw</span>
                      : m.winner === "teamA"
                      ? m.teamA.map((p) => p.name).join(" & ")
                      : m.winner === "teamB"
                      ? m.teamB.map((p) => p.name).join(" & ")
                      : null;
                  return (
                    <tr key={i}>
                      <td>{m.roundId}</td>
                      <td>{m.court}</td>
                      <td>
                        <span className={`format-pill ${m.format}`}>
                          {m.format}
                        </span>
                      </td>
                      <td className={m.winner === "teamA" ? "team-won" : m.winner === "teamB" ? "team-lost" : m.winner === "draw" ? "team-draw" : ""}>
                        {m.teamA.map((p) => p.name).join(" & ")}
                      </td>
                      <td className={m.winner === "teamB" ? "team-won" : m.winner === "teamA" ? "team-lost" : m.winner === "draw" ? "team-draw" : ""}>
                        {m.teamB.map((p) => p.name).join(" & ")}
                      </td>
                      <td className="winner-cell">
                        {winnerDisplay ?? <span className="no-result">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </div>
  );
}
