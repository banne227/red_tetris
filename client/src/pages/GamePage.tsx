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
  const opponents = useSelector((state: RootState) => state.game.opponents);
  const players = useSelector((state: RootState) => state.game.players);
  const score = useSelector((state: RootState) => state.game.score);
  const currentPiece = useSelector((state: RootState) => state.game.currentPiece);
  const eliminated = useSelector((state: RootState) => state.game.eliminated);
  const winnerId = useSelector((state: RootState) => state.game.winnerId);

  if (!board) {
    return (
      <main className="game-page game-page--loading">
        <p>Connexion a la room {room}...</p>
        {status === "waiting" && (
          <button type="button" onClick={startGame}>
            Demarrer la partie
          </button>
        )}
      </main>
    );
  }

  const isFinished = status === "finished";
  const winPlayer = players.find((p) => p.id === winnerId);
  const winnerName =  winPlayer ? winPlayer.name : null;

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
          Partie terminée — { winnerName === playerName ? "Tu as gagné !" : winnerName ? `${winnerName} a gagné !` : "aucun gagnant."}
        </p>
      )}

      <div className="game-content">
        <Board board={board} currentPiece={currentPiece} gameOver={eliminated} />
        <OpponentList opponents={opponents} />
      </div>
    </main>
  );
}