import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

/**
 * Protege rutas que requieren autenticación.
 * Si está cargando muestra un spinner.
 * Si no hay usuario redirige a /login.
 */
export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuthStore();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
