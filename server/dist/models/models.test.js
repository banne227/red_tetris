"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const Game_1 = require("./Game");
const Piece_1 = require("./Piece");
const Player_1 = require("./Player");
const shared_1 = require("@red-tetris/shared");
function createPlayer(id, name = id) {
    return new Player_1.Player(id, name, null, null);
}
(0, vitest_1.describe)("Piece", () => {
    (0, vitest_1.it)("moves and rotates when the engine allows it", () => {
        const piece = new Piece_1.Piece("T", { row: 0, col: 4 }, 0);
        (0, vitest_1.expect)(piece.move((0, shared_1.init_board)(), "left")).toBe(true);
        (0, vitest_1.expect)(piece.getPosition().col).toBe(3);
        (0, vitest_1.expect)(piece.rotate((0, shared_1.init_board)())).toBe(true);
        (0, vitest_1.expect)(piece.getRotation()).toBe(1);
    });
    (0, vitest_1.it)("does not move through the floor", () => {
        const piece = new Piece_1.Piece("O", { row: 18, col: 4 }, 0);
        (0, vitest_1.expect)(piece.move((0, shared_1.init_board)(), "down")).toBe(false);
        (0, vitest_1.expect)(piece.getPosition().row).toBe(18);
    });
});
(0, vitest_1.describe)("Player", () => {
    (0, vitest_1.it)("stores board, piece, movement, rotation and penalty state", () => {
        const player = createPlayer("p1", "Alice");
        const piece = new Piece_1.Piece("I", { row: 0, col: 4 }, 0);
        player.updateCurrentPiece(piece);
        (0, vitest_1.expect)(player.getId()).toBe("p1");
        (0, vitest_1.expect)(player.getName()).toBe("Alice");
        (0, vitest_1.expect)(player.movePiece("right")).toBe(true);
        (0, vitest_1.expect)(player.rotatePiece()).toBe(true);
        (0, vitest_1.expect)(player.getCurrentPiece()).toBe(piece);
        player.addPenalityLines(2);
        (0, vitest_1.expect)(player.getBoard()[18].every((cell) => cell === "X")).toBe(true);
        (0, vitest_1.expect)(player.getBoard()[19].every((cell) => cell === "X")).toBe(true);
    });
    (0, vitest_1.it)("locks a piece, clears a line and updates score", () => {
        const player = createPlayer("p1");
        const board = (0, shared_1.init_board)();
        board[19] = Array(10).fill("I");
        board[19][1] = 0;
        board[19][2] = 0;
        player.updateBoard(board);
        player.updateCurrentPiece(new Piece_1.Piece("O", { row: 18, col: 0 }, 0));
        (0, vitest_1.expect)(player.lockActivePiece()).toBe(1);
        (0, vitest_1.expect)(player.getScore()).toBe(100);
        (0, vitest_1.expect)(player.getBoard()[19][1]).toBe("O");
        (0, vitest_1.expect)(player.getBoard()[19][2]).toBe("O");
    });
    (0, vitest_1.it)("resets itself for a rematch", () => {
        const player = createPlayer("p1");
        player.updateCurrentPiece(new Piece_1.Piece("I", { row: 0, col: 4 }, 0));
        player.setGameOver();
        player.incrementIndex();
        player.rematch();
        (0, vitest_1.expect)(player.getCurrentPiece()).toBeNull();
        (0, vitest_1.expect)(player.getIndex()).toBe(0);
        (0, vitest_1.expect)(player.getScore()).toBe(0);
        (0, vitest_1.expect)(player.isGameOver()).toBe(false);
    });
});
(0, vitest_1.describe)("Game", () => {
    (0, vitest_1.it)("assigns the first player as leader and gives all players the same piece", () => {
        const game = new Game_1.Game([], "room-1");
        const first = createPlayer("p1");
        const second = createPlayer("p2");
        game.addPlayer(first);
        game.addPlayer(second);
        game.startGame();
        (0, vitest_1.expect)(first.isLeader()).toBe(true);
        (0, vitest_1.expect)(second.isLeader()).toBe(false);
        (0, vitest_1.expect)(game.getState()).toBe("playing");
        (0, vitest_1.expect)(first.getCurrentPiece()?.getType()).toBe(second.getCurrentPiece()?.getType());
        (0, vitest_1.expect)(first.getBoard()).toHaveLength(20);
    });
    (0, vitest_1.it)("applies penalties to every opponent except the attacker", () => {
        const first = createPlayer("p1");
        const second = createPlayer("p2");
        const game = new Game_1.Game([first, second], "room-1");
        game.applyPenalty(first, 1);
        (0, vitest_1.expect)(first.getBoard()[19].every((cell) => cell === 0)).toBe(true);
        (0, vitest_1.expect)(second.getBoard()[19].every((cell) => cell === "X")).toBe(true);
    });
    (0, vitest_1.it)("selects the last alive player and supports rematch", () => {
        const first = createPlayer("p1");
        const second = createPlayer("p2");
        const game = new Game_1.Game([first, second], "room-1");
        game.startGame();
        second.setGameOver();
        (0, vitest_1.expect)(game.checkGameOver()).toBe(true);
        (0, vitest_1.expect)(game.getWinner()).toBe(first);
        (0, vitest_1.expect)(game.getState()).toBe("finished");
        game.rematch();
        (0, vitest_1.expect)(game.getState()).toBe("waiting");
        (0, vitest_1.expect)(game.getWinner()).toBeNull();
        (0, vitest_1.expect)(first.isGameOver()).toBe(false);
        (0, vitest_1.expect)(first.getCurrentPiece()).toBeNull();
    });
    (0, vitest_1.it)("handles the single-player elimination condition", () => {
        const player = createPlayer("p1");
        const game = new Game_1.Game([player], "room-1");
        player.setGameOver();
        (0, vitest_1.expect)(game.checkGameOver()).toBe(true);
        (0, vitest_1.expect)(game.getWinner()).toBeNull();
    });
    (0, vitest_1.it)("rejects negative sequence indexes", () => {
        const game = new Game_1.Game([], "room-1");
        (0, vitest_1.expect)(() => game.getPieceAt(-1)).toThrow("Index cannot be negative");
        (0, vitest_1.expect)(game.getPieceAt(8)).toBeTypeOf("string");
    });
});
