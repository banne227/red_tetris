import { clearLines, mergePieceToBoard } from "../../../shared/src/engine";
import { Board } from "../../../shared/src/types";
import { Piece } from "./Piece";
import { init_board } from "../../../shared/src/board";

class Player {
    private id: string;
    private name: string;
    private board: Board;
    private currentPiece: Piece | null;
    private score: number = 0;
    private sequenceIndex: number;
    private game_over: boolean = false;

    constructor(id: string, name: string, board: Board | null, currentPiece: Piece | null) {
        this.id = id;
        this.name = name;
        this.currentPiece = currentPiece;
        if (board) {
            this.board = board;
        } else {
            this.board = init_board();
        }
        this.sequenceIndex = 0;
    }

    getId (): string {
        return this.id;
    }

    getName (): string {
        return this.name;
    }

    getBoard(): Board {
        return this.board;
    }

    getCurrentPiece(): Piece | null {
        return this.currentPiece;
    }

    getScore(): number {
        return this.score;
    }

    updateBoard(new_board: Board): void {
        this.board = new_board;
    }

    isGameOver(): boolean {
        return this.game_over;
    }

    lockActivePiece(): number {
        const activePiece = this.currentPiece?.getCurrentState();
        if (!activePiece) {
            return 0; // No active piece to lock
        }
        const new_board = mergePieceToBoard(this.board, activePiece);
        const { board, linesCleared } = clearLines(new_board);
        this.board = board;
        this.score += linesCleared * 100;
        return linesCleared;
    }
}

export { Player };