import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import GamePage from "./pages/GamePage";

// Routing SPA : /<room>/<playerName>, comme imposé par le sujet.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/:room/:playerName" element={<GamePage />} />
    </Routes>
  );
}
