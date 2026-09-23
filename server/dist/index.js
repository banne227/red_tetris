"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const Game_1 = require("./models/Game");
const Player_1 = require("./models/Player");
const shared_1 = require("@red-tetris/shared");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app); // le serveur HTTP "brut" est construit à PARTIR de l'app Express
const io = new socket_io_1.Server(httpServer); // socket.io s'attache au MÊME serveur HTTP
httpServer.listen(3000, () => {
    console.log("Server is running on port 3000");
});
let rooms = new Map();
function onPieceLocked(socket, game, player, roomId) {
    const linesCleared = player.lockActivePiece();
    if (linesCleared > 1)
        game.applyPenalty(player, linesCleared - 1);
    socket?.to(roomId).emit("spectrum", socket.id, (0, shared_1.computeSpectrum)(player.getBoard()));
    game.getNextPiece(player);
}
function startGameLoop(game, roomId) {
    let timer = 1000;
    const interval = setInterval(() => {
        const players = game.getPlayers();
        for (const player of players) {
            const socket = io.sockets.sockets.get(player.getId());
            if (player.isGameOver())
                continue;
            const result = player.movePiece("down");
            if (!result) {
                onPieceLocked(socket, game, player, roomId);
            }
            socket?.emit("board", player.getBoard(), player.getCurrentPiece()?.getCurrentState(), player.getScore(), player.isGameOver());
        }
        if (game.checkGameOver()) {
            io.to(roomId).emit("gameOver", game.getWinner()?.getId());
            clearInterval(interval); // stop the interval when the game is over
        }
    }, timer);
}
function emitBoard(socket, player) {
    socket.emit("board", player.getBoard(), player.getCurrentPiece()?.getCurrentState(), player.getScore(), player.isGameOver());
}
io.on("connection", (socket) => {
    console.log("A user connected");
    socket.on("disconnect", () => {
        for (const [roomId, game] of rooms) {
            if (game.getPlayers().find(player => player.getId() === socket.id)) {
                game.removePlayer(socket.id);
                if (game.getPlayers().length === 0) {
                    rooms.delete(roomId);
                }
            }
        }
        console.log("A user disconnected");
    });
    socket.on("joinRoom", (roomId, playerName) => {
        let game = rooms.get(roomId);
        if (!game) {
            game = new Game_1.Game([], roomId);
            rooms.set(roomId, game);
            console.log(`Room ${roomId} created`);
        }
        if (game.getState() !== "waiting") {
            socket.emit("error", "Game already started");
            return;
        }
        const player = new Player_1.Player(socket.id, playerName, null, null);
        game.addPlayer(player);
        socket.join(roomId);
        socket.to(roomId).emit("playerJoined", socket.id, playerName);
        console.log(`${playerName} joined room ${roomId}`);
    });
    socket.on("startGame", (roomId) => {
        const game = rooms.get(roomId);
        const players = game?.getPlayers();
        const player = players?.find(p => p.getId() === socket.id);
        if (game && player && game.getState() === "waiting") {
            game.startGame();
            io.to(roomId).emit("gameStarted");
            for (const roomPlayer of game.getPlayers()) {
                const roomSocket = io.sockets.sockets.get(roomPlayer.getId());
                if (roomSocket)
                    emitBoard(roomSocket, roomPlayer);
            }
            startGameLoop(game, roomId);
        }
    });
    socket.on("move", (roomId, dir) => {
        const game = rooms.get(roomId);
        const players = game?.getPlayers();
        const player = players?.find(p => p.getId() === socket.id);
        if (!player)
            return;
        const result = player?.movePiece(dir);
        if (!result && dir == "down" && game) {
            onPieceLocked(socket, game, player, roomId);
        }
        emitBoard(socket, player);
    });
    socket.on("rotate", (roomId) => {
        const game = rooms.get(roomId);
        const players = game?.getPlayers();
        const player = players?.find(p => p.getId() === socket.id);
        if (!player)
            return;
        player.rotatePiece();
        emitBoard(socket, player);
    });
});
const clientDistPath = path_1.default.join(__dirname, "../../client/dist");
app.use(express_1.default.static(clientDistPath));
app.get("*", (req, res) => {
    res.sendFile(path_1.default.join(clientDistPath, "index.html"));
});
