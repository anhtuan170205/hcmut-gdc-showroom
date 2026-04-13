import { useState } from "react";
import { genreOptions } from "../data/genres";
import { createSubmission } from "../services/submissions";

const initialFormData = {
  gameTitle: "",
  teamName: "",
  genres: [],
  description: "",
  buildLink: "",
};

function withTimeout(promise, ms = 8000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out after 8 seconds")), ms)
    ),
  ]);
}

export default function SubmitPage() {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenreToggle = (genre) => {
    setFormData((prev) => {
      const isSelected = prev.genres.includes(genre);

      return {
        ...prev,
        genres: isSelected
          ? prev.genres.filter((item) => item !== genre)
          : [...prev.genres, genre],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      await withTimeout(
        createSubmission({
          title: formData.gameTitle,
          team: formData.teamName,
          genres: formData.genres,
          description: formData.description,
          itchUrl: formData.buildLink,
          platforms: ["Windows"],
          featured: false,
        }),
        8000
      );

      setFormData(initialFormData);
      setMessage("Game submitted for review.");
    } catch (error) {
      console.error("submit failed", error);
      setMessage(
        error instanceof Error ? error.message : "Failed to submit game."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-5xl px-6 py-14 md:px-8 md:py-16">
          <div className="mb-8 space-y-3 md:mb-10">
            <div className="inline-flex rounded-full bg-sky-100 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-blue-700">
              Submit Your Game
            </div>

            <h1 className="pixel-font text-lg leading-8 text-white md:text-2xl">
              Share your project with the club
            </h1>

            <p className="max-w-2xl text-base leading-8 text-slate-300">
              Submit your game to the HCMUT Game Dev Club showroom. Your entry
              will be reviewed before it appears publicly.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="gameTitle"
                    className="text-sm font-medium text-slate-200"
                  >
                    Game Title
                  </label>
                  <input
                    id="gameTitle"
                    name="gameTitle"
                    type="text"
                    value={formData.gameTitle}
                    onChange={handleChange}
                    placeholder="Enter your game title"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="teamName"
                    className="text-sm font-medium text-slate-200"
                  >
                    Team Name
                  </label>
                  <input
                    id="teamName"
                    name="teamName"
                    type="text"
                    value={formData.teamName}
                    onChange={handleChange}
                    placeholder="Enter your team name"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-200">
                  Genres
                </label>

                <div className="flex flex-wrap gap-3">
                  {genreOptions.map((genre) => {
                    const isActive = formData.genres.includes(genre);

                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => handleGenreToggle(genre)}
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
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="text-sm font-medium text-slate-200"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell us what your game is about"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="buildLink"
                  className="text-sm font-medium text-slate-200"
                >
                  Game Link
                </label>
                <input
                  id="buildLink"
                  name="buildLink"
                  type="url"
                  value={formData.buildLink}
                  onChange={handleChange}
                  placeholder="https://your-game-link.com"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Submitting..." : "Submit Game"}
                </button>
              </div>

              {message ? (
                <p className="text-sm text-slate-300">{message}</p>
              ) : null}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}