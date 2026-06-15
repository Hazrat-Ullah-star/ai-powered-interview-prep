import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDstmMSTxV2Zz6z4R6cbwUYLOpN6G4dKKs",
  authDomain: "ai-interview-prep-674ab.firebaseapp.com",
  projectId: "ai-interview-prep-674ab",
  storageBucket: "ai-interview-prep-674ab.firebasestorage.app",
  messagingSenderId: "870723157518",
  appId: "1:870723157518:web:3860278ebcaea5924d465f",
  measurementId: "G-NEBV2J471R"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;
