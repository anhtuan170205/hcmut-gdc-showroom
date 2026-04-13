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
    ...game,
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

export async function updateGame(id, updatedData) {
  await updateDoc(doc(db, "games", id), updatedData);
}

export async function deleteGame(id) {
  await deleteDoc(doc(db, "games", id));
}