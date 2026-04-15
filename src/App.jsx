import { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import GamesPage from "./pages/GamesPage";
import SubmitPage from "./pages/SubmitPage";
import AdminPage from "./pages/AdminPage";
import { getGames } from "./services/games";
import { mockGames } from "./data/mockGames";
import Footer from "./components/Footer";

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
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <GamesPage games={games} isLoading={isLoading} loadError={loadError} />
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Navbar theme={theme} toggleTheme={toggleTheme} />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>

        <Footer />
      </div>
    </BrowserRouter>
  );
}