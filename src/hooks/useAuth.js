import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getUserRole } from '../services/authService';
import { useAuthStore } from '../store/authStore';

/**
 * Hook que escucha los cambios de sesión de Firebase Auth.
 * Actualiza el store global con el usuario y su rol.
 * Debe montarse UNA sola vez, en App.jsx.
 */
export function useAuth() {
    const { setUser, setRole, setLoading, clearAuth } = useAuthStore();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const role = await getUserRole(firebaseUser.uid);
                setUser(firebaseUser);
                setRole(role);
            } else {
                clearAuth();
            }
            setLoading(false);
        });

        // Limpieza al desmontar
        return () => unsubscribe();
    }, [setUser, setRole, setLoading, clearAuth]);
}
