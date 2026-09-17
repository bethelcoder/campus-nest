import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  type Auth,
  type UserCredential,
} from "firebase/auth";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDOFQ2oZsm4lDm6QQQzuoz3hvnZYq2q_tg",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "campus-nest-auth.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "campus-nest-auth",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "campus-nest-auth.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "619010302467",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:619010302467:web:4572ec9be319d19ee96436",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-5XW2K5J9B7",
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export async function loginWithGoogle(): Promise<{
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  idToken: string;
}> {
  try {
    const result: UserCredential = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const idToken = await user.getIdToken();
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      idToken,
    };
  } catch (err: any) {
    console.error("Firebase auth error code:", err?.code, err);
    if (err?.code === "auth/configuration-not-found") {
      throw new Error(
        "Google Sign-In is not enabled yet in your Firebase Console. Please go to Firebase Console -> Authentication -> Sign-in method -> Click 'Google' -> Enable and Save."
      );
    }
    if (err?.code === "auth/unauthorized-domain") {
      throw new Error(
        "This domain (localhost) is not authorized in Firebase Console -> Authentication -> Settings -> Authorized domains."
      );
    }
    if (err?.code === "auth/popup-closed-by-user") {
      throw new Error("Sign-in popup was closed before completing.");
    }
    if (err?.code === "auth/invalid-api-key") {
      throw new Error("Firebase API key is invalid. Please verify your Firebase project credentials.");
    }
    throw new Error(err?.message || "Google authentication failed. Please try again.");
  }
}

export async function logOutFromFirebase(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    console.warn("Firebase sign out warning:", err);
  }
}
