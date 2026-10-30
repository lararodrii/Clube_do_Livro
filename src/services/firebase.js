import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyASns3DwcnXGBXDLG4tL6EEccP4VtNJXj0",
  authDomain: "clube-do-livro-9e3a0.firebaseapp.com",
  projectId: "clube-do-livro-9e3a0",
  storageBucket: "clube-do-livro-9e3a0.firebasestorage.app",
  messagingSenderId: "528277607228",
  appId: "1:528277607228:web:84663619c23d657c530439"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta o Firestore para ser usado em qualquer lugar do app
export const db = getFirestore(app);