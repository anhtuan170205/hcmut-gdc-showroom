import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { loginAdmin, logoutAdmin } from "../services/auth";
import { deleteGame, getGames, updateGame } from "../services/games";
import {
  approveSubmission,
  getPendingSubmissions,
  rejectSubmission,
} from "../services/submissions";

const initialEditForm = {
  title: "",
  team: "",
  genres: "",
  description: "",
  itchUrl: "",
};

const ADMIN_UID = import.meta.env.VITE_ADMIN_UID || "";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [games, setGames] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const [isLoadingGames, setIsLoadingGames] = useState(true);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);

  const [message, setMessage] = useState("");
  const [editingGameId, setEditingGameId] = useState(null);
  const [editForm, setEditForm] = useState(initialEditForm);

  const isAdmin = useMemo(() => {
    return !!user && !!ADMIN_UID && user.uid === ADMIN_UID;
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    refreshAll();
  }, [isAdmin]);

  async function refreshAll() {
    await Promise.all([loadGames(), loadSubmissions()]);
  }

  async function loadGames() {
    setIsLoadingGames(true);
    try {
      const data = await getGames();
      const sorted = [...data].sort(
        (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
      );
      setGames(sorted);
    } catch (error) {
      console.error("Failed to load games:", error);
      setMessage("Failed to load approved games.");
    } finally {
      setIsLoadingGames(false);
    }
  }

  async function loadSubmissions() {
    setIsLoadingSubmissions(true);
    try {
      const data = await getPendingSubmissions();
      const sorted = [...data].sort(
        (a, b) => (b.submittedAt || 0) - (a.submittedAt || 0)
      );
      setSubmissions(sorted);
    } catch (error) {
      console.error("Failed to load submissions:", error);
      setMessage("Failed to load pending submissions.");
    } finally {
      setIsLoadingSubmissions(false);
    }
  }

  function startEdit(game) {
    setEditingGameId(game.id);
    setEditForm({
      title: game.title || "",
      team: game.team || "",
      genres: Array.isArray(game.genres) ? game.genres.join(", ") : "",
      description: game.description || "",
      itchUrl: game.itchUrl || "",
    });
    setMessage("");
  }

  function cancelEdit() {
    setEditingGameId(null);
    setEditForm(initialEditForm);
  }

  function handleEditChange(e) {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingGameId) return;

    setMessage("");

    try {
      await updateGame(editingGameId, {
        title: editForm.title.trim(),
        team: editForm.team.trim(),
        genres: editForm.genres
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean),
        description: editForm.description.trim(),
        itchUrl: editForm.itchUrl.trim(),
      });

      setMessage("Game updated.");
      cancelEdit();
      await loadGames();
    } catch (error) {
      console.error("Failed to update game:", error);
      setMessage("Failed to update game.");
    }
  }

  async function handleDeleteGame(gameId) {
    const confirmed = window.confirm("Delete this game?");
    if (!confirmed) return;

    setMessage("");

    try {
      await deleteGame(gameId);
      setMessage("Game deleted.");
      await loadGames();
    } catch (error) {
      console.error("Failed to delete game:", error);
      setMessage("Failed to delete game.");
    }
  }

  async function handleApprove(submission) {
    setMessage("");

    try {
      await approveSubmission(submission);
      setMessage("Submission approved.");
      await refreshAll();
    } catch (error) {
      console.error("Failed to approve submission:", error);
      setMessage("Failed to approve submission.");
    }
  }

  async function handleReject(submissionId) {
    const confirmed = window.confirm("Reject this submission?");
    if (!confirmed) return;

    setMessage("");

    try {
      await rejectSubmission(submissionId);
      setMessage("Submission rejected.");
      await loadSubmissions();
    } catch (error) {
      console.error("Failed to reject submission:", error);
      setMessage("Failed to reject submission.");
    }
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-6">
          Checking authentication...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h1 className="mb-3 text-2xl font-semibold">Admin Login</h1>
          <p className="mb-6 text-slate-300">
            Sign in with your admin account to review submissions and manage
            games.
          </p>

          <button
            onClick={loginAdmin}
            className="rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (user && !ADMIN_UID) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h1 className="mb-3 text-2xl font-semibold">Set up admin UID</h1>
          <p className="mb-4 text-slate-300">
            You are signed in successfully. Copy this UID into your{" "}
            <code>.env</code> file as <code>VITE_ADMIN_UID</code>.
          </p>

          <div className="mb-6 rounded-2xl border border-slate-700 bg-slate-950 p-4">
            <p className="mb-2 text-sm text-slate-400">Your Firebase UID</p>
            <code className="break-all text-sm text-white">{user.uid}</code>
          </div>

          <div className="mb-6 rounded-2xl border border-slate-700 bg-slate-950 p-4">
            <p className="mb-2 text-sm text-slate-400">Put this in .env</p>
            <code className="break-all text-sm text-white">
              VITE_ADMIN_UID={user.uid}
            </code>
          </div>

          <p className="mb-6 text-sm text-slate-400">
            After saving the file, restart your dev server.
          </p>

          <button
            onClick={logoutAdmin}
            className="rounded-full bg-slate-800 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h1 className="mb-3 text-2xl font-semibold">Access denied</h1>
          <p className="mb-6 text-slate-300">
            You are signed in, but this account is not the admin account.
          </p>

          <button
            onClick={logoutAdmin}
            className="rounded-full bg-slate-700 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-600"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex rounded-full bg-sky-100 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-blue-700">
              Admin Dashboard
            </div>
            <h1 className="text-3xl font-semibold text-white">
              Manage submissions and games
            </h1>
            <p className="mt-2 text-slate-300">
              Review pending submissions, approve or reject them, and edit
              published games.
            </p>
          </div>

          <button
            onClick={logoutAdmin}
            className="rounded-full bg-slate-800 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Sign out
          </button>
        </div>

        {message ? (
          <div className="mb-6 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200">
            {message}
          </div>
        ) : null}

        <section className="mb-10">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">Pending submissions</h2>
            <p className="mt-1 text-slate-400">
              These are not public yet. Approving will add them to the games
              collection.
            </p>
          </div>

          {isLoadingSubmissions ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
              Loading submissions...
            </div>
          ) : submissions.length === 0 ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
              No pending submissions.
            </div>
          ) : (
            <div className="grid gap-6">
              {submissions.map((submission) => (
                <article
                  key={submission.id}
                  className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
                >
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-semibold">
                        {submission.title || "Untitled game"}
                      </h3>
                      <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-300">
                        Pending
                      </span>
                    </div>

                    <p className="mb-2 text-sm text-slate-400">
                      Team: {submission.team || "Unknown"}
                    </p>

                    {submission.genres?.length ? (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {submission.genres.map((genre) => (
                          <span
                            key={genre}
                            className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-blue-700"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <p className="mb-4 text-sm leading-7 text-slate-300">
                      {submission.description || "No description"}
                    </p>

                    {submission.itchUrl ? (
                      <p className="mb-4 text-sm text-slate-300">
                        Game link:{" "}
                        <a
                          href={submission.itchUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="break-all text-blue-400 hover:text-blue-300"
                        >
                          {submission.itchUrl}
                        </a>
                      </p>
                    ) : null}

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleApprove(submission)}
                        className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => handleReject(submission.id)}
                        className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mb-10">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">Edit published game</h2>
            <p className="mt-1 text-slate-400">
              Select a published game below to update its info.
            </p>
          </div>

          {editingGameId ? (
            <form
              onSubmit={handleSaveEdit}
              className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">
                    Title
                  </label>
                  <input
                    name="title"
                    value={editForm.title}
                    onChange={handleEditChange}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">
                    Team
                  </label>
                  <input
                    name="team"
                    value={editForm.team}
                    onChange={handleEditChange}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Genres
                </label>
                <input
                  name="genres"
                  value={editForm.genres}
                  onChange={handleEditChange}
                  placeholder="Action, Puzzle, Horror"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                />
              </div>

              <div className="mt-6 space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={5}
                  value={editForm.description}
                  onChange={handleEditChange}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                  required
                />
              </div>

              <div className="mt-6 space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Game link
                </label>
                <input
                  name="itchUrl"
                  value={editForm.itchUrl}
                  onChange={handleEditChange}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="rounded-full bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Save changes
                </button>

                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-full bg-slate-800 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
              No game selected for editing.
            </div>
          )}
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">Published games</h2>
            <p className="mt-1 text-slate-400">
              These are the games currently shown on the public site.
            </p>
          </div>

          {isLoadingGames ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
              Loading games...
            </div>
          ) : games.length === 0 ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
              No published games yet.
            </div>
          ) : (
            <div className="grid gap-6">
              {games.map((game) => (
                <article
                  key={game.id}
                  className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
                >
                  <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-start">
                    <div>
                      <h3 className="mb-2 text-xl font-semibold">
                        {game.title || "Untitled game"}
                      </h3>

                      <p className="mb-2 text-sm text-slate-400">
                        Team: {game.team || "Unknown"}
                      </p>

                      {game.genres?.length ? (
                        <div className="mb-3 flex flex-wrap gap-2">
                          {game.genres.map((genre) => (
                            <span
                              key={genre}
                              className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-blue-700"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <p className="text-sm leading-7 text-slate-300">
                        {game.description || "No description"}
                      </p>

                      {game.itchUrl ? (
                        <p className="mt-3 text-sm text-slate-300">
                          Game link:{" "}
                          <a
                            href={game.itchUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="break-all text-blue-400 hover:text-blue-300"
                          >
                            {game.itchUrl}
                          </a>
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-3 md:flex-col">
                      <button
                        onClick={() => startEdit(game)}
                        className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDeleteGame(game.id)}
                        className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}