import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDowL9MO2vSkXIFyHLZKdg9T6waAxd26oQ",
    authDomain: "sports-app-ba935.firebaseapp.com",
    projectId: "sports-app-ba935",
    storageBucket: "sports-app-ba935.firebasestorage.app",
    messagingSenderId: "400813629764",
    appId: "1:400813629764:web:6af909bd31d124edd5b711"
};

// Initialize Firebase (prevent multiple initializations)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
