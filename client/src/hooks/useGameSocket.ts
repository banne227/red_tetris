import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { Socket } from "socket.io-client";
import { boardUpdated, playerJoined, gameStarted, joinedRoom, spectrumUpdated, gameOver } from "../store/gameSlice";
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
}

export function useGameSocket(roomName: string, playerName: string) {
  const dispatch = useDispatch();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    dispatch(joinedRoom({ roomName, playerName }));
    socket.emit("joinRoom", roomName, playerName);


    const onKeyDown = (event: KeyboardEvent) => handleKey(event, socketRef, roomName);
    window.addEventListener("keydown", onKeyDown);

    socket.on("gameOver", (winnerId: string) => {
        if (winnerId === socket.id) {
            alert("You won!");
        } else {
            alert("You lost!");
        }
        dispatch(gameOver({ winnerId }));
    });

    socket.on("board", (board, currentPiece, score: number) => {
        dispatch(boardUpdated({ board, currentPiece, score }));
    });

    socket.on("playerJoined", (newPlayerId: string, newPlayerName: string) => {
        dispatch( playerJoined({ id: newPlayerId, name: newPlayerName }) );
    });

    socket.on("gameStarted", () => {
        dispatch( gameStarted() );
    });

    socket.on("spectrum", (id: string, spectrum: number[]) => {
        dispatch( spectrumUpdated({ id, spectrum }) );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
        window.removeEventListener("keydown", onKeyDown)
    };
  }, [roomName, playerName, dispatch]);

  return socketRef;
}