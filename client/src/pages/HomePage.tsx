import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [room, setRoom] = useState("");
  const [playerName, setPlayerName] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!room.trim() || !playerName.trim()) return;
    navigate(`/${room.trim()}/${playerName.trim()}`);
  }

  return (
    <main className="home-page">
      <div className="home-card">
        <h1 className="home-title">Red Tetris</h1>
        <p className="home-subtitle">Rejoins ou crée une partie</p>
        <form className="home-form" onSubmit={handleSubmit}>
          <label className="home-field">
            <span>Room</span>
            <input
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="ex: room1"
              autoFocus
            />
          </label>
          <label className="home-field">
            <span>Pseudo</span>
            <input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="ex: Baidy"
            />
          </label>
          <button type="submit" className="home-submit">
            Rejoindre la partie
          </button>
        </form>
      </div>
    </main>
  );
}
