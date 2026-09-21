import { PieceType } from "../../../shared/src/types";
import { Player, incrementIndex } from "./Player";
import { Piece } from "./Piece";
import { init_board, generateBag } from "../../../shared/src/board";

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
    }

    removePlayer(playerId: string): void {
        this.players = this.players.filter(player => player.getId() !== playerId);
    }

    checkGameOver(): boolean {
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

        player.updateCurrentPiece(new Piece(newPieceType, { row: 0, col: 4 }, 0));
        player.incrementIndex();
        return true;
    }
}

export { Game };