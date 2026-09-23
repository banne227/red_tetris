"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const shared_1 = require("@red-tetris/shared");
const shared_2 = require("@red-tetris/shared");
class Player {
    id;
    name;
    board;
    currentPiece;
    score = 0;
    sequenceIndex;
    game_over = false;
    constructor(id, name, board, currentPiece) {
        this.id = id;
        this.name = name;
        this.currentPiece = currentPiece;
        this.board = board || (0, shared_2.init_board)();
        this.sequenceIndex = 0;
    }
    getId() {
        return this.id;
    }
    getName() {
        return this.name;
    }
    getCurrentPiece() {
        return this.currentPiece;
    }
    getBoard() {
        return this.board;
    }
    updateCurrentPiece(newPiece) {
        this.currentPiece = newPiece;
    }
    getScore() {
        return this.score;
    }
    updateBoard(new_board) {
        this.board = new_board;
    }
    isGameOver() {
        return this.game_over;
    }
    getIndex() {
        return this.sequenceIndex;
    }
    setGameOver() {
        this.game_over = true;
    }
    incrementIndex() {
        this.sequenceIndex++;
    }
    lockActivePiece() {
        const activePiece = this.currentPiece?.getCurrentState();
        if (!activePiece) {
            return 0; // No active piece to lock
        }
        const new_board = (0, shared_1.mergePieceToBoard)(this.board, activePiece);
        const { board, linesCleared } = (0, shared_1.clearLines)(new_board);
        this.board = board;
        this.score += linesCleared * 100;
        this.sequenceIndex++;
        return linesCleared;
    }
    addPenalityLines(lines) {
        const new_board = (0, shared_1.addPenalityLines)(this.board, lines);
        this.board = new_board;
        return new_board;
    }
    movePiece(dir) {
        const piece = this.currentPiece;
        if (piece) {
            return piece.move(this.getBoard(), dir);
        }
        return false;
    }
    rotatePiece() {
        const piece = this.currentPiece;
        if (piece)
            return piece.rotate(this.getBoard());
        return false;
    }
}
exports.Player = Player;
