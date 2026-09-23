"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Piece = void 0;
const shared_1 = require("@red-tetris/shared");
class Piece {
    type;
    position;
    rotation = 0; // 0, 1, 2, or 3
    constructor(type, position, rotation = 0) {
        this.type = type;
        this.position = position;
        this.rotation = rotation;
    }
    getType() {
        return this.type;
    }
    getPosition() {
        return this.position;
    }
    getRotation() {
        return this.rotation;
    }
    getCurrentState() {
        return {
            type: this.type,
            position: this.position,
            rotation: this.rotation
        };
    }
    move(board, direction) {
        const newPiece = (0, shared_1.movePiece)(board, this.getCurrentState(), direction);
        if (newPiece) {
            this.position = newPiece.position;
            return true;
        }
        return false;
    }
    rotate(board) {
        const newPiece = (0, shared_1.rotatePiece)(board, this.getCurrentState());
        if (newPiece) {
            this.rotation = newPiece.rotation;
            return true;
        }
        return false;
    }
}
exports.Piece = Piece;
