import { Board, Piece } from './types';
declare function checkCollision(board: Board, piece: Piece): boolean;
declare function movePiece(board: Board, piece: Piece, movement: "right" | "left" | "down"): {
    position: {
        row: number;
        col: number;
    };
    type: import("./types").PieceType;
    rotation: number;
} | null;
declare function rotatePiece(board: Board, piece: Piece): {
    type: import("./types").PieceType;
    position: import("./types").Position;
    rotation: number;
} | null;
declare function mergePieceToBoard(board: Board, piece: Piece): (0 | import("./types").PieceType)[][];
declare function clearLines(board: Board): {
    board: Board;
    linesCleared: number;
};
declare function addPenalityLines(board: Board, lines: number): Board;
export { checkCollision, movePiece, rotatePiece, mergePieceToBoard, clearLines, addPenalityLines };
