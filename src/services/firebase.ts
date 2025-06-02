import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.YOUTUBE_API_KEY;
  authDomain: "watchai-74038.firebaseapp.com",
  projectId: "watchai-74038",
  storageBucket: "watchai-74038.firebasestorage.app",
  messagingSenderId: "670204095709",
  appId: "1:670204095709:web:ccb0707d5c6cb5e60e7f34",
  measurementId: "G-ZSTJYL5BNX"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
