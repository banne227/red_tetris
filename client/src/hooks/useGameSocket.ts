import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { Socket } from "socket.io-client";
import { boardUpdated, playerJoined, playerIdUpdated, gameStarted, joinedRoom, spectrumUpdated, gameOver, gameReset, LeaderSet } from "../store/gameSlice";
import { useRef } from "react";


function handleKey(event: KeyboardEvent, socketRef: React.MutableRefObject<Socket | null>, roomName: string) {
    if (event.key === "ArrowLeft") {
        socketRef.current?.emit("move", roomName, "left");
    }
    if (event.key === "ArrowRight") {
        socketRef.current?.emit("move", roomName, "right");
    }
    if (event.key === "ArrowDown") {
        socketRef.current?.emit("move", roomName, "down");
    }
    if (event.key === "ArrowUp") {
        socketRef.current?.emit("rotate", roomName);
    }
    if (event.key === " ") {
        socketRef.current?.emit("move", roomName, "drop");
    }
}

export function useGameSocket(roomName: string, playerName: string) {
  const dispatch = useDispatch();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    dispatch(joinedRoom({ roomName, playerName }));

    const onKeyDown = (event: KeyboardEvent) => handleKey(event, socketRef, roomName);
    window.addEventListener("keydown", onKeyDown);

    socket.on("gameOver", (winnerId: string | null, winnerName?: string | null) => {
        dispatch(gameOver({ winnerId, winnerName: winnerName ?? null }));
    });

    socket.on("board", (board, currentPiece, score: number, isGameOver: boolean) => {
        dispatch(boardUpdated({ board, currentPiece, score, isGameOver }));
    });

    socket.on("playerJoined", (newPlayerId: string, newPlayerName: string, leader: boolean) => {
        console.log(`Player joined: ${newPlayerName} (ID: ${newPlayerId})`);
        dispatch( playerJoined({ id: newPlayerId, name: newPlayerName, leader }) );
    });

    // If the server notifies that a player's socket id changed (reconnect), update store
    socket.on("playerIdUpdated", (oldId: string, newId: string) => {
        // Update ids in the store for reconnects
        dispatch(playerIdUpdated({ oldId, newId }));
    });

    socket.on("gameStarted", () => {
        dispatch( gameStarted() );
    });

    socket.on("spectrum", (id: string, spectrum: number[]) => {
        dispatch( spectrumUpdated({ id, spectrum }) );
    });

    socket.on("gameReset", () => {
        dispatch(gameReset());
    });

    socket.on("setLeader", (leaderId: string | null, leaderName: string | null) => {
        dispatch(LeaderSet({ leaderId, leaderName }));
    });

    socket.emit("joinRoom", roomName, playerName);

    return () => {
      socket.disconnect();
      socketRef.current = null;
        window.removeEventListener("keydown", onKeyDown)
    };
  }, [roomName, playerName, dispatch]);

    function startGame(mode: "classic" | "hard" = "classic") {
        socketRef.current?.emit("startGame", roomName, mode);
    }

    return { socketRef, startGame };
}