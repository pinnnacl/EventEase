import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirebaseWebConfig } from "./firebaseEnv";

const FIREBASE_WEB_APP_NAME = "vendor-otp-web";

export function getFirebaseWebApp() {
  if (typeof window === "undefined") {
    throw new Error("Firebase web app can only be used in the browser");
  }
  const existing = getApps().find((app) => app.name === FIREBASE_WEB_APP_NAME);
  if (existing) return existing;
  try {
    return getApp(FIREBASE_WEB_APP_NAME);
  } catch {
    return initializeApp(getFirebaseWebConfig(), FIREBASE_WEB_APP_NAME);
  }
}

export function getFirebaseWebAuth() {
  return getAuth(getFirebaseWebApp());
}
