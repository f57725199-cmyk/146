// ===============================
// FIREBASE INIT – JAN 2025 PROJECT
// ===============================

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, deleteDoc } from "firebase/firestore";
import { getDatabase, ref, set, update, onValue } from "firebase/database";
import { getStorage } from "firebase/storage";

// ===============================
// FIREBASE CONFIG
// ===============================

const firebaseConfig = {
  apiKey: "AIzaSyAKuIGYmyo4sDbz3ET5zpZmCH5AnQASZxI",
  authDomain: "jan2025-f69a8.firebaseapp.com",
  projectId: "jan2025-f69a8",
  storageBucket: "jan2025-f69a8.firebasestorage.app",
  messagingSenderId: "158470334860",
  appId: "1:158470334860:web:e67ac809060da43da3cea9"
};

// ===============================
// SAFE INIT (VERCEL / VITE)
// ===============================

const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];

// ===============================
// EXPORT CORE SERVICES
// ===============================

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const storage = getStorage(app);

// ===============================
// 🔥 STUDENT FEATURES FUNCTIONS
// ===============================

// bulk save links (ERROR FIX HERE)
export const bulkSaveLinks = async (links: any[]) => {
  const baseRef = ref(rtdb, "student_links");
  for (const item of links) {
    await set(ref(rtdb, `student_links/${item.id}`), item);
  }
};

// save chapter / lesson data
export const saveChapterData = async (id: string, data: any) => {
  await setDoc(doc(db, "chapters", id), data);
};

// delete chapter
export const deleteChapter = async (id: string) => {
  await deleteDoc(doc(db, "chapters", id));
};

// save system settings
export const saveSystemSettings = async (settings: any) => {
  await set(ref(rtdb, "system_settings"), settings);
};

// firebase connection check
export const checkFirebaseConnection = () => {
  return new Promise((resolve) => {
    const testRef = ref(rtdb, ".info/connected");
    onValue(testRef, (snap) => resolve(snap.val()));
  });
};

// ===============================
// 🚨 FORCE EXPORT (ROLLUP FIX)
// ===============================
export { bulkSaveLinks };

export default app;
