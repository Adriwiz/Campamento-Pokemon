import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

// 1. Registrar un nuevo usuario (por defecto será "user")
export const registerWithEmail = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Cuando se registra, creamos un documento en Firestore para guardar su rol
        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            role: "user" // Por defecto, todos empiezan como usuarios normales
        });

        return { user, role: "user" };
    } catch (error) {
        console.error("Error al registrar:", error);
        throw error;
    }
};

// 2. Iniciar sesión
export const loginWithEmail = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Al hacer login, buscamos qué rol tiene en la base de datos
        const role = await getUserRole(user.uid);

        return { user, role };
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        throw error;
    }
};

// 3. Cerrar sesión
export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        throw error;
    }
};

// 4. Obtener el rol del usuario desde la base de datos
export const getUserRole = async (uid) => {
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data().role;
        } else {
            return "user"; // Por seguridad, si no existe el documento asumimos que es usuario base
        }
    } catch (error) {
        console.error("Error al obtener el rol:", error);
        return "user";
    }
};