import { useState } from "react";
import { genreOptions } from "../data/genres";
import { createGame } from "../services/games";

type UploadFormData = {
  gameTitle: string;
  teamName: string;
  genres: string[];
  description: string;
  buildLink: string;
  imageLink: string;
};

type UploadSectionProps = {
  onGameSubmitted: () => Promise<void> | void;
};

const initialFormData: UploadFormData = {
  gameTitle: "",
  teamName: "",
  genres: [],
  description: "",
  buildLink: "",
  imageLink: "",
};

function withTimeout<T>(promise: Promise<T>, ms = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out after 8 seconds")), ms)
    ),
  ]);
}

export default function UploadSection({ onGameSubmitted }: UploadSectionProps) {
  const [formData, setFormData] = useState<UploadFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenreToggle = (genre: string) => {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    console.log("submit started", formData);

    try {
      const result = await withTimeout(
        createGame({
          title: formData.gameTitle,
          team: formData.teamName,
          genres: formData.genres,
          description: formData.description,
          image: formData.imageLink,
          itchUrl: formData.buildLink,
          platforms: ["Windows"],
          featured: false,
        }),
        8000
      );

      console.log("submit success", result);
      await onGameSubmitted?.();
      setFormData(initialFormData);
      setMessage("Game submitted successfully.");
    } catch (error) {
      console.error("submit failed", error);
      setMessage(
        error instanceof Error ? error.message : "Failed to submit game."
      );
    } finally {
      console.log("submit finished");
      setIsSubmitting(false);
    }
  };

  return (
    <section id="upload" className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-8 md:py-16">
        <div className="mb-8 space-y-3 md:mb-10">
          <div className="inline-flex rounded-full bg-sky-100 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-blue-700">
            Submit Your Game
          </div>

          <h2 className="pixel-font text-lg leading-8 text-slate-900 md:text-2xl">
            Share your project with the club.
          </h2>

          <p className="max-w-2xl text-base leading-8 text-slate-600">
            Add your game so it can appear in the HCMUT Game Dev Club showroom.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="gameTitle"
                  className="text-sm font-medium text-slate-700"
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
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="teamName"
                  className="text-sm font-medium text-slate-700"
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
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">
                Genres
              </label>

              <div className="flex flex-wrap gap-3">
                {genreOptions.map((genre: string) => {
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
                className="text-sm font-medium text-slate-700"
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
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500"
                required
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="buildLink"
                  className="text-sm font-medium text-slate-700"
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
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="imageLink"
                  className="text-sm font-medium text-slate-700"
                >
                  Cover Image Link
                </label>
                <input
                  id="imageLink"
                  name="imageLink"
                  type="url"
                  value={formData.imageLink}
                  onChange={handleChange}
                  placeholder="https://your-image-link.com"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500"
                />
              </div>
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
              <p className="text-sm text-slate-600">{message}</p>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}