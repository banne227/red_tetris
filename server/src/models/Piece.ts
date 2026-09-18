import {movePiece, rotatePiece} from "../../../shared/src/engine";
import { PieceType, Board, Position } from "../../../shared/src/types";

class Piece {
    private type: PieceType;
    private position: Position;
    private rotation: number = 0; // 0, 1, 2, or 3

    constructor(type: PieceType, position: Position, rotation: number = 0) {
        this.type = type;
        this.position = position;
        this.rotation = rotation;
    }

    getType(): PieceType {
        return this.type;
    }

    getPosition(): Position {
        return this.position;
    }

    getRotation(): number {
        return this.rotation;
    }

    getCurrentState(): { type: PieceType; position: Position; rotation: number } {
        return {
            type: this.type,
            position: this.position,
            rotation: this.rotation
        };
    }

    move(board: Board, direction: "right" | "left" | "down"): boolean {
        const newPiece = movePiece(board, this.getCurrentState(), direction);
        if (newPiece) {
            this.position = newPiece.position;
            return true;
        }
        return false;
    }

    rotate(board: Board): boolean {
        const newPiece = rotatePiece(board, this.getCurrentState());
        if (newPiece) {
            this.rotation = newPiece.rotation;
            return true;
        }
        return false;
    }
}

export { Piece };