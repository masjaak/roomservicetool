// 1. Import yang wajib ada
import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore"; // Gunakan initializeFirestore untuk settings custom

// 2. Config Firebase lo
const firebaseConfig = {
  apiKey: "AIzaSyD1IbtZeRumahNgK4JyV5s8wWDFrlTXJqF",
  authDomain: "hcsroomserviceapp.firebaseapp.com",
  projectId: "hcsroomserviceapp",
  storageBucket: "hcsroomserviceapp.firebasestorage.app",
  messagingSenderId: "949808465266",
  appId: "1:949808465266:web:4609a0f650a8f9106071eb",
  measurementId: "G-VJ1MXRJ60X"
};

// 3. Initialize App
const app = initializeApp(firebaseConfig);

// 4. FIX: Force Long Polling untuk mengatasi error "WebChannelConnection transport errored"
// Ini memaksa Firestore menggunakan HTTP long-polling yang lebih stabil di jaringan tertentu daripada WebSockets.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});