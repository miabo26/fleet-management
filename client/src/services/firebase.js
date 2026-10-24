import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

// Client-side Firebase configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBQBRe48JBy4B2RitAEVotKp_iJXqSiH24",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "egypt-post-fleet.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "egypt-post-fleet",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "egypt-post-fleet.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "4686161514",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:4686161514:web:ece1ca6223ff20ad598c13",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-CHYXHJYEWV"
};

// Initialize Firebase app singleton
let app = null;
let db = null;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  db = getFirestore(app);
} catch (err) {
  console.warn('Firebase client SDK initialized in offline mode:', err.message);
}

// Realtime listener for instant live updates from Cloud Firestore
export function subscribeToFleetData(onDataUpdate) {
  if (!db) return () => {};
  try {
    return onSnapshot(doc(db, 'fleet_database', 'main'), (docSnap) => {
      if (docSnap.exists() && docSnap.data() && docSnap.data().data) {
        onDataUpdate(docSnap.data().data);
      }
    }, (err) => {
      console.warn('Firestore live subscription fallback:', err.message);
    });
  } catch (e) {
    return () => {};
  }
}

export { app, db };
