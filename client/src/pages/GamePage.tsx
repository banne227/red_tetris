import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useGameSocket } from "../hooks/useGameSocket";
import Board from "../components/Board";
import OpponentList from "../components/OpponentList";
import { useState, useEffect } from "react";

export default function GamePage() {
  const { room, playerName } = useParams<{ room: string; playerName: string }>();
  const { startGame, socketRef } = useGameSocket(room || "", playerName || "");

  const status = useSelector((state: RootState) => state.game.status);
  const board = useSelector((state: RootState) => state.game.board);
  const currentPiece = useSelector((state: RootState) => state.game.currentPiece);
  const opponents = useSelector((state: RootState) => state.game.opponents);
  const players = useSelector((state: RootState) => state.game.players);
  const score = useSelector((state: RootState) => state.game.score);
  const eliminated = useSelector((state: RootState) => state.game.eliminated);
  const winnerName = useSelector((state: RootState) => state.game.winnerName);
  const [highScore, setHighScoreState] = useState(() => gettHighScore(playerName || ""));

  useEffect(() => {
    if (eliminated && score > highScore) {
      settHighScore(playerName || "", score);
      setHighScoreState(score);
    }
  }, [eliminated, score, highScore, playerName]);

  function handleStart() {
    startGame();
  }

  function handleRematch() {
    socketRef.current?.emit("rematch", room);
  }

  function settHighScore(playerName: string, score: number): void {
    localStorage.setItem(`highscore_${playerName}`, score.toString());
  }

  function gettHighScore(playerName: string): number {
    const scoreStr = localStorage.getItem(`highscore_${playerName}`);
    return scoreStr ? parseInt(scoreStr, 10) : 0;
  }

  // Écran d'attente : avant que le premier "board" arrive du serveur.
  const leaderId = useSelector((state: RootState) => state.game.leaderId);
  const leaderName = useSelector((state: RootState) => state.game.leaderName);
  const myId = socketRef.current?.id;
  const iAmLeader = myId !== undefined && myId === leaderId;

  function handleTransferLeader(targetId: string) {
    socketRef.current?.emit("transferLeader", room, targetId);
  }

  if (status === "waiting" || !board) {
    return (
      <main className="waiting-page">
        <div className="waiting-card">
          <h1 className="waiting-room-name">{room}</h1>
          <p className="waiting-subtitle">
            Connecté en tant que <strong>{playerName}</strong>
            <p className="waiting-highscore">🏆 Ton record : {highScore}</p>
            {iAmLeader && <span className="leader-badge"> 👑 leader</span>}
          </p>

          <div className="waiting-players">
            <p className="waiting-players-title">
              Joueurs dans la room ({players.length})
            </p>
            <ul className="waiting-players-list">
              {players.map((p) => (
                <li key={p.id} className="waiting-player-item">
                  <span className="waiting-player-dot" />
                  <span className="waiting-player-name">
                    {p.name}
                    {p.id === leaderId && <span className="leader-badge"> 👑</span>}
                  </span>
                  {iAmLeader && p.id !== myId && (
                    <button
                      className="transfer-leader-btn"
                      onClick={() => handleTransferLeader(p.id)}
                    >
                      Rendre leader
                    </button>
                  )}
                </li>
              ))}
              {players.length === 0 && (
                <li className="waiting-player-item waiting-player-item--muted">
                  En attente de connexion...
                </li>
              )}
            </ul>
          </div>

          <div className="waiting-start-buttons">
            <button className="waiting-start-btn" onClick={() => startGame("classic")}>
              Lancer (normal)
            </button>
            <button className="waiting-start-btn waiting-start-btn--hard" onClick={() => startGame("hard")}>
              Lancer (hard)
            </button>
          </div>
          <p className="waiting-hint">
            {leaderName ? `${leaderName} peut démarrer la partie.` : "En attente du leader pour démarrer."}
          </p>
        </div>
      </main>
    );
  }

  const isFinished = status === "finished";

  return (
    <main className="game-page">
      <header className="game-header">
        <h1 className="game-room-name">{room}</h1>
        <p className="game-player-name">{playerName}</p>
        <p className="game-score">Score : {score}</p>
        <p className="game-highscore">Meilleur score : {highScore}</p>
      </header>

      {eliminated && !isFinished && (
        <p className="game-banner game-banner--eliminated">
          Tu as perdu — la partie continue pour les autres joueurs.
        </p>
      )}

      {isFinished && (
        <div className="game-banner game-banner--finished">
          <p className="game-banner-text">
            Partie terminée — {winnerName ? `${winnerName} a gagné !` : "aucun gagnant."}
          </p>
          <button className="rematch-btn" onClick={handleRematch}>
            Rejouer
          </button>
        </div>
      )}

      <div className="game-content">
        <Board board={board} currentPiece={currentPiece} gameOver={eliminated} />
        <OpponentList opponents={opponents} />
      </div>
    </main>
  );
}