type PieceType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

type CellValue = 0 | PieceType;

type Board = CellValue[][];

type Position = {
    row: number;
    col: number;
};

type Piece = {
    type: PieceType;
    position: Position;
    rotation: number; // 0, 1, 2, or 3
};

export { PieceType, Board, Position, Piece };