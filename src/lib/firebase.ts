import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const REQUIRED_FIREBASE_ENV_NAMES: Array<keyof ImportMetaEnv> = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

export const missingFirebaseEnvNames = REQUIRED_FIREBASE_ENV_NAMES.filter((name) => !import.meta.env[name]);

export const firebaseConfigError = missingFirebaseEnvNames.length > 0
  ? `Missing required Firebase environment variables: ${missingFirebaseEnvNames.join(', ')}`
  : null;

function getEnv(name: keyof ImportMetaEnv): string {
  return import.meta.env[name] || '';
}

const firebaseConfig = firebaseConfigError
  ? null
  : {
      apiKey: getEnv('VITE_FIREBASE_API_KEY'),
      authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
      projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
      storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
      appId: getEnv('VITE_FIREBASE_APP_ID'),
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    };

export const app = firebaseConfig ? initializeApp(firebaseConfig) : null;

// Force long polling for stable connections on restricted networks
export const db = app
  ? initializeFirestore(app, {
      experimentalForceLongPolling: true,
    })
  : null;

export const auth = app ? getAuth(app) : null;

export const functions = app
  ? getFunctions(
      app,
      import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || 'asia-southeast2'
    )
  : null;

export const isSparkDemoMode = import.meta.env.VITE_FIREBASE_SPARK_DEMO_MODE === 'true';

export function assertFirebaseConfigured<T>(value: T | null, label: string): T {
  if (!value) {
    throw new Error(firebaseConfigError || `${label} is not configured.`);
  }

  return value;
}
