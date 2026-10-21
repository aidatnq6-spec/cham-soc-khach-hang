import { getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  initializeFirestore,
  memoryLocalCache,
} from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";

export const allowedEmail = (
  process.env.NEXT_PUBLIC_ALLOWED_EMAIL ?? "phongdepdanang@gmail.com"
)
  .trim()
  .toLowerCase();
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
export const firebaseConfigured = Boolean(
  config.apiKey && config.projectId && config.appId,
);
function initialize() {
  const emulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";
  if (emulator && !config.projectId?.startsWith("demo-"))
    throw new Error("Emulator chỉ được dùng với project demo-*.");
  const app = getApps()[0] ?? initializeApp(config);
  const auth = getAuth(app);
  const db = initializeFirestore(app, {
    localCache: memoryLocalCache(),
    experimentalAutoDetectLongPolling: true,
  });
  const storage = getStorage(app);
  if (emulator) {
    const host =
      typeof window === "undefined" ? "127.0.0.1" : window.location.hostname;
    connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
    connectFirestoreEmulator(db, host, 8080);
    connectStorageEmulator(storage, host, 9199);
  }
  return { auth, db, storage };
}
type Clients = ReturnType<typeof initialize>;
const globalFirebase = globalThis as typeof globalThis & {
  __cskhFirebase?: Clients;
};
export function getFirebase(): Clients {
  if (!firebaseConfigured)
    throw new Error(
      "Chưa cấu hình Firebase. Sao chép .env.example thành .env.local và điền cấu hình web.",
    );
  return (globalFirebase.__cskhFirebase ??= initialize());
}
