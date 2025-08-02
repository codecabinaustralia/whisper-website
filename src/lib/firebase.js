import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyATr1pFGz01Mt_DWkzw_-2WwEDWSbHZSG4",
  authDomain: "whisper-f221f.firebaseapp.com",
  projectId: "whisper-f221f",
  storageBucket: "whisper-f221f.firebasestorage.app",
  messagingSenderId: "203780711643",
  appId: "1:203780711643:web:44deb7806e4e6c7f1c58fe"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
