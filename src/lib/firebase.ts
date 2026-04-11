import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD1IbtZeRumahNgK4JyV5s8wWDFrlTXJqF',
  authDomain: 'hcsroomserviceapp.firebaseapp.com',
  projectId: 'hcsroomserviceapp',
  storageBucket: 'hcsroomserviceapp.firebasestorage.app',
  messagingSenderId: '949808465266',
  appId: '1:949808465266:web:4609a0f650a8f9106071eb',
  measurementId: 'G-VJ1MXRJ60X',
};

const app = initializeApp(firebaseConfig);

// Force long polling for stable connections on restricted networks
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});