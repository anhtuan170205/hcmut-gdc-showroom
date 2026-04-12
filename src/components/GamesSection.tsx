import { useMemo, useState } from "react";
import GameCard from "./GameCard";
import { mockGames } from "../data/mockGames";

export default function GamesSection() {
  const [selectedGenre, setSelectedGenre] = useState("All");

  const genres = useMemo(() => {
    const allGenres = mockGames.flatMap((game) => game.genres);
    return ["All", ...Array.from(new Set(allGenres))];
  }, []);

  const filteredGames = useMemo(() => {
    if (selectedGenre === "All") return mockGames;
    return mockGames.filter((game) => game.genres.includes(selectedGenre));
  }, [selectedGenre]);

  return (
    <section id="games" className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-8 md:py-16">
        <div className="mb-8 space-y-3 md:mb-10">
          <div className="inline-flex rounded-full bg-sky-100 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-blue-700">
            Student Games
          </div>

          <h2 className="pixel-font text-lg leading-8 text-slate-900 md:text-2xl">
            Explore more club projects.
          </h2>

          <p className="max-w-2xl text-base leading-8 text-slate-600">
            Browse student-made games from HCMUT Game Dev Club, from action and
            platformers to cozy adventures and creative experiments.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          {genres.map((genre) => {
            const isActive = selectedGenre === genre;

            return (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-sky-100 text-blue-700 hover:bg-sky-200"
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>

        {filteredGames.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                title={game.title}
                team={game.team}
                genres={game.genres}
                description={game.description}
                image={game.image}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
            No games found in this genre.
          </div>
        )}
      </div>
    </section>
  );
}