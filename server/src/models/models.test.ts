import { describe, expect, it } from "vitest";
import { Game } from "./Game";
import { Piece } from "./Piece";
import { Player } from "./Player";
import { init_board } from "@red-tetris/shared";

function createPlayer(id: string, name = id) {
  return new Player(id, name, null, null);
}

describe("Piece", () => {
  it("moves and rotates when the engine allows it", () => {
    const piece = new Piece("T", { row: 0, col: 4 }, 0);

    expect(piece.move(init_board(), "left")).toBe(true);
    expect(piece.getPosition().col).toBe(3);
    expect(piece.rotate(init_board())).toBe(true);
    expect(piece.getRotation()).toBe(1);
  });

  it("does not move through the floor", () => {
    const piece = new Piece("O", { row: 18, col: 4 }, 0);

    expect(piece.move(init_board(), "down")).toBe(false);
    expect(piece.getPosition().row).toBe(18);
  });
});

describe("Player", () => {
  it("stores board, piece, movement, rotation and penalty state", () => {
    const player = createPlayer("p1", "Alice");
    const piece = new Piece("I", { row: 0, col: 4 }, 0);

    player.updateCurrentPiece(piece);
    expect(player.getId()).toBe("p1");
    expect(player.getName()).toBe("Alice");
    expect(player.movePiece("right")).toBe(true);
    expect(player.rotatePiece()).toBe(true);
    expect(player.getCurrentPiece()).toBe(piece);

    player.addPenalityLines(2);
    expect(player.getBoard()[18].every((cell) => cell === "X")).toBe(true);
    expect(player.getBoard()[19].every((cell) => cell === "X")).toBe(true);
  });

  it("locks a piece, clears a line and updates score", () => {
    const player = createPlayer("p1");
    const board = init_board();
    board[19] = Array(10).fill("I") as typeof board[number];
    board[19][1] = 0;
    board[19][2] = 0;
    player.updateBoard(board);
    player.updateCurrentPiece(new Piece("O", { row: 18, col: 0 }, 0));

    expect(player.lockActivePiece()).toBe(1);
    expect(player.getScore()).toBe(100);
    expect(player.getBoard()[19][1]).toBe("O");
    expect(player.getBoard()[19][2]).toBe("O");
  });

  it("resets itself for a rematch", () => {
    const player = createPlayer("p1");
    player.updateCurrentPiece(new Piece("I", { row: 0, col: 4 }, 0));
    player.setGameOver();
    player.incrementIndex();

    player.rematch();

    expect(player.getCurrentPiece()).toBeNull();
    expect(player.getIndex()).toBe(0);
    expect(player.getScore()).toBe(0);
    expect(player.isGameOver()).toBe(false);
  });
});

describe("Game", () => {
  it("assigns the first player as leader and gives all players the same piece", () => {
    const game = new Game([], "room-1");
    const first = createPlayer("p1");
    const second = createPlayer("p2");

    game.addPlayer(first);
    game.addPlayer(second);
    game.startGame();

    expect(first.isLeader()).toBe(true);
    expect(second.isLeader()).toBe(false);
    expect(game.getState()).toBe("playing");
    expect(first.getCurrentPiece()?.getType()).toBe(second.getCurrentPiece()?.getType());
    expect(first.getBoard()).toHaveLength(20);
  });

  it("applies penalties to every opponent except the attacker", () => {
    const first = createPlayer("p1");
    const second = createPlayer("p2");
    const game = new Game([first, second], "room-1");

    game.applyPenalty(first, 1);

    expect(first.getBoard()[19].every((cell) => cell === 0)).toBe(true);
    expect(second.getBoard()[19].every((cell) => cell === "X")).toBe(true);
  });

  it("selects the last alive player and supports rematch", () => {
    const first = createPlayer("p1");
    const second = createPlayer("p2");
    const game = new Game([first, second], "room-1");
    game.startGame();
    second.setGameOver();

    expect(game.checkGameOver()).toBe(true);
    expect(game.getWinner()).toBe(first);
    expect(game.getState()).toBe("finished");

    game.rematch();

    expect(game.getState()).toBe("waiting");
    expect(game.getWinner()).toBeNull();
    expect(first.isGameOver()).toBe(false);
    expect(first.getCurrentPiece()).toBeNull();
  });

  it("handles the single-player elimination condition", () => {
    const player = createPlayer("p1");
    const game = new Game([player], "room-1");
    player.setGameOver();

    expect(game.checkGameOver()).toBe(true);
    expect(game.getWinner()).toBeNull();
    expect(game.getState()).toBe("finished");

    game.rematch();

    expect(game.getState()).toBe("waiting");
    expect(player.isGameOver()).toBe(false);
  });

  it("rejects negative sequence indexes", () => {
    const game = new Game([], "room-1");

    expect(() => game.getPieceAt(-1)).toThrow("Index cannot be negative");
    expect(game.getPieceAt(8)).toBeTypeOf("string");
  });
});
