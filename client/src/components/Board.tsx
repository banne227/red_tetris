import { Board as BoardType, Piece, mergePieceToBoard } from "@red-tetris/shared";

interface BoardProps {
  // Le board à afficher : les cases déjà verrouillées + la pièce active
  // fusionnée dedans pour l'affichage (fusion faite par l'appelant, pas ici).
  board: BoardType;
  currentPiece?: Piece | null;
  gameOver?: boolean;
}

// Composant purement présentationnel : reçoit une grille déjà calculée,
// se contente de l'afficher en CSS grid (pas de canvas/svg/table).
export default function Board({ board, currentPiece, gameOver }: BoardProps) {
  const displayedBoard = currentPiece ? mergePieceToBoard(board, currentPiece) : board;

  return (
    <div className={`board-grid${gameOver ? " board-grid--over" : ""}`} data-testid="board">
      {displayedBoard.map((row, rowIndex) => (
        <div className="board-row" key={rowIndex}>
          {row.map((cell, colIndex) => (
            <div
              key={colIndex}
              className={`board-cell ${cell !== 0 ? `piece-${cell}` : "board-cell--empty"}`}
            />
          ))}
        </div>
      ))}
      {gameOver && <div className="board-overlay">Game Over</div>}
    </div>
  );
}
