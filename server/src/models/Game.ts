import { PieceType, generateBag, init_board, checkCollision } from "@red-tetris/shared";
import { Player } from "./Player";
import { Piece } from "./Piece";

class Game {
    private players: Player[];
    private states: "waiting" | "playing" | "finished";
    private roomId: string;
    private winner: Player | null;
    private sequence: PieceType[];

    constructor(players: Player[], roomId: string) {
        this.players = players;
        this.states = "waiting";
        this.roomId = roomId;
        this.winner = null;
        this.sequence = generateBag();
    }

    getPlayers(): Player[] {
        return this.players;
    }

    getWinner(): Player | null {
        return this.winner;
    }

    getState(): "waiting" | "playing" | "finished" {
        return this.states;
    }

    getPieceAt(index:number): PieceType {
        if (index < 0) {
            throw new Error("Index cannot be negative");
        }
        while (index >= this.sequence.length) {
            let new_sequence = this.sequence.concat(generateBag());
            this.sequence = new_sequence;
        }
        return this.sequence[index];
    }

    assignPieceToPlayer(player: Player): void {
        const type = this.getPieceAt(player.getIndex());
        const piece = new Piece(type, { row: 0, col: 4 }, 0);
        player.updateCurrentPiece(piece);
    } 
    
    startGame() {
        this.states = "playing";
        for (const player of this.players) {
            player.updateBoard(init_board());
            this.assignPieceToPlayer(player);
            player.incrementIndex();
        }
    }

    applyPenalty(exceptPlayer: Player, penaltyLines: number) {
        for (const player of this.players) {
            if (player.getId() !== exceptPlayer.getId()) {
                player.addPenalityLines(penaltyLines);
            }
        }
    }

    addPlayer(player: Player): void {
        this.players.push(player);
        if (this.players.length === 1) {
            player.setLeader(true);
        }
    }

    rematch() {
        this.states = "waiting";
        this.winner = null;
        this.sequence = generateBag();
        for (const player of this.players) {
            player.rematch();
        }
    }

    removePlayer(playerId: string): void {
        this.players = this.players.filter(player => player.getId() !== playerId);
    }

    checkGameOver(): boolean {
        if (this.players.length < 2) {
            if (this.players.length === 1) {
                return (this.players[0].isGameOver());
            }
            return false;
        }

        let player_alive = 0
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

    getNextPiece(player: Player): boolean {
        const index = player.getIndex()
        const newPieceType = this.getPieceAt(index)

          const newPiece = new Piece(newPieceType, { row: 0, col: 4 }, 0);
        if (checkCollision(player.getBoard(), newPiece.getCurrentState())) {
            player.setGameOver();
            return false;
        }
        player.updateCurrentPiece(new Piece(newPieceType, { row: 0, col: 4 }, 0));
        player.incrementIndex();
        return true;
    }
}

export { Game };