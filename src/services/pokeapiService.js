const BASE_URL = "https://pokeapi.co/api/v2";

// Cache en memoria para evitar peticiones duplicadas en la misma sesión
const cache = new Map();

async function fetchWithCache(url) {
    if (cache.has(url)) return cache.get(url);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error ${res.status}: ${url}`);
    const data = await res.json();
    cache.set(url, data);
    return data;
}

// ─────────────────────────────────────────────
// POKÉMON
// ─────────────────────────────────────────────

/**
 * Lista paginada de Pokémon (solo nombre + URL).
 * @param {number} limit
 * @param {number} offset
 */
export const getPokemonList = (limit = 20, offset = 0) =>
    fetchWithCache(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);

/**
 * Detalle completo de un Pokémon (sprites, tipos, stats, etc.).
 * @param {string|number} nameOrId
 */
export const getPokemonDetail = (nameOrId) =>
    fetchWithCache(`${BASE_URL}/pokemon/${nameOrId}`);

// ─────────────────────────────────────────────
// OBJETOS (ITEMS)
// ─────────────────────────────────────────────

/**
 * Lista paginada de objetos.
 * @param {number} limit
 * @param {number} offset
 */
export const getItemList = (limit = 20, offset = 0) =>
    fetchWithCache(`${BASE_URL}/item?limit=${limit}&offset=${offset}`);

/**
 * Detalle de un objeto (nombre, efecto, sprite).
 * @param {string|number} nameOrId
 */
export const getItemDetail = (nameOrId) =>
    fetchWithCache(`${BASE_URL}/item/${nameOrId}`);
