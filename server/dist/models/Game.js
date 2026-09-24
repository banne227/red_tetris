"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const shared_1 = require("@red-tetris/shared");
const Piece_1 = require("./Piece");
class Game {
    players;
    states;
    roomId;
    winner;
    sequence;
    constructor(players, roomId) {
        this.players = players;
        this.states = "waiting";
        this.roomId = roomId;
        this.winner = null;
        this.sequence = (0, shared_1.generateBag)();
    }
    getPlayers() {
        return this.players;
    }
    getWinner() {
        return this.winner;
    }
    getState() {
        return this.states;
    }
    getPlayerById(id) {
        return this.players.find(player => player.getId() === id);
    }
    getPieceAt(index) {
        if (index < 0) {
            throw new Error("Index cannot be negative");
        }
        while (index >= this.sequence.length) {
            let new_sequence = this.sequence.concat((0, shared_1.generateBag)());
            this.sequence = new_sequence;
        }
        return this.sequence[index];
    }
    assignPieceToPlayer(player) {
        const type = this.getPieceAt(player.getIndex());
        const piece = new Piece_1.Piece(type, { row: 0, col: 4 }, 0);
        player.updateCurrentPiece(piece);
    }
    startGame() {
        this.states = "playing";
        for (const player of this.players) {
            player.updateBoard((0, shared_1.init_board)());
            this.assignPieceToPlayer(player);
            player.incrementIndex();
        }
    }
    applyPenalty(exceptPlayer, penaltyLines) {
        for (const player of this.players) {
            if (player.getId() !== exceptPlayer.getId()) {
                player.addPenalityLines(penaltyLines);
            }
        }
    }
    addPlayer(player) {
        this.players.push(player);
        if (this.players.length === 1) {
            player.setLeader(true);
        }
    }
    rematch() {
        this.states = "waiting";
        this.winner = null;
        this.sequence = (0, shared_1.generateBag)();
        for (const player of this.players) {
            player.rematch();
        }
    }
    removePlayer(playerId) {
        let wasLeader = false;
        if (this.getPlayerById(playerId)?.isLeader()) {
            wasLeader = true;
        }
        this.players = this.players.filter(player => player.getId() !== playerId);
        if (wasLeader && this.players.length > 0) {
            this.players[0].setLeader(true);
        }
    }
    checkGameOver() {
        if (this.players.length < 2) {
            if (this.players.length === 1) {
                if (this.players[0].isGameOver()) {
                    this.states = "finished";
                    this.winner = null;
                    return true;
                }
                return false;
            }
            return false;
        }
        let player_alive = 0;
        for (const player of this.players) {
            if (!player.isGameOver()) {
                player_alive++;
            }
        }
        if (player_alive <= 1) {
            this.states = "finished";
            for (const player of this.players) {
                if (!player.isGameOver()) {
                    this.winner = player;
                }
            }
            return true;
        }
        return false;
    }
    getNextPiece(player) {
        const index = player.getIndex();
        const newPieceType = this.getPieceAt(index);
        const newPiece = new Piece_1.Piece(newPieceType, { row: 0, col: 4 }, 0);
        if ((0, shared_1.checkCollision)(player.getBoard(), newPiece.getCurrentState())) {
            player.setGameOver();
            return false;
        }
        player.updateCurrentPiece(new Piece_1.Piece(newPieceType, { row: 0, col: 4 }, 0));
        player.incrementIndex();
        return true;
    }
}
exports.Game = Game;
