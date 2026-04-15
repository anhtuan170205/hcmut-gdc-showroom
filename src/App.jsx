import { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import GamePage from "./pages/GamesPage";
import SubmitPage from "./pages/SubmitPage";
import AdminPage from "./pages/AdminPage";
import { getGames } from "./services/games";
import { mockGames } from "./data/mockGames";

function HomePage() {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const fetchGames = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const firestoreGames = await getGames();

      const sortedGames = [...firestoreGames].sort(
        (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
      );

      setGames(sortedGames);
    } catch (error) {
      console.error("Failed to load games:", error);
      setLoadError("Could not load live games. Showing demo games instead.");
      setGames(mockGames);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <GamePage
        games={games}
        isLoading={isLoading}
        loadError={loadError}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/submit" element={<SubmitPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}