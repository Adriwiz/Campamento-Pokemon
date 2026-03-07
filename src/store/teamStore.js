import { create } from 'zustand';

/**
 * Store global para el equipo Pokémon.
 * - currentTeam: los hasta 6 Pokémon del equipo en construcción.
 * - savedTeams: equipos guardados en Firestore del usuario.
 */
export const useTeamStore = create((set, get) => ({
    currentTeam: [],    // Array de objetos Pokémon (máx. 6)
    savedTeams: [],     // Array de equipos desde Firestore
    teamName: '',       // Nombre del equipo actual

    setTeamName: (name) => set({ teamName: name }),

    addToTeam: (pokemon) => {
        const { currentTeam } = get();
        if (currentTeam.length >= 6) return; // Máximo 6
        if (currentTeam.find((p) => p.id === pokemon.id)) return; // Sin duplicados
        set({ currentTeam: [...currentTeam, pokemon] });
    },

    removeFromTeam: (pokemonId) =>
        set((state) => ({
            currentTeam: state.currentTeam.filter((p) => p.id !== pokemonId),
        })),

    clearTeam: () => set({ currentTeam: [], teamName: '' }),

    setSavedTeams: (teams) => set({ savedTeams: teams }),

    addSavedTeam: (team) =>
        set((state) => ({ savedTeams: [team, ...state.savedTeams] })),

    removeSavedTeam: (teamId) =>
        set((state) => ({
            savedTeams: state.savedTeams.filter((t) => t.id !== teamId),
        })),
}));
