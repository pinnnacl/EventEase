/**
 * Firebase web client used ONLY for guest "Request Callback" SMS OTP.
 * Separate app name from vendor flows — do not import this in vendor profile code.
 */
import { getApp, getApps, initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, initializeAuth } from "firebase/auth";
import { getFirebaseWebConfig } from "../firebaseEnv";

const CALLBACK_SMS_APP_NAME = "callback-sms-otp";

export function getCallbackSmsFirebaseApp() {
  if (typeof window === "undefined") {
    throw new Error("Callback SMS Firebase is browser-only");
  }
  const existing = getApps().find((app) => app.name === CALLBACK_SMS_APP_NAME);
  if (existing) return existing;
  try {
    return getApp(CALLBACK_SMS_APP_NAME);
  } catch {
    return initializeApp(getFirebaseWebConfig(), CALLBACK_SMS_APP_NAME);
  }
}

export function getCallbackSmsFirebaseAuth() {
  const app = getCallbackSmsFirebaseApp();
  try {
    return getAuth(app);
  } catch {
    return initializeAuth(app, { persistence: browserLocalPersistence });
  }
}
