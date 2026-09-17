import { initializeApp, getApps, getApp, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";

let adminAppInstance: App | null = null;
let adminAuthInstance: Auth | null = null;

if (!getApps().length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    // Handle escaped newlines in environment variable
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  if (projectId && clientEmail && privateKey) {
    adminAppInstance = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else if (projectId) {
    adminAppInstance = initializeApp({
      projectId,
    });
  }
} else {
  adminAppInstance = getApp();
}

if (adminAppInstance) {
  adminAuthInstance = getAuth(adminAppInstance);
}

export const adminAuth = adminAuthInstance;
export const adminApp = adminAppInstance;
