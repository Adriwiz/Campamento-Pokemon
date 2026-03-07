import { create } from 'zustand';

/**
 * Store global de autenticación.
 * Guarda el usuario de Firebase, su rol y el estado de carga inicial.
 */
export const useAuthStore = create((set) => ({
    user: null,
    role: null,       // 'user' | 'admin' | null
    loading: true,    // true mientras Firebase determina si hay sesión activa

    setUser: (user) => set({ user }),
    setRole: (role) => set({ role }),
    setLoading: (loading) => set({ loading }),

    clearAuth: () => set({ user: null, role: null, loading: false }),
}));
