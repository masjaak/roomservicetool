import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyD1IbtZeRunah6gK4JyV5s8wWDEr1TXJqE',
  authDomain: 'hcsroomserviceapp.firebaseapp.com',
  projectId: 'hcsroomserviceapp',
  storageBucket: 'hcsroomserviceapp.firebasestorage.app',
  messagingSenderId: '949808465266',
  appId: '1:949808465266:web:4609a0f650a8f9106071eb',
  measurementId: 'G-VJ1MXRJ60X',
};

function getEnv(name: keyof ImportMetaEnv, fallback: string): string {
  return import.meta.env[name] || fallback;
}

export const missingFirebaseEnvNames: string[] = [];
export const firebaseConfigError: string | null = null;

export const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY', DEFAULT_FIREBASE_CONFIG.apiKey),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN', DEFAULT_FIREBASE_CONFIG.authDomain),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID', DEFAULT_FIREBASE_CONFIG.projectId),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET', DEFAULT_FIREBASE_CONFIG.storageBucket),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', DEFAULT_FIREBASE_CONFIG.messagingSenderId),
  appId: getEnv('VITE_FIREBASE_APP_ID', DEFAULT_FIREBASE_CONFIG.appId),
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || DEFAULT_FIREBASE_CONFIG.measurementId,
};

export const app = initializeApp(firebaseConfig);

// Force long polling for stable connections on restricted networks
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export const auth = getAuth(app);

export const functions = getFunctions(
  app,
  import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || 'asia-southeast2'
);

export const isSparkDemoMode = (import.meta.env.VITE_FIREBASE_SPARK_DEMO_MODE ?? 'true') === 'true';

export function assertFirebaseConfigured<T>(value: T | null, label: string): T {
  if (!value) {
    throw new Error(`${label} is not configured.`);
  }

  return value;
}
