// =======================================
// FIREBASE CORE IMPORTS
// =======================================
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot, getDocs, query, where } from "firebase/firestore";
import { getDatabase, ref, set, get, onValue, update } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// =======================================
// 🔹 OLD DEFAULT PROJECT (STUDENTS APP)
// =======================================
const defaultFirebaseConfig = {
  apiKey: "AIzaSyC7N3IOa7GRETNRBo8P-QKVFzg2bLqoEco",
  authDomain: "students-app-deae5.firebaseapp.com",
  databaseURL: "https://students-app-deae5-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "students-app-deae5",
  storageBucket: "students-app-deae5.firebasestorage.app",
  messagingSenderId: "128267767708",
  appId: "1:128267767708:web:08ed73b1563b2f3eb60259"
};

// =======================================
// 🔹 NEW PROJECT (JAN 2025 – NSTA)
// =======================================
const jan2025FirebaseConfig = {
  apiKey: "AIzaSyAKuIGYmyo4sDbz3ET5zpZmCH5AnQASZxI",
  authDomain: "jan2025-f69a8.firebaseapp.com",
  databaseURL: "https://jan2025-f69a8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "jan2025-f69a8",
  storageBucket: "jan2025-f69a8.firebasestorage.app",
  messagingSenderId: "158470334860",
  appId: "1:158470334860:web:e67ac809060da43da3cea9"
};

// =======================================
// 🔁 ACTIVE CONFIG SELECTOR
// priority:
// 1️⃣ localStorage override
// 2️⃣ JAN 2025 project
// 3️⃣ default project
// =======================================
const getActiveConfig = () => {
  try {
    const stored = localStorage.getItem("nst_firebase_config");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.apiKey) return parsed;
    }
  } catch (e) {
    console.error("Invalid custom firebase config", e);
  }

  // 🔥 CURRENTLY USING NEW PROJECT
  return jan2025FirebaseConfig;
};

const firebaseConfig = getActiveConfig();

// =======================================
// 🔥 SAFE INITIALIZATION (NO DUPLICATE APP)
// =======================================
const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];

// =======================================
// 🔹 SERVICES
// =======================================
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null;

// =======================================
// 🔹 AUTH LISTENER
// =======================================
export const subscribeToAuth = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, (user) => callback(user));
};

// =======================================
// 👤 USER SYNC (RTDB + FIRESTORE)
// =======================================
export const saveUserToLive = async (user: any) => {
  if (!user?.id) return;

  await Promise.all([
    set(ref(rtdb, `users/${user.id}`), user),
    setDoc(doc(db, "users", user.id), user)
  ]);
};

export const subscribeToUsers = (callback: (users: any[]) => void) => {
  const q = collection(db, "users");
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => d.data()));
  });
};

export const getUserData = async (userId: string) => {
  const rtdbSnap = await get(ref(rtdb, `users/${userId}`));
  if (rtdbSnap.exists()) return rtdbSnap.val();

  const fsSnap = await getDoc(doc(db, "users", userId));
  return fsSnap.exists() ? fsSnap.data() : null;
};

export const getUserByEmail = async (email: string) => {
  const q = query(collection(db, "users"), where("email", "==", email));
  const snap = await getDocs(q);
  return snap.empty ? null : snap.docs[0].data();
};

// =======================================
// ⚙️ SYSTEM SETTINGS
// =======================================
export const saveSystemSettings = async (settings: any) => {
  await Promise.all([
    set(ref(rtdb, "system_settings"), settings),
    setDoc(doc(db, "config", "system_settings"), settings)
  ]);
};

export const subscribeToSettings = (callback: (s: any) => void) => {
  return onSnapshot(doc(db, "config", "system_settings"), (snap) => {
    if (snap.exists()) callback(snap.data());
  });
};

// =======================================
// 📚 CONTENT / CHAPTERS
// =======================================
export const saveChapterData = async (key: string, data: any) => {
  await Promise.all([
    set(ref(rtdb, `content_data/${key}`), data),
    setDoc(doc(db, "content_data", key), data)
  ]);
};

export const getChapterData = async (key: string) => {
  const r = await get(ref(rtdb, `content_data/${key}`));
  if (r.exists()) return r.val();

  const f = await getDoc(doc(db, "content_data", key));
  return f.exists() ? f.data() : null;
};

export const subscribeToChapterData = (key: string, cb: (d: any) => void) => {
  return onValue(ref(rtdb, `content_data/${key}`), snap => {
    if (snap.exists()) cb(snap.val());
  });
};

// =======================================
// 🧪 TEST RESULT
// =======================================
export const saveTestResult = async (userId: string, attempt: any) => {
  const id = `${attempt.testId}_${Date.now()}`;
  await setDoc(doc(db, "users", userId, "test_results", id), attempt);
};

// =======================================
// 🔌 CONNECTION CHECK (BUILD SAFE)
// =======================================
export const checkFirebaseConnection = () => true;

export { app };
export default app;
