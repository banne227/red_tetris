import { Board, Piece} from "../../../shared/src/types";
import { Player } from "./Player";
import { init_board } from "../../../shared/src/board";

class Game {
    private players: Player[];
    private states: "waiting" | "playing" | "finished";
    private roomId: string;
    private winner: Player | null;
    public sequence: string[];

    constructor(players: Player[], roomId: string) {
        this.players = players;
        this.states = "waiting";
        this.roomId = roomId;
        this.winner = null;
        this.sequence = [];
    }

}
