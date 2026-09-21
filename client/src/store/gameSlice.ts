import { Game } from "../../../shared/src/models/Game";
import { Player } from "../../../shared/src/models/Game";


interface GameState {
	status: "waiting" | "playing" | "finished",
	roomName: string,
	Players: Player
	opponent: { id:string , name:string, spectrum }
}