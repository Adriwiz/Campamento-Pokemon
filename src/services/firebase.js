import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBuqmM8vrhCUefUhh0HnpcyzUOvHriuLhk",
    authDomain: "campamento-pokemon.firebaseapp.com",
    projectId: "campamento-pokemon",
    storageBucket: "campamento-pokemon.firebasestorage.app",
    messagingSenderId: "527674584924",
    appId: "1:527674584924:web:8ddfaa29514d6605365b99",
};

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);

// Exportamos los servicios que vamos a usar en el resto de la app
export const auth = getAuth(app);
export const db = getFirestore(app);