import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { Game } from "./models/Game";
import { Player } from "./models/Player";
import { computeSpectrum } from "@red-tetris/shared";

const app = express();
const httpServer = createServer(app); // le serveur HTTP "brut" est construit à PARTIR de l'app Express
const io = new Server(httpServer);    // socket.io s'attache au MÊME serveur HTTP

httpServer.listen(3000, () => {
  console.log("Server is running on port 3000");
});

let rooms: Map<string, Game> = new Map();

function onPieceLocked(socket: any, game: Game, player: Player, roomId: string) {
    const linesCleared = player.lockActivePiece()
    if (linesCleared > 1) game.applyPenalty(player, linesCleared - 1)
    socket?.to(roomId).emit("spectrum", socket.id, computeSpectrum(player.getBoard()))
    game.getNextPiece(player)
}

function startGameLoop(game: Game, roomId: string) {
    let timer = 1000
    const interval = setInterval(() => {
        const players = game.getPlayers();
        for (const player of players) {
            const socket = io.sockets.sockets.get(player.getId());
            if (player.isGameOver()) continue;
            const result = player.movePiece("down")
            if (!result) {
                onPieceLocked(socket, game, player, roomId)
            }
            socket?.emit("board", player.getBoard(), player.getCurrentPiece()?.getCurrentState(), player.getScore())
        }
        if (game.checkGameOver()) {
            io.to(roomId).emit("gameOver", game.getWinner()?.getId());
            clearInterval(interval); // stop the interval when the game is over
        }
    }, timer)
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

    socket.on("joinRoom", (roomId: string, playerName: string) => {
        let game = rooms.get(roomId);
        if (!game) {
            game = new Game([], roomId);
            rooms.set(roomId, game);
        }
        const player = new Player(socket.id, playerName, null, null);
        game.addPlayer(player);
        socket.join(roomId);
        socket.to(roomId).emit("playerJoined", socket.id, playerName);
        console.log(`${playerName} joined room ${roomId}`);
    });

    socket.on("startGame", (roomId: string) => {
        const game = rooms.get(roomId);
        const players = game?.getPlayers();
        const player = players?.find(p => p.getId() === socket.id);
        if (game && player) {
            game.startGame();
            io.to(roomId).emit("gameStarted");
            startGameLoop(game, roomId);
        }
    });

    socket.on("move", (roomId:string, dir: "right" | "left" | "down") => {
        const game = rooms.get(roomId);
        const players = game?.getPlayers();
        const player = players?.find(p => p.getId() === socket.id);
        if (!player) return
        const result = player?.movePiece(dir)

        if (!result && dir == "down" && game) {
            onPieceLocked(socket, game, player, roomId)
        }
        socket.emit("board", player.getBoard(), player.getCurrentPiece()?.getCurrentState(), player.getScore())
    })

    socket.on("rotate", (roomId:string) => {
        const game = rooms.get(roomId);
        const players = game?.getPlayers();
        const player = players?.find(p => p.getId() === socket.id);
        if (!player) return
        
        player.rotatePiece()
        socket.emit("board", player.getBoard(), player.getCurrentPiece()?.getCurrentState(), player.getScore())
    })
}
);



const clientDistPath = path.join(__dirname, "../../client/dist");

app.use(express.static(clientDistPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});