import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export async function createGame(game) {
  const docRef = await addDoc(collection(db, "games"), {
    title: game.title || "",
    team: game.team || "",
    genres: game.genres || [],
    description: game.description || "",
    itchUrl: game.itchUrl || "",
    image: game.image || "",
    platforms: game.platforms || ["Windows"],
    createdAt: Date.now(),
  });

  return docRef.id;
}

export async function getGames() {
  const snapshot = await getDocs(collection(db, "games"));

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function updateGame(gameId, game) {
  await updateDoc(doc(db, "games", gameId), {
    ...game,
    updatedAt: Date.now(),
  });
}

export async function deleteGame(gameId) {
  await deleteDoc(doc(db, "games", gameId));
}