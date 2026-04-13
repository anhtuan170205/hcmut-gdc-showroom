import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { mockGames } from "../data/mockGames";

export default function Hero() {
  const featuredGames = mockGames.filter((game) => game.featured);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentGame = featuredGames[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? featuredGames.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === featuredGames.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <section id="home" className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-8 md:py-16">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-blue-700">

              HCMUT Game Dev Club
            </div>

            <h1 className="pixel-font text-lg leading-8 text-slate-900 md:text-2xl md:leading-[2.8rem]">
              Welcome to the GDC Showroom.
            </h1>

            <p className="max-w-2xl text-base leading-8 text-slate-600">
              Discover games created by HCMUT Game Dev Club teams and explore
              the projects our members have built.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              className="rounded-lg border border-slate-300 bg-white p-2 text-slate-700 transition hover:bg-slate-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              className="rounded-lg border border-slate-300 bg-white p-2 text-slate-700 transition hover:bg-slate-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="aspect-video w-full overflow-hidden bg-slate-100">
              <img
                src={currentGame.image}
                alt={currentGame.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="space-y-4 p-5 md:p-6">
              <div className="space-y-2">
                <h2 className="pixel-font text-base leading-7 text-slate-900 md:text-lg">
                  {currentGame.title}
                </h2>
                <p className="text-sm leading-7 text-slate-600 md:text-base">
                  {currentGame.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {currentGame.genres.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-blue-700"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              <div className="text-sm text-slate-500">
                Team:{" "}
                <span className="font-medium text-slate-700">
                  {currentGame.team}
                </span>
              </div>
            </div>
          </article>

          <div className="grid gap-4">
            {featuredGames.map((game, index) => (
              <button
                key={game.id}
                onClick={() => setCurrentIndex(index)}
                className={`overflow-hidden rounded-2xl border text-left transition ${
                  index === currentIndex
                    ? "border-blue-500 bg-sky-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="grid grid-cols-[96px_1fr] gap-4 p-3">
                  <div className="h-24 overflow-hidden rounded-xl bg-slate-100">
                    <img
                      src={game.image}
                      alt={game.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 space-y-2">
                    <div className="pixel-font text-[10px] leading-5 text-slate-900 md:text-xs">
                      {game.title}
                    </div>

                    <div className="line-clamp-2 text-sm leading-6 text-slate-600">
                      {game.description}
                    </div>

                    <div className="text-xs text-slate-500">{game.team}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}