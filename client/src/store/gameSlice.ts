import { Piece, Board } from "../../../shared/src/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Player {
	id: string,
	name: string,
}

interface GameState {
	status: "waiting" | "playing" | "finished",
	roomName: string,
	playerName: string,
	players: Player[],
	opponents: { id:string , name:string, spectrum: number[] }[],
	score: number,
	board: Board | null,
	currentPiece: Piece | null,
	isGameOver: boolean,
	winnerId: string | null,
	eliminated: boolean
}

const initialState: GameState = {
	status: "waiting",
	roomName: "",
	playerName: "",
	players: [],
	opponents: [],
	score: 0,
	board: null,
	currentPiece: null,
	isGameOver: false,
	winnerId: null,
	eliminated: false
}

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    gameStarted(state) {
      state.status = "playing";
    },

	boardUpdated(state, action: PayloadAction<{ board: Board; currentPiece: Piece | null; score: number, isGameOver: boolean }>) {
		state.board = action.payload.board;
		state.currentPiece = action.payload.currentPiece;
		state.score = action.payload.score;
		state.eliminated = action.payload.isGameOver;
	},

	spectrumUpdated(state, action: PayloadAction<{ id: string; spectrum: number[] }>) {
	state.opponents = state.opponents.map((opponent) =>
		opponent.id === action.payload.id
		? { ...opponent, spectrum: action.payload.spectrum }
		: opponent
	);
	},

	playerJoined(state, action: PayloadAction<{ id: string; name: string }>) {
		if (!state.opponents.find(opponent => opponent.id === action.payload.id)) {
			state.opponents.push({ id: action.payload.id, name: action.payload.name, spectrum: [] });
			state.players.push({ id: action.payload.id, name: action.payload.name });
		}
	},

	joinedRoom(state, action: PayloadAction<{ roomName: string; playerName: string }>) {
		state.roomName = action.payload.roomName;
		state.playerName = action.payload.playerName;
	},

	gameOver(state, action: PayloadAction<{ winnerId: string | null }>) {
		state.status = "finished";
		state.isGameOver = true;
		state.winnerId = action.payload.winnerId;
	}
  },
});

export const { gameStarted, boardUpdated, spectrumUpdated, playerJoined, joinedRoom, gameOver } = gameSlice.actions;
export default gameSlice.reducer;
