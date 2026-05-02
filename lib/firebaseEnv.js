function readRequired(name) {
  const envMap = {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  };
  const v = envMap[name];
  if (!v || !String(v).trim()) {
    throw new Error(`Missing required env: ${name}`);
  }
  return String(v).trim();
}

export function getFirebaseWebConfig() {
  return {
    apiKey: readRequired("NEXT_PUBLIC_FIREBASE_API_KEY"),
    authDomain: readRequired("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: readRequired("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    appId: readRequired("NEXT_PUBLIC_FIREBASE_APP_ID"),
    messagingSenderId: readRequired("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  };
}

export function getFirebaseAdminConfig() {
  return {
    projectId: readRequired("FIREBASE_PROJECT_ID"),
    clientEmail: readRequired("FIREBASE_CLIENT_EMAIL"),
    privateKey: readRequired("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
  };
}
