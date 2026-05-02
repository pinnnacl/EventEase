import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirebaseAdminConfig } from "./firebaseEnv";

function getFirebaseAdminApp() {
  if (getApps().length) return getApps()[0];
  const cfg = getFirebaseAdminConfig();
  return initializeApp({
    credential: cert({
      projectId: cfg.projectId,
      clientEmail: cfg.clientEmail,
      privateKey: cfg.privateKey,
    }),
    projectId: cfg.projectId,
  });
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}
