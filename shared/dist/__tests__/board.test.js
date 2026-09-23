import { describe, expect, it } from "vitest";
import { addPenalityLines, checkCollision, clearLines, computeSpectrum, generateBag, init_board, mergePieceToBoard, movePiece, rotatePiece, } from "../index";
const emptyPiece = { type: "O", position: { row: 0, col: 4 }, rotation: 0 };
describe("board helpers", () => {
    it("creates a 20 by 10 board", () => {
        const board = init_board();
        expect(board).toHaveLength(20);
        expect(board.every((row) => row.length === 10)).toBe(true);
        expect(board.flat().every((cell) => cell === 0)).toBe(true);
    });
    it("computes the first occupied height in every column", () => {
        const board = init_board();
        board[17][0] = "I";
        board[10][1] = "T";
        board[19][2] = "Z";
        expect(computeSpectrum(board)).toEqual([3, 10, 1, 0, 0, 0, 0, 0, 0, 0]);
    });
    it("generates a bag containing each historical tetromino once", () => {
        const bag = generateBag();
        expect(bag).toHaveLength(7);
        expect(new Set(bag).size).toBe(7);
        expect(bag).toEqual(expect.arrayContaining(["I", "O", "T", "S", "Z", "J", "L"]));
    });
});
describe("piece engine", () => {
    it("detects walls, floor and occupied cells", () => {
        const board = init_board();
        expect(checkCollision(board, emptyPiece)).toBe(false);
        expect(checkCollision(board, { ...emptyPiece, position: { row: 0, col: -2 } })).toBe(true);
        expect(checkCollision(board, { ...emptyPiece, position: { row: 19, col: 4 } })).toBe(true);
        board[0][5] = "I";
        expect(checkCollision(board, emptyPiece)).toBe(true);
    });
    it("moves left, right and down while rejecting collisions", () => {
        const board = init_board();
        expect(movePiece(board, emptyPiece, "left")?.position.col).toBe(3);
        expect(movePiece(board, emptyPiece, "right")?.position.col).toBe(5);
        expect(movePiece(board, emptyPiece, "down")?.position.row).toBe(1);
        expect(movePiece(board, { ...emptyPiece, position: { row: 18, col: 4 } }, "down")).toBeNull();
    });
    it("drops a piece to the lowest valid position", () => {
        const board = init_board();
        const dropped = movePiece(board, emptyPiece, "drop");
        expect(dropped?.position).toEqual({ row: 18, col: 4 });
    });
    it("rotates a piece and rejects a blocked rotation", () => {
        const board = init_board();
        expect(rotatePiece(board, emptyPiece)?.rotation).toBe(1);
        board[0][5] = "I";
        expect(rotatePiece(board, emptyPiece)).toBeNull();
    });
    it("merges a piece without mutating the original board", () => {
        const board = init_board();
        const merged = mergePieceToBoard(board, emptyPiece);
        expect(merged).not.toBe(board);
        expect(merged[0][5]).toBe("O");
        expect(merged[1][6]).toBe("O");
        expect(board.flat().every((cell) => cell === 0)).toBe(true);
    });
});
describe("line operations", () => {
    it("clears complete normal lines and preserves penalty lines", () => {
        const board = init_board();
        board[19] = Array(10).fill("I");
        board[18] = Array(10).fill("X");
        const result = clearLines(board);
        expect(result.linesCleared).toBe(1);
        expect(result.board).toHaveLength(20);
        expect(result.board[19].every((cell) => cell === "X")).toBe(true);
    });
    it("adds indestructible penalty lines at the bottom", () => {
        const board = init_board();
        board[0][0] = "T";
        const result = addPenalityLines(board, 2);
        expect(result).toHaveLength(20);
        expect(result[18].every((cell) => cell === "X")).toBe(true);
        expect(result[19].every((cell) => cell === "X")).toBe(true);
        expect(result[0][0]).toBe(0);
    });
});
