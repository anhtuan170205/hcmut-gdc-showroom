import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

export async function createGame(game) {
  console.log("createGame called", game);

  const docRef = await addDoc(collection(db, "games"), {
    ...game,
    createdAt: Date.now(),
  });

  console.log("addDoc finished", docRef.id);
  return docRef.id;
}

export async function getGames() {
  const snapshot = await getDocs(collection(db, "games"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}