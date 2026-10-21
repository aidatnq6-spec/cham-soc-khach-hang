import "server-only";
import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
export function getAdmin() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  if (!projectId) throw new Error("Thiếu cấu hình Firebase Admin.");
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST && !projectId.startsWith("demo-"))
    throw new Error("Emulator yêu cầu project demo-*.");
  const email = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n",
  );
  const app =
    getApps().find((a) => a.name === "cskh-admin") ??
    initializeApp(
      {
        projectId,
        ...(process.env.FIREBASE_AUTH_EMULATOR_HOST
          ? {}
          : {
              credential:
                email && privateKey
                  ? cert({ projectId, clientEmail: email, privateKey })
                  : applicationDefault(),
            }),
      },
      "cskh-admin",
    );
  return { auth: getAuth(app), db: getFirestore(app) };
}
