
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewiq-4daf5.firebaseapp.com",
  projectId: "interviewiq-4daf5",
  storageBucket: "interviewiq-4daf5.firebasestorage.app",
  messagingSenderId: "672718669623",
  appId: "1:672718669623:web:8ac42600255a186f1bbcb2"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app)

const provider = new GoogleAuthProvider()

export {auth,provider}