import { getApp, getApps, initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, initializeAuth } from "firebase/auth";

const FIREBASE_WEB_APP_NAME = "vendor-otp-web";

function requiredEnv(value: string | undefined, name: string): string {
  if (!value || !value.trim()) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value.trim();
}

function getFirebaseWebConfig() {
  return {
    apiKey: requiredEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY, "NEXT_PUBLIC_FIREBASE_API_KEY"),
    authDomain: requiredEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: requiredEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, "NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    appId: requiredEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID, "NEXT_PUBLIC_FIREBASE_APP_ID"),
    messagingSenderId: requiredEnv(
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    ),
  };
}

export function getFirebaseClientApp() {
  if (typeof window === "undefined") {
    throw new Error("Firebase client app is only available in browser");
  }

  const existing = getApps().find((app) => app.name === FIREBASE_WEB_APP_NAME);
  if (existing) return existing;

  try {
    return getApp(FIREBASE_WEB_APP_NAME);
  } catch {
    return initializeApp(getFirebaseWebConfig(), FIREBASE_WEB_APP_NAME);
  }
}

export function getFirebaseClientAuth() {
  const app = getFirebaseClientApp();
  try {
    return getAuth(app);
  } catch {
    return initializeAuth(app, { persistence: browserLocalPersistence });
  }
}
