import { Board, PieceType } from "./types";

function computeSpectrum(board: Board): number[] {
    let spectrum = new Array(board[0].length).fill(0);
    for (let col = 0; col < board[0].length; col++) {
        for (let row = 0; row < board.length; row++) {
            if (board[row][col] !== 0 && spectrum[col] === 0) {
                spectrum[col] = board.length - row;
                break;
            }
        }
    }
    return spectrum;
}

function init_board(): Board {
    const rows = 20;
    const cols = 10;
    const board: Board = [];
    for (let i = 0; i < rows; i++) {
        board.push(new Array(cols).fill(0));
    }
    return board;
}

function generateBag(): PieceType[] {
    const pieceTypes: PieceType[] = ["I", "O", "T", "S", "Z", "J", "L"];
    for (let i = pieceTypes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pieceTypes[i], pieceTypes[j]] = [pieceTypes[j], pieceTypes[i]];
    }
    return pieceTypes;
}

export { init_board, computeSpectrum, generateBag };