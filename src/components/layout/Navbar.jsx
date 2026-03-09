import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { logout } from '../../services/authService';
import { cn } from '../../utils/cn';

const NAV_LINKS = [
    { to: '/pokedex', label: '📖 Pokédex' },
    { to: '/team', label: '⚔️ Equipo' },
    { to: '/shop', label: '🛒 Tienda' },
    { to: '/backpack', label: '🎒 Mochila' },
];

export default function Navbar() {
    const { user, role } = useAuthStore();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav
            className="sticky top-0 z-50 border-b-4 border-black shadow-xl"
            style={{ background: 'linear-gradient(135deg, #CC0000 0%, #990000 100%)' }}
        >
            <div className="h-1 bg-gradient-to-r from-black via-white/30 to-black" />
            <div className="max-w-[1920px] mx-auto px-4 xl:px-8 py-2 min-h-[3.5rem] flex flex-wrap items-center justify-between gap-y-3 gap-x-4">

                {/* Logo */}
                <Link
                    to="/pokedex"
                    className="flex items-center gap-2 font-black text-white text-xl tracking-tight hover:text-blue-200 transition-colors drop-shadow"
                >
                    <span className="text-2xl">🏕️</span>
                    <span className="hidden sm:inline">Campamento</span>
                    <span className="hidden lg:inline text-blue-200">Pokémon</span>
                </Link>

                {/* Nav links */}
                <ul className="flex items-center flex-wrap justify-center gap-1.5 flex-1 md:flex-none">
                    {NAV_LINKS.map(({ to, label }) => (
                        <li key={to}>
                            <Link
                                to={to}
                                className={cn(
                                    'px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 border',
                                    pathname === to
                                        ? 'bg-white text-red-700 border-white shadow-inner'
                                        : 'text-white border-white/20 hover:bg-white/10 hover:border-white/40'
                                )}
                            >
                                {label}
                            </Link>
                        </li>
                    ))}
                    {role === 'admin' && (
                        <li>
                            <Link
                                to="/admin"
                                className={cn(
                                    'px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 border ml-2',
                                    pathname === '/admin'
                                        ? 'bg-black text-white border-black'
                                        : 'text-black bg-white/90 border-white hover:bg-white'
                                )}
                            >
                                🛠️ Admin
                            </Link>
                        </li>
                    )}
                </ul>

                {/* User + logout */}
                <div className="flex items-center gap-2">
                    <span className={cn(
                        'hidden sm:flex w-3 h-3 rounded-full border-2 border-black shadow-inner',
                        role === 'admin' ? 'bg-yellow-300' : 'bg-blue-300'
                    )} />
                    <span className="hidden xl:block text-white/70 text-xs truncate max-w-[130px]">
                        {user.email}
                    </span>
                    <span className={cn(
                        'hidden sm:block text-xs px-2 py-0.5 rounded-full font-black border-2 border-black',
                        role === 'admin' ? 'bg-yellow-300 text-black' : 'bg-blue-200 text-black'
                    )}>
                        {role === 'admin' ? 'ADMIN' : 'TRAINER'}
                    </span>
                    <button
                        onClick={handleLogout}
                        className="text-xs font-bold text-white bg-black/40 hover:bg-black/70 border border-black/60 px-3 py-1.5 rounded-lg transition-all"
                    >
                        Salir
                    </button>
                </div>
            </div>
        </nav>
    );
}
