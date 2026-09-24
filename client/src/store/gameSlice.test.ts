import { describe, expect, it } from "vitest";
import reducer, {
  boardUpdated,
  gameOver,
  gameStarted,
  joinedRoom,
  playerJoined,
  spectrumUpdated,
} from "./gameSlice";

const board = Array.from({ length: 20 }, () => Array(10).fill(0));
const currentPiece = { type: "T" as const, position: { row: 0, col: 4 }, rotation: 0 };

function state() {
  return reducer(undefined, { type: "init" });
}

describe("game reducer", () => {
  it("stores room identity", () => {
    const result = reducer(state(), joinedRoom({ roomName: "room-1", playerName: "Alice" }));

    expect(result.roomName).toBe("room-1");
    expect(result.playerName).toBe("Alice");
  });

  it("tracks joined players without duplicates", () => {
    const first = reducer(state(), playerJoined({ id: "p1", name: "Alice", leader: true }));
    const second = reducer(first, playerJoined({ id: "p1", name: "Alice", leader: true }));

    expect(second.players).toEqual([{ id: "p1", name: "Alice" }]);
    expect(second.opponents).toEqual([{ id: "p1", name: "Alice", spectrum: [] }]);
  });

  it("changes to playing and stores board updates", () => {
    const playing = reducer(state(), gameStarted());
    const result = reducer(
      playing,
      boardUpdated({ board, currentPiece, score: 250, isGameOver: false })
    );

    expect(result.status).toBe("playing");
    expect(result.board).toBe(board);
    expect(result.currentPiece).toBe(currentPiece);
    expect(result.score).toBe(250);
    expect(result.eliminated).toBe(false);
  });

  it("updates only the matching opponent spectrum", () => {
    let current = reducer(state(), playerJoined({ id: "p1", name: "Alice", leader: true }));
    current = reducer(current, playerJoined({ id: "p2", name: "Bob", leader: true }));
    const result = reducer(current, spectrumUpdated({ id: "p2", spectrum: [1, 2, 3] }));

    expect(result.opponents[0].spectrum).toEqual([]);
    expect(result.opponents[1].spectrum).toEqual([1, 2, 3]);
  });

  it("stores elimination and game winner state", () => {
    const eliminated = reducer(
      state(),
      boardUpdated({ board, currentPiece: null, score: 0, isGameOver: true })
    );
    const finished = reducer(eliminated, gameOver({ winnerId: "p2", winnerName: "Bob" }));

    expect(finished.eliminated).toBe(true);
    expect(finished.isGameOver).toBe(true);
    expect(finished.status).toBe("finished");
    expect(finished.winnerId).toBe("p2");
    expect(finished.winnerName).toBe("Bob");
  });
});
