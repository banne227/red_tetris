import { Board, PieceType } from "./types";
declare function computeSpectrum(board: Board): number[];
declare function init_board(): Board;
declare function generateBag(): PieceType[];
export { init_board, computeSpectrum, generateBag };
