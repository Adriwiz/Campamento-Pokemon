import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

/**
 * Protege rutas según el rol del usuario.
 * Si el rol no coincide, redirige a /pokedex.
 *
 * @param {'admin'|'user'} requiredRole - Rol mínimo necesario para acceder
 */
export default function RoleGuard({ children, requiredRole }) {
    const { role, loading } = useAuthStore();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (role !== requiredRole) {
        return <Navigate to="/pokedex" replace />;
    }

    return children;
}
