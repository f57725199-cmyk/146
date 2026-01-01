// ===============================
// FIREBASE – FINAL CLEAN SETUP
// ===============================

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
  where
} from "firebase/firestore";
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  update
} from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// ===============================
// 🔥 ACTIVE FIREBASE PROJECT (ONLY ONE)
// ===============================

const firebaseConfig = {
  apiKey: "AIzaSyDNAarkY9MquMpJzKuXt4BayK6AHGImyr0",
  authDomain: "dec2025-96ecd.firebaseapp.com",
  projectId: "dec2025-96ecd",
  storageBucket: "dec2025-96ecd.firebasestorage.app",
  messagingSenderId: "617035489092",
  appId: "1:617035489092:web:cf470004dfcb97e41cc111",
  databaseURL:
    "https://dec2025-96ecd-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// ===============================
// SAFE INIT (VITE / VERCEL)
// ===============================

const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];

const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const auth = getAuth(app);

// ===============================
// AUTH
// ===============================

export const subscribeToAuth = (cb: any) =>
  onAuthStateChanged(auth, cb);

// ===============================
// USERS
// ===============================

export const saveUserToLive = async (user: any) => {
  if (!user?.id) return;
  await set(ref(rtdb, `users/${user.id}`), user);
  await setDoc(doc(db, "users", user.id), user);
};

export const subscribeToUsers = (cb: any) =>
  onSnapshot(collection(db, "users"), snap =>
    cb(snap.docs.map(d => d.data()))
  );

export const getUserByEmail = async (email: string) => {
  const q = query(
    collection(db, "users"),
    where("email", "==", email)
  );
  const s = await getDocs(q);
  return s.empty ? null : s.docs[0].data();
};

// ===============================
// SETTINGS
// ===============================

export const saveSystemSettings = async (data: any) => {
  await set(ref(rtdb, "system_settings"), data);
  await setDoc(doc(db, "config", "system_settings"), data);
};

export const subscribeToSettings = (cb: any) =>
  onValue(ref(rtdb, "system_settings"), s => cb(s.val()));

// ===============================
// CONTENT / CHAPTERS
// ===============================

export const bulkSaveLinks = async (data: Record<string, any>) =>
  update(ref(rtdb, "content_links"), data);

export const saveChapterData = async (id: string, data: any) => {
  await set(ref(rtdb, `content_data/${id}`), data);
  await setDoc(doc(db, "content_data", id), data);
};

export const getChapterData = async (id: string) => {
  const r = await get(ref(rtdb, `content_data/${id}`));
  if (r.exists()) return r.val();
  const f = await getDoc(doc(db, "content_data", id));
  return f.exists() ? f.data() : null;
};

// ===============================
// STATUS / TEST
// ===============================

export const saveTestResult = async (uid: string, data: any) =>
  setDoc(doc(db, "users", uid, "test_results", Date.now().toString()), data);

export const updateUserStatus = async (uid: string) =>
  update(ref(rtdb, `users/${uid}`), {
    lastActiveTime: new Date().toISOString()
  });

export default app;
