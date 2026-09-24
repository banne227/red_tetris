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
            socket?.emit("board", player.getBoard(), player.getCurrentPiece()?.getCurrentState(), player.getScore(), player.isGameOver())
        }
        if (game.checkGameOver()) {
            io.to(roomId).emit("gameOver", game.getWinner()?.getId(), game.getWinner()?.getName());
            clearInterval(interval); // stop the interval when the game is over
        }
    }, timer)
}

function emitBoard(socket: any, player: Player) {
    socket.emit("board", player.getBoard(), player.getCurrentPiece()?.getCurrentState(), player.getScore(), player.isGameOver())
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
            console.log(`Room ${roomId} created`);
        }
        if (game.getState() !== "waiting") {
            socket.emit("error", "Game already started");
            return;
        }
        const existingPlayers = game.getPlayers();
        for (const existingPlayer of existingPlayers) {
            socket.emit("playerJoined", existingPlayer.getId(), existingPlayer.getName(), existingPlayer.isLeader());
            socket.emit("spectrum", existingPlayer.getId(), computeSpectrum(existingPlayer.getBoard()));
        }

        //reconnection 
        const existingByName = game.getPlayers().find(p => p.getName() === playerName);
        if (existingByName) {
            const oldId = existingByName.getId();
            existingByName.setId(socket.id);
            const currentLeader = game.getPlayers().find(p => p.isLeader());
            socket.emit("setLeader", currentLeader ? currentLeader.getId() : null, currentLeader ? currentLeader.getName() : null);
            socket.join(roomId);
            io.to(roomId).emit("playerIdUpdated", oldId, socket.id);
            socket.emit("spectrum", existingByName.getId(), computeSpectrum(existingByName.getBoard()));
            console.log(`${playerName} reconnected to room ${roomId} (old id: ${oldId})`);
            return;
        }

        const player = new Player(socket.id, playerName, null, null);
        game.addPlayer(player);
        const currentLeader = game.getPlayers().find(p => p.isLeader());
        socket.emit("setLeader", currentLeader ? currentLeader.getId() : null, currentLeader ? currentLeader.getName() : null);
        socket.join(roomId);
        socket.to(roomId).emit("playerJoined", socket.id, playerName, player.isLeader());
        console.log(`${playerName} joined room ${roomId}`);
    });

    socket.on("startGame", (roomId: string) => {
        const game = rooms.get(roomId);
        const players = game?.getPlayers();
        const player = players?.find(p => p.getId() === socket.id);
        if (game && player && game.getState() === "waiting" && player.isLeader()) {
            game.startGame();
            io.to(roomId).emit("gameStarted");
            for (const roomPlayer of game.getPlayers()) {
                const roomSocket = io.sockets.sockets.get(roomPlayer.getId());
                if (roomSocket) emitBoard(roomSocket, roomPlayer);
            }
            startGameLoop(game, roomId);
        }
    });

    socket.on("move", (roomId:string, dir: "right" | "left" | "down" | "drop") => {
        const game = rooms.get(roomId);
        const players = game?.getPlayers();
        const player = players?.find(p => p.getId() === socket.id);
        if (!player) return
        if (player.isGameOver() || game?.getState() !== "playing") return
        const result = player?.movePiece(dir)

        if (!result && dir == "down" && game) {
            onPieceLocked(socket, game, player, roomId)
        }
        // if (!result && dir == "drop" && game) {
        //     onPieceLocked(socket, game, player, roomId)
        // }
        emitBoard(socket, player)
    })

    socket.on("rotate", (roomId:string) => {
        const game = rooms.get(roomId);
        const players = game?.getPlayers();
        const player = players?.find(p => p.getId() === socket.id);
        if (!player) return
        if (player.isGameOver() || game?.getState() !== "playing") return
        player.rotatePiece()
        emitBoard(socket, player)
    })

    socket.on("rematch", (roomId:string) => {
        const game = rooms.get(roomId);
        const players = game?.getPlayers();
        const player = players?.find(p => p.getId() === socket.id);
        if (game?.getState() !== "finished" || !player || !players) return

        game?.rematch()

        for (const p of players) {
            const playerSocket = io.sockets.sockets.get(p.getId());
            playerSocket?.emit("gameReset");
            emitBoard(playerSocket, p)
        }
    })

    socket.on("transferLeader", (roomId:string, targetId:string) => {
        const game = rooms.get(roomId);
        const players = game?.getPlayers();
        const player = players?.find(p => p.getId() === socket.id);
        const targetPlayer = players?.find(p => p.getId() === targetId);
        if (!game || !player || !targetPlayer) return
        if (!player.isLeader()) return

        player.setLeader(false)
        targetPlayer.setLeader(true)

        io.to(roomId).emit("setLeader", targetPlayer.getId(), targetPlayer.getName());
    })
}
);



const clientDistPath = path.join(__dirname, "../../client/dist");

app.use(express.static(clientDistPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});