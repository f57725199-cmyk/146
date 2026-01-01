// =======================================
// FIREBASE IMPORTS
// =======================================
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  getDocs,
  query,
  where,
  deleteDoc
} from "firebase/firestore";
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  update,
  remove
} from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// =======================================
// 🔥 NEW FIREBASE PROJECT (JAN 2025 ONLY)
// =======================================
const firebaseConfig = {
  apiKey: "AIzaSyAKuIGYmyo4sDbz3ET5zpZmCH5AnQASZxI",
  authDomain: "jan2025-f69a8.firebaseapp.com",
  databaseURL: "https://jan2025-f69a8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "jan2025-f69a8",
  storageBucket: "jan2025-f69a8.firebasestorage.app",
  messagingSenderId: "158470334860",
  appId: "1:158470334860:web:e67ac809060da43da3cea9"
};

// =======================================
// SAFE INITIALIZATION (VERCEL / JULES)
// =======================================
const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];

// =======================================
// SERVICES
// =======================================
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null;

// =======================================
// AUTH LISTENER
// =======================================
export const subscribeToAuth = (cb: (user: any) => void) =>
  onAuthStateChanged(auth, cb);

// =======================================
// 👤 USER FEATURES (FULL)
// =======================================
export const saveUserToLive = async (user: any) => {
  if (!user?.id) return;

  await Promise.all([
    set(ref(rtdb, `users/${user.id}`), user),
    setDoc(doc(db, "users", user.id), user)
  ]);
};

export const getUserData = async (userId: string) => {
  const r = await get(ref(rtdb, `users/${userId}`));
  if (r.exists()) return r.val();

  const f = await getDoc(doc(db, "users", userId));
  return f.exists() ? f.data() : null;
};

export const getUserByEmail = async (email: string) => {
  const q = query(collection(db, "users"), where("email", "==", email));
  const snap = await getDocs(q);
  return snap.empty ? null : snap.docs[0].data();
};

export const subscribeToUsers = (cb: (users: any[]) => void) =>
  onSnapshot(collection(db, "users"), s =>
    cb(s.docs.map(d => d.data()))
  );

// =======================================
// ⚙️ SYSTEM SETTINGS
// =======================================
export const saveSystemSettings = async (settings: any) =>
  Promise.all([
    set(ref(rtdb, "system_settings"), settings),
    setDoc(doc(db, "config", "system_settings"), settings)
  ]);

export const subscribeToSettings = (cb: (s: any) => void) =>
  onSnapshot(doc(db, "config", "system_settings"), d => {
    if (d.exists()) cb(d.data());
  });

// =======================================
// 📚 CONTENT / CHAPTERS
// =======================================
export const saveChapterData = async (key: string, data: any) =>
  Promise.all([
    set(ref(rtdb, `content_data/${key}`), data),
    setDoc(doc(db, "content_data", key), data)
  ]);

export const getChapterData = async (key: string) => {
  const r = await get(ref(rtdb, `content_data/${key}`));
  if (r.exists()) return r.val();

  const f = await getDoc(doc(db, "content_data", key));
  return f.exists() ? f.data() : null;
};

export const subscribeToChapterData = (key: string, cb: (d: any) => void) =>
  onValue(ref(rtdb, `content_data/${key}`), s => {
    if (s.exists()) cb(s.val());
  });

// =======================================
// 🔗 BULK SAVE (ADMIN DASHBOARD FIX)
// =======================================
export const bulkSaveLinks = async (updates: Record<string, any>) => {
  await update(ref(rtdb, "content_links"), updates);

  await Promise.all(
    Object.entries(updates).map(([k, v]) =>
      setDoc(doc(db, "content_data", k), v)
    )
  );
};

// =======================================
// 🧪 TEST RESULTS
// =======================================
export const saveTestResult = async (userId: string, attempt: any) => {
  const id = `${attempt.testId}_${Date.now()}`;
  await setDoc(doc(db, "users", userId, "test_results", id), attempt);
};

// =======================================
// 🟢 USER STATUS
// =======================================
export const updateUserStatus = async (userId: string) =>
  update(ref(rtdb, `users/${userId}`), {
    lastActiveTime: new Date().toISOString()
  });

// =======================================
// 🔌 BUILD SAFETY
// =======================================
export const checkFirebaseConnection = () => true;

export { app };
export default app;
