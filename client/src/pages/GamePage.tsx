import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useGameSocket } from "../hooks/useGameSocket";
import Board from "../components/Board";
import OpponentList from "../components/OpponentList";

export default function GamePage() {
  const { room, playerName } = useParams<{ room: string; playerName: string }>();
  const { startGame } = useGameSocket(room || "", playerName || "");

  const status = useSelector((state: RootState) => state.game.status);
  const board = useSelector((state: RootState) => state.game.board);
  const currentPiece = useSelector((state: RootState) => state.game.currentPiece);
  const opponents = useSelector((state: RootState) => state.game.opponents);
  const players = useSelector((state: RootState) => state.game.players);
  const score = useSelector((state: RootState) => state.game.score);
  const eliminated = useSelector((state: RootState) => state.game.eliminated);
  const winnerId = useSelector((state: RootState) => state.game.winnerId);

  function handleStart() {
    startGame();
  }

  // Écran d'attente : avant que le premier "board" arrive du serveur.
  if (status === "waiting" || !board) {
    return (
      <main className="waiting-page">
        <div className="waiting-card">
          <h1 className="waiting-room-name">{room}</h1>
          <p className="waiting-subtitle">
            Connecté en tant que <strong>{playerName}</strong>
          </p>

          <div className="waiting-players">
            <p className="waiting-players-title">
              Joueurs dans la room ({players.length})
            </p>
            <ul className="waiting-players-list">
              {players.map((p) => (
                <li key={p.id} className="waiting-player-item">
                  <span className="waiting-player-dot" />
                  {p.name}
                </li>
              ))}
              {players.length === 0 && (
                <li className="waiting-player-item waiting-player-item--muted">
                  En attente de connexion...
                </li>
              )}
            </ul>
          </div>

          <button className="waiting-start-btn" onClick={handleStart}>
            Lancer la partie
          </button>
          <p className="waiting-hint">N'importe quel joueur de la room peut démarrer.</p>
        </div>
      </main>
    );
  }

  const isFinished = status === "finished";
  const winnerName =
    winnerId === null ? null : players.find((p) => p.id === winnerId)?.name ?? winnerId;

  return (
    <main className="game-page">
      <header className="game-header">
        <h1 className="game-room-name">{room}</h1>
        <p className="game-player-name">{playerName}</p>
        <p className="game-score">Score : {score}</p>
      </header>

      {eliminated && !isFinished && (
        <p className="game-banner game-banner--eliminated">
          Tu as perdu — la partie continue pour les autres joueurs.
        </p>
      )}

      {isFinished && (
        <p className="game-banner game-banner--finished">
          Partie terminée — {winnerName ? `${winnerName} a gagné !` : "aucun gagnant."}
        </p>
      )}

      <div className="game-content">
        <Board board={board} currentPiece={currentPiece} gameOver={eliminated} />
        <OpponentList opponents={opponents} />
      </div>
    </main>
  );
}