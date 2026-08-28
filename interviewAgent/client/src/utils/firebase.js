
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY || "AIzaSyCaVuVfoRmvM4mu-_fOeo-YpZjAThMPzts",
  authDomain: "interviewiq-da893.firebaseapp.com",
  projectId: "interviewiq-da893",
  storageBucket: "interviewiq-da893.firebasestorage.app",
  messagingSenderId: "1050386277002",
  appId: "1:1050386277002:web:b8ad3947a397795a168373"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };