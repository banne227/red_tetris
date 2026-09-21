import { addPenalityLines, clearLines, mergePieceToBoard, addPenalityLines as penalty} from "../../../shared/src/engine";
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
        this.board = board || init_board();
        this.sequenceIndex = 0;
    }

    getId (): string {
        return this.id;
    }

    getCurrentPiece(): Piece | null {
        return this.currentPiece;
    }

    getBoard(): Board {
        return this.board;
    }

    updateCurrentPiece(newPiece: Piece | null): void {
        this.currentPiece = newPiece;
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

    getIndex(): number {
        return this.sequenceIndex;
    }

    incrementIndex(): void {
        this.sequenceIndex++;
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
        this.sequenceIndex++;
        return linesCleared;
    }

    addPenalityLines(lines: number): Board {
        const new_board = penalty(this.board, lines);
        this.board = new_board;
        return new_board;
    }

    movePiece(dir: "right" | "left" | "down"): boolean {
        const piece = this.currentPiece;
        if (piece) {
            return piece.move(this.getBoard(), dir)
        }
        return false
    }

    rotatePiece(): boolean {
        const piece = this.currentPiece;
        if (piece) return piece.rotate(this.getBoard())
        return false
    }
}

export { Player };