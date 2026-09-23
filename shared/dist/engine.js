import { TETROMINO_SHAPES } from './tetrominoes';
function checkCollision(board, piece) {
    const shape = TETROMINO_SHAPES[piece.type][piece.rotation];
    for (const [rowShape, colShape] of shape) {
        const rowBoard = piece.position.row + rowShape;
        const colBoard = piece.position.col + colShape;
        if (rowBoard >= board.length || colBoard < 0 || colBoard >= board[0].length) {
            return true; // Collision detected
        }
        if (rowBoard < 0) {
            continue; // Ignore cells above the board
        }
        if (board[rowBoard][colBoard] !== 0) {
            return true; // Collision detected
        }
    }
    return false; // No collision detected
}
function dropPiece(board, piece) {
    let newPosition = { ...piece.position };
    while (true) {
        newPosition.row += 1;
        let newPiece = { ...piece, position: newPosition };
        if (checkCollision(board, newPiece)) {
            break; // Stop if collision detected
        }
    }
    return { ...piece, position: { row: newPosition.row - 1, col: newPosition.col } }; // Return the last valid position
}
function movePiece(board, piece, movement) {
    let newPosition = { ...piece.position };
    if (movement === "right")
        newPosition.col += 1;
    else if (movement === "left")
        newPosition.col -= 1;
    else if (movement === "drop")
        return dropPiece(board, piece);
    else if (movement === "down")
        newPosition.row += 1;
    let newPiece = { ...piece, position: newPosition };
    if (!checkCollision(board, newPiece)) {
        return newPiece;
    }
    return null;
}
function rotatePiece(board, piece) {
    const newRotation = (piece.rotation + 1) % 4;
    let newPiece = { ...piece };
    newPiece.rotation = newRotation;
    if (!checkCollision(board, newPiece)) {
        return newPiece; // Update the piece's rotation if no collision
    }
    return null; // Return the original rotation if collision detected
}
function mergePieceToBoard(board, piece) {
    const shape = TETROMINO_SHAPES[piece.type][piece.rotation];
    let new_board = [];
    for (let row = 0; row < board.length; row++) {
        new_board[row] = [...board[row]];
    }
    for (const [rowShape, colShape] of shape) {
        const rowBoard = piece.position.row + rowShape;
        const colBoard = piece.position.col + colShape;
        if (rowBoard >= 0 && rowBoard < board.length && colBoard >= 0 && colBoard < board[0].length) {
            new_board[rowBoard][colBoard] = piece.type;
        }
    }
    return new_board;
}
function clearLines(board) {
    let new_board = [];
    for (let row = 0; row < board.length; row++) {
        new_board[row] = [...board[row]];
    }
    let linesCleared = 0;
    for (let row = board.length - 1; row >= 0; row--) {
        if (new_board[row].every(cell => cell !== 0 && cell !== 'X')) {
            new_board.splice(row, 1); // Remove the filled line
            new_board.unshift(Array(new_board[0].length).fill(0)); // Add a new empty line at the top
            row++; // Check the same row again since it has new content
            linesCleared++;
        }
    }
    return { board: new_board, linesCleared };
}
function addPenalityLines(board, lines) {
    let new_board = [];
    for (let row = 0; row < board.length; row++) {
        new_board[row] = [...board[row]];
    }
    for (let i = 0; i < lines; i++) {
        new_board.shift(); // Remove the top line
        new_board.push(Array(new_board[0].length).fill('X'));
    }
    return new_board;
}
export { checkCollision, movePiece, rotatePiece, mergePieceToBoard, clearLines, addPenalityLines };
