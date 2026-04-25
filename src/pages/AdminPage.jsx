import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

function SortableGameItem({ game, index, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: game.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${
        isDragging ? "z-10 opacity-70 shadow-xl" : ""
      }`}
    >
      <div className="grid gap-6 md:grid-cols-[auto_1fr_auto] md:items-start">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex h-11 w-11 cursor-grab items-center justify-center rounded-2xl bg-slate-100 text-lg font-bold text-slate-500 active:cursor-grabbing dark:bg-slate-800 dark:text-slate-300"
          aria-label="Drag to reorder"
        >
          ⋮⋮
        </button>

        <div>
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              #{index + 1}
            </span>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {game.title || "Untitled game"}
            </h3>
          </div>

          <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
            Team: {game.team || "Unknown"}
          </p>

          {game.genres?.length ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {game.genres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-slate-800 dark:text-sky-300"
                >
                  {genre}
                </span>
              ))}
            </div>
          ) : null}

          <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">
            {game.description || "No description"}
          </p>

          {game.itchUrl ? (
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Game link:{" "}
              <a
                href={game.itchUrl}
                target="_blank"
                rel="noreferrer"
                className="break-all text-blue-600 hover:text-blue-700 dark:text-sky-300 dark:hover:text-sky-200"
              >
                {game.itchUrl}
              </a>
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3 md:flex-col">
          <button
            type="button"
            onClick={() => onEdit(game)}
            className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(game.id)}
            className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

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
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

      const sorted = [...data].sort((a, b) => {
        const orderA = a.displayOrder ?? 999999;
        const orderB = b.displayOrder ?? 999999;

        if (orderA !== orderB) return orderA - orderB;

        return (b.createdAt || 0) - (a.createdAt || 0);
      });

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

  function handleDragEnd(event) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setGames((prevGames) => {
      const oldIndex = prevGames.findIndex((game) => game.id === active.id);
      const newIndex = prevGames.findIndex((game) => game.id === over.id);

      return arrayMove(prevGames, oldIndex, newIndex);
    });
  }

  async function saveGameOrder() {
    setIsSavingOrder(true);
    setMessage("");

    try {
      await Promise.all(
        games.map((game, index) =>
          updateGame(game.id, {
            displayOrder: index + 1,
          })
        )
      );

      setMessage("Game order saved.");
      await loadGames();
    } catch (error) {
      console.error("Failed to save game order:", error);
      setMessage("Failed to save game order.");
    } finally {
      setIsSavingOrder(false);
    }
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-white px-6 py-16 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-slate-700 dark:text-slate-300">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white px-6 py-16 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-blue-700 dark:bg-slate-800 dark:text-sky-300">
            Admin Dashboard
          </div>

          <h1 className="mb-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Admin Login
          </h1>

          <p className="mb-6 text-slate-600 dark:text-slate-400">
            Sign in with your admin account to review submissions and manage
            games.
          </p>

          <button
            type="button"
            onClick={loginAdmin}
            className="rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (user && !ADMIN_UID) {
    return (
      <div className="min-h-screen bg-white px-6 py-16 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h1 className="mb-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Set up admin UID
          </h1>

          <p className="mb-4 text-slate-600 dark:text-slate-400">
            You are signed in successfully. Copy this UID into your{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
              .env
            </code>{" "}
            file as{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
              VITE_ADMIN_UID
            </code>
            .
          </p>

          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
              Your Firebase UID
            </p>
            <code className="break-all text-sm text-slate-900 dark:text-slate-100">
              {user.uid}
            </code>
          </div>

          <button
            type="button"
            onClick={logoutAdmin}
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white px-6 py-16 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h1 className="mb-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Access denied
          </h1>

          <p className="mb-6 text-slate-600 dark:text-slate-400">
            You are signed in, but this account is not the admin account.
          </p>

          <button
            type="button"
            onClick={logoutAdmin}
            className="rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-12 md:px-8 md:py-16">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-blue-700 dark:bg-slate-800 dark:text-sky-300">
                Admin Dashboard
              </div>

              <h1 className="pixel-font text-lg leading-8 text-slate-900 dark:text-slate-100 md:text-2xl md:leading-[2.8rem]">
                Manage submissions and games.
              </h1>

              <p className="max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-400">
                Review pending submissions, approve or reject them, update
                published games, and drag games to control display order.
              </p>
            </div>

            <button
              type="button"
              onClick={logoutAdmin}
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
            >
              Sign out
            </button>
          </div>

          {message ? (
            <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              {message}
            </div>
          ) : null}

          <section className="mb-10">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                Pending submissions
              </h2>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                These are not public yet. Approving will add them to the games
                collection.
              </p>
            </div>

            {isLoadingSubmissions ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                Loading submissions...
              </div>
            ) : submissions.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                No pending submissions.
              </div>
            ) : (
              <div className="grid gap-6">
                {submissions.map((submission) => (
                  <article
                    key={submission.id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        {submission.title || "Untitled game"}
                      </h3>

                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                        Pending
                      </span>
                    </div>

                    <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                      Team: {submission.team || "Unknown"}
                    </p>

                    {submission.genres?.length ? (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {submission.genres.map((genre) => (
                          <span
                            key={genre}
                            className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-slate-800 dark:text-sky-300"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <p className="mb-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
                      {submission.description || "No description"}
                    </p>

                    {submission.itchUrl ? (
                      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                        Game link:{" "}
                        <a
                          href={submission.itchUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="break-all text-blue-600 hover:text-blue-700 dark:text-sky-300 dark:hover:text-sky-200"
                        >
                          {submission.itchUrl}
                        </a>
                      </p>
                    ) : null}

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleApprove(submission)}
                        className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
                      >
                        Approve
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReject(submission.id)}
                        className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700"
                      >
                        Reject
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="mb-10">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                Edit published game
              </h2>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Select a published game below to update its info.
              </p>
            </div>

            {editingGameId ? (
              <form
                onSubmit={handleSaveEdit}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Title
                    </label>
                    <input
                      name="title"
                      value={editForm.title}
                      onChange={handleEditChange}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Team
                    </label>
                    <input
                      name="team"
                      value={editForm.team}
                      onChange={handleEditChange}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Genres
                  </label>
                  <input
                    name="genres"
                    value={editForm.genres}
                    onChange={handleEditChange}
                    placeholder="Action, Puzzle, Horror"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>

                <div className="mt-6 space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={5}
                    value={editForm.description}
                    onChange={handleEditChange}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    required
                  />
                </div>

                <div className="mt-6 space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Game link
                  </label>
                  <input
                    name="itchUrl"
                    value={editForm.itchUrl}
                    onChange={handleEditChange}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className="rounded-full bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
                  >
                    Save changes
                  </button>

                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                No game selected for editing.
              </div>
            )}
          </section>

          <section>
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  Published games
                </h2>
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  Drag games using the handle, then save the order.
                </p>
              </div>

              <button
                type="button"
                onClick={saveGameOrder}
                disabled={isSavingOrder || games.length === 0}
                className="rounded-full bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
              >
                {isSavingOrder ? "Saving order..." : "Save game order"}
              </button>
            </div>

            {isLoadingGames ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                Loading games...
              </div>
            ) : games.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                No published games yet.
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={games.map((game) => game.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="grid gap-6">
                    {games.map((game, index) => (
                      <SortableGameItem
                        key={game.id}
                        game={game}
                        index={index}
                        onEdit={startEdit}
                        onDelete={handleDeleteGame}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}