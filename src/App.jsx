import { useCallback, useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import GamesSection from "./components/GamesSection";
import UploadSection from "./components/UploadSection";
import { getGames } from "./services/games";
import { mockGames } from "./data/mockGames";

export default function App() {
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
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <Hero />
      <GamesSection
        games={games}
        isLoading={isLoading}
        loadError={loadError}
      />
      <UploadSection onGameSubmitted={fetchGames} />
    </div>
  );
}