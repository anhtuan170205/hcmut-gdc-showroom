import { useState } from "react";

const fallbackImage = "/games/placeholder.jpg";

export default function GameCard({
  title,
  team,
  genres,
  description,
  image,
  itchUrl,
}) {
  const [imgSrc, setImgSrc] = useState(image || fallbackImage);

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={imgSrc}
          alt={title}
          onError={() => setImgSrc(fallbackImage)}
          className="h-full w-full object-cover transition duration-300 hover:scale-105"
        />
      </div>

      <div className="space-y-4 p-5 md:p-6">
        <div className="space-y-2">
          <h3 className="pixel-font text-sm leading-6 text-slate-900 dark:text-slate-100 md:text-base">
            {title}
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Team:{" "}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {team}
            </span>
          </p>

          <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <span
              key={genre}
              className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-slate-800 dark:text-sky-300"
            >
              {genre}
            </span>
          ))}
        </div>

        {itchUrl ? (
          <a
            href={itchUrl}
            target="_blank"
            rel="noreferrer"
            className="block w-full rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
          >
            Play
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="block w-full cursor-not-allowed rounded-2xl bg-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          >
            Play
          </button>
        )}
      </div>
    </article>
  );
}