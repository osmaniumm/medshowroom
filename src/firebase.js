import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCovWIESHCFITsDqxwZu-4z5qqfDbnlQcY",
  authDomain: "rwk-showroom.firebaseapp.com",
  projectId: "rwk-showroom",
  storageBucket: "rwk-showroom.firebasestorage.app",
  messagingSenderId: "992110517885",
  appId: "1:992110517885:web:84b28d8c7b6d44171d1b14"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);