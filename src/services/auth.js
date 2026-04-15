import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

const provider = new GoogleAuthProvider();

export async function loginAdmin() {
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function logoutAdmin() {
  await signOut(auth);
}