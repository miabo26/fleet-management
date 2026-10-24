import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

// Client-side Firebase configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForFleetEgyptPost2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "egypt-post-fleet.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "egypt-post-fleet",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "egypt-post-fleet.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890"
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
