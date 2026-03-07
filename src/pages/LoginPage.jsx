import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { loginWithEmail, registerWithEmail } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { cn } from '../utils/cn';
import Button from '../components/ui/Button';

export default function LoginPage() {
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setUser, setRole } = useAuthStore();

    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async ({ email, password }) => {
        setError(''); setLoading(true);
        try {
            const fn = isRegister ? registerWithEmail : loginWithEmail;
            const { user, role } = await fn(email, password);
            setUser(user); setRole(role);
            navigate('/pokedex');
        } catch (err) {
            const msgs = {
                'auth/user-not-found': 'Usuario no encontrado.',
                'auth/wrong-password': 'Contraseña incorrecta.',
                'auth/invalid-credential': 'Correo o contraseña incorrectos.',
                'auth/email-already-in-use': 'El correo ya está en uso.',
                'auth/invalid-email': 'Correo electrónico inválido.',
                'auth/weak-password': 'La contraseña debe tener mínimo 6 caracteres.',
            };
            setError(msgs[err.code] || 'Error desconocido. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{ backgroundColor: 'var(--screen-bg)' }}>

            {/* Decoración de fondo estilo Pokédex */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Mitad roja */}
                <div className="absolute top-0 left-0 w-full h-1/2 opacity-5"
                    style={{ background: 'linear-gradient(135deg, #CC0000, #660000)' }} />
                {/* Círculo central decorativo */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 border-8 border-white" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-5 border-4 border-blue-400" />
            </div>

            <div className="relative w-full max-w-sm">

                {/* Logo / cabecera */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-black mb-4 shadow-2xl"
                        style={{ background: 'linear-gradient(135deg, #CC0000 50%, #0a0f1e 50%)' }}>
                        <span className="text-4xl">🏕️</span>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        Campamento<br />
                        <span style={{ color: '#CC0000' }}>Pokémon</span>
                    </h1>
                </div>

                {/* Card formulario */}
                <div className="rounded-2xl border-4 border-black shadow-2xl overflow-hidden screen-glow"
                    style={{ backgroundColor: 'var(--screen-blue)' }}>

                    {/* Toggle login / registro */}
                    <div className="grid grid-cols-2 border-b-4 border-black">
                        {[['⚔️ Entrar', false], ['✨ Registrar', true]].map(([label, isReg]) => (
                            <button
                                key={label}
                                onClick={() => { setIsRegister(isReg); setError(''); }}
                                className={cn(
                                    'py-3 text-sm font-black transition-all',
                                    isRegister === isReg
                                        ? 'text-white' : 'text-blue-400 hover:text-white'
                                )}
                                style={isRegister === isReg
                                    ? { background: 'linear-gradient(135deg, #CC0000, #990000)' }
                                    : { backgroundColor: 'var(--screen-bg)' }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-black text-blue-300 mb-1.5 uppercase tracking-wider">
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                autoComplete="email"
                                placeholder="ash@pokemon.com"
                                className={cn(
                                    'w-full rounded-xl px-4 py-3 text-white text-sm placeholder-blue-700 focus:outline-none focus:ring-2 border-2 transition-all',
                                    errors.email
                                        ? 'border-red-600 focus:ring-red-600'
                                        : 'border-blue-900 focus:ring-blue-500 focus:border-blue-500'
                                )}
                                style={{ backgroundColor: 'var(--screen-bg)' }}
                                {...register('email', {
                                    required: 'El correo es obligatorio',
                                    pattern: { value: /\S+@\S+\.\S+/, message: 'Correo inválido' },
                                })}
                            />
                            {errors.email && <p className="text-red-400 text-xs mt-1">⚠ {errors.email.message}</p>}
                        </div>

                        {/* Contraseña */}
                        <div>
                            <label className="block text-xs font-black text-blue-300 mb-1.5 uppercase tracking-wider">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                autoComplete={isRegister ? 'new-password' : 'current-password'}
                                placeholder="••••••••"
                                className={cn(
                                    'w-full rounded-xl px-4 py-3 text-white text-sm placeholder-blue-700 focus:outline-none focus:ring-2 border-2 transition-all',
                                    errors.password
                                        ? 'border-red-600 focus:ring-red-600'
                                        : 'border-blue-900 focus:ring-blue-500 focus:border-blue-500'
                                )}
                                style={{ backgroundColor: 'var(--screen-bg)' }}
                                {...register('password', {
                                    required: 'La contraseña es obligatoria',
                                    minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                                })}
                            />
                            {errors.password && <p className="text-red-400 text-xs mt-1">⚠ {errors.password.message}</p>}
                        </div>

                        {/* Error global */}
                        {error && (
                            <div className="border-2 border-red-800 rounded-xl px-4 py-3 bg-[#1a0505]">
                                <p className="text-red-400 text-sm font-bold">⚠️ {error}</p>
                            </div>
                        )}

                        <Button type="submit" className="w-full py-3 text-base mt-1" disabled={loading}>
                            {loading ? '⏳ Conectando...' : isRegister ? '✨ Crear cuenta de Entrenador' : '⚔️ Entrar al campamento'}
                        </Button>

                        <p className="text-center text-blue-700 text-xs">
                            El rol Administrador se asigna desde la consola de Firebase.
                        </p>
                    </form>
                </div>

                {/* Indicadores decorativos de Pokédex */}
                <div className="flex justify-center gap-3 mt-5">
                    {['#CC0000', '#3b82f6', '#22c55e'].map((c, i) => (
                        <div key={i} className="w-3 h-3 rounded-full border-2 border-black shadow"
                            style={{ backgroundColor: c }} />
                    ))}
                </div>
            </div>
        </div>
    );
}