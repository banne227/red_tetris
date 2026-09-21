import { useParams } from "react-router-dom";
import Board from "../components/Board";
import OpponentList from "../components/OpponentList";
// TODO (toi) : import useSelector depuis react-redux, RootState depuis
// ../store/store, et ton hook useGameSocket depuis ../hooks/useGameSocket.

export default function GamePage() {
  const { room, playerName } = useParams<{ room: string; playerName: string }>();

  // TODO (toi) : appeler ton hook ici, ex. useGameSocket(room, playerName)
  // pour établir la connexion socket.io et démarrer l'écoute des events.

  // TODO (toi) : lire depuis le store Redux (useSelector) : le board à
  // afficher, la liste des adversaires (avec leur spectre), le score,
  // si la partie est terminée, etc. Remplace les valeurs ci-dessous par
  // tes vraies données une fois le store branché.
  const board = null; // <- useSelector((state: RootState) => state.game.board)
  const opponents: { id: string; name: string; spectrum: number[] }[] = [];
  const score = 0;
  const isGameOver = false;

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
