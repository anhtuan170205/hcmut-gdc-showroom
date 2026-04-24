import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { createGame } from "./games";

export async function createSubmission(submission) {
  const docRef = await addDoc(collection(db, "submissions"), {
    ...submission,
    status: "pending",
    submittedAt: Date.now(),
  });

  return docRef.id;
}

export async function getPendingSubmissions() {
  const q = query(
    collection(db, "submissions"),
    where("status", "==", "pending")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function approveSubmission(submission) {
  if (!submission.id) {
    throw new Error("Submission ID is missing.");
  }

  const gameId = await createGame({
    title: submission.title || "",
    team: submission.team || "",
    genres: submission.genres || [],
    description: submission.description || "",
    itchUrl: submission.itchUrl || "",
    image: submission.image || "",
    platforms: submission.platforms || ["Windows"],
  });

  await updateDoc(doc(db, "submissions", submission.id), {
    status: "approved",
    approvedAt: Date.now(),
    approvedGameId: gameId,
  });

  return gameId;
}

export async function rejectSubmission(submissionId) {
  await updateDoc(doc(db, "submissions", submissionId), {
    status: "rejected",
    rejectedAt: Date.now(),
  });
}