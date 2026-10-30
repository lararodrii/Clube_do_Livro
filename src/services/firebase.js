import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyASns3DwcnXGBXDLG4tL6EEccP4VtNJXj0",
  authDomain: "clube-do-livro-9e3a0.firebaseapp.com",
  projectId: "clube-do-livro-9e3a0",
  storageBucket: "clube-do-livro-9e3a0.firebasestorage.app",
  messagingSenderId: "528277607228",
  appId: "1:528277607228:web:84663619c23d657c530439"
};

// Inicializa o Firebase
export const app = initializeApp(firebaseConfig);

// Exporta o Firestore e o Auth para uso em toda a aplicação
export const db = getFirestore(app);
export const auth = getAuth(app);