import {
    collection,
    addDoc,
    setDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// ─────────────────────────────────────────────
// EQUIPOS POKÉMON  (colección: "teams")
// ─────────────────────────────────────────────

/**
 * Guarda un nuevo equipo en Firestore para el usuario autenticado.
 * @param {string} userId - UID de Firebase Auth
 * @param {{ name: string, pokemon: object[] }} team
 * @returns {Promise<string>} ID del documento creado
 */
export const saveTeam = async (userId, team) => {
    const docRef = await addDoc(collection(db, "teams"), {
        userId,
        name: team.name || "Mi equipo",
        pokemon: team.pokemon,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

/**
 * Obtiene todos los equipos del usuario.
 * @param {string} userId
 * @returns {Promise<object[]>}
 */
export const getUserTeams = async (userId) => {
    const q = query(collection(db, "teams"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Elimina un equipo por su ID de documento.
 * @param {string} teamId
 */
export const deleteTeam = async (teamId) => {
    await deleteDoc(doc(db, "teams", teamId));
};

// ─────────────────────────────────────────────
// CATÁLOGO DE LA TIENDA  (colección: "shopItems")
// ─────────────────────────────────────────────

/**
 * Obtiene todos los objetos del catálogo.
 * @returns {Promise<object[]>}
 */
export const getShopItems = async () => {
    const snapshot = await getDocs(collection(db, "shopItems"));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * [Admin] Añade un nuevo objeto al catálogo.
 * @param {{ name, description, price, imageUrl, pokéapiId }} item
 * @returns {Promise<string>} ID del nuevo documento
 */
export const addShopItem = async (item) => {
    const docRef = await addDoc(collection(db, "shopItems"), {
        ...item,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

/**
 * [Admin] Modifica un objeto existente (por ej. su precio).
 * @param {string} itemId
 * @param {object} data - Campos a actualizar
 */
export const updateShopItem = async (itemId, data) => {
    await updateDoc(doc(db, "shopItems", itemId), data);
};

/**
 * [Admin] Elimina un objeto del catálogo.
 * @param {string} itemId
 */
export const deleteShopItem = async (itemId) => {
    await deleteDoc(doc(db, "shopItems", itemId));
};

// ─────────────────────────────────────────────
// OBJETOS COMPRADOS  (subcolección: "users/{uid}/ownedItems")
// ─────────────────────────────────────────────

/**
 * Obtiene los IDs de los objetos que el usuario posee.
 * @param {string} userId
 * @returns {Promise<string[]>}
 */
export const getOwnedItems = async (userId) => {
    const snapshot = await getDocs(
        collection(db, "users", userId, "ownedItems")
    );
    // Devuelve el campo itemId, NO el ID autogenerado del documento
    return snapshot.docs.map((d) => d.data().itemId);
};

/**
 * Registra la compra de un objeto.
 * Usa setDoc con itemId como ID del doc → sin duplicados + lookup fiable.
 * @param {string} userId
 * @param {string} itemId
 */
export const buyItem = async (userId, itemId) => {
    await setDoc(doc(db, "users", userId, "ownedItems", itemId), {
        itemId,
        boughtAt: serverTimestamp(),
    });
};
