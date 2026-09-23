import { useParams } from "react-router-dom";
import Board from "../components/Board";
import OpponentList from "../components/OpponentList";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useGameSocket } from "../hooks/useGameSocket";

export default function GamePage() {
  const { room, playerName } = useParams<{ room: string; playerName: string }>();

  useGameSocket(room || "", playerName || "");

  const board = useSelector((state: RootState) => state.game.board);
  const opponents = useSelector((state: RootState) => state.game.opponents);
  const score = useSelector((state: RootState) => state.game.score);
  const isGameOver = useSelector((state: RootState) => state.game.isGameOver);

  if (!board) {
    return <main className="game-page game-page--loading">Connexion...</main>;
  }

  return (
    <main className="game-page">
      <header className="game-header">
        <h1 className="game-room-name">{room}</h1>
        <p className="game-player-name">{playerName}</p>
        <p className="game-score">Score : {score}</p>
      </header>
      <div className="game-content">
        <Board board={board} gameOver={isGameOver} />
        <OpponentList opponents={opponents} />
      </div>
    </main>
  );
}
