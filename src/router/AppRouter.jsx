import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import PokedexPage from '../pages/PokedexPage';
import TeamBuilderPage from '../pages/TeamBuilderPage';
import ShopPage from '../pages/ShopPage';
import BackpackPage from '../pages/BackpackPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import ProtectedRoute from '../components/guards/ProtectedRoute';
import RoleGuard from '../components/guards/RoleGuard';

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/pokedex" element={<ProtectedRoute><PokedexPage /></ProtectedRoute>} />
            <Route path="/team" element={<ProtectedRoute><TeamBuilderPage /></ProtectedRoute>} />
            <Route path="/shop" element={<ProtectedRoute><ShopPage /></ProtectedRoute>} />
            <Route path="/backpack" element={<ProtectedRoute><BackpackPage /></ProtectedRoute>} />

            <Route
                path="/admin"
                element={
                    <ProtectedRoute>
                        <RoleGuard requiredRole="admin">
                            <AdminDashboardPage />
                        </RoleGuard>
                    </ProtectedRoute>
                }
            />

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}