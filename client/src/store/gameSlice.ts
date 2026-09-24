import { Piece, Board } from "../../../shared/src/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Player {
	id: string,
	name: string,
	leader: boolean
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
	winnerName: string | null,
	eliminated: boolean,
	leaderId: string | null,
	leaderName: string | null,
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
	winnerName: null,
	eliminated: false,
	leaderId: null,
	leaderName: null,
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

	playerJoined(state, action: PayloadAction<{ id: string; name: string, leader: boolean }>) {
		const existingByName = state.players.find(p => p.name === action.payload.name);
		if (existingByName) {
			// update existing player id and leader flag
			existingByName.id = action.payload.id;
			existingByName.leader = action.payload.leader;
			const opp = state.opponents.find(o => o.name === action.payload.name);
			if (opp) opp.id = action.payload.id;
		} 
		else 
		{
			if (!state.opponents.find(opponent => opponent.id === action.payload.id)) {
				state.opponents.push({ id: action.payload.id, name: action.payload.name, spectrum: [0] });
				state.players.push({ id: action.payload.id, name: action.payload.name, leader: action.payload.leader });
			}
		}
	},

	playerIdUpdated(state, action: PayloadAction<{ oldId: string; newId: string }>) {
		const { oldId, newId } = action.payload;
		for (const p of state.players) {
			if (p.id === oldId) p.id = newId;
		}
		for (const o of state.opponents) {
			if (o.id === oldId) o.id = newId;
		}
	},

    LeaderSet(state, action: PayloadAction<{ leaderId: string | null; leaderName: string | null }>) {
      state.leaderId = action.payload.leaderId;
      state.leaderName = action.payload.leaderName;
    },

	joinedRoom(state, action: PayloadAction<{ roomName: string; playerName: string }>) {
		state.roomName = action.payload.roomName;
		state.playerName = action.payload.playerName;
	},

	gameOver(state, action: PayloadAction<{ winnerId: string | null; winnerName?: string | null }>) {
		state.status = "finished";
		state.isGameOver = true;
		state.winnerId = action.payload.winnerId;
		state.winnerName = action.payload.winnerName ?? null;
	},

	gameReset(state) {
		state.status = "waiting";
		state.score = 0;
		state.board = null;
		state.currentPiece = null;
		state.isGameOver = false;
		state.winnerId = null;
		state.winnerName = null;
		state.eliminated = false;
		state.opponents = state.opponents.map(opponent => ({ ...opponent, spectrum: [] }));
	},
},
});

export const { gameStarted, boardUpdated, spectrumUpdated, playerJoined, joinedRoom, gameOver, gameReset, LeaderSet, playerIdUpdated } = gameSlice.actions;
export default gameSlice.reducer;
