import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTeamStore } from '../store/teamStore';
import { saveTeam, getUserTeams, deleteTeam } from '../services/firestoreService';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';

const SLOTS = Array.from({ length: 6 });

export default function TeamBuilderPage() {
    const { user } = useAuthStore();
    const {
        currentTeam, teamName, setTeamName,
        removeFromTeam, clearTeam,
        savedTeams, setSavedTeams, addSavedTeam, removeSavedTeam,
    } = useTeamStore();

    const [saving, setSaving] = useState(false);
    const [loadingTeams, setLoadingTeams] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        if (!user) return;
        getUserTeams(user.uid)
            .then(setSavedTeams)
            .finally(() => setLoadingTeams(false));
    }, [user, setSavedTeams]);

    const handleSave = async () => {
        if (currentTeam.length === 0) return setError('Añade al menos un Pokémon al equipo.');
        setError(''); setSaving(true);
        try {
            const id = await saveTeam(user.uid, { name: teamName || 'Mi equipo', pokemon: currentTeam });
            addSavedTeam({ id, name: teamName || 'Mi equipo', pokemon: currentTeam });
            clearTeam();
            setSuccessMsg('¡Equipo guardado! 🎉');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch { setError('Error al guardar. Inténtalo de nuevo.'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (teamId) => {
        await deleteTeam(teamId);
        removeSavedTeam(teamId);
    };

    return (
        <PageWrapper>
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white mb-1">
                    ⚔️ Constructor de <span style={{ color: '#CC0000' }}>Equipo</span>
                </h1>
                <p className="text-blue-300 text-sm">
                    {currentTeam.length}/6 Pokémon · Añádelos desde la Pokédex
                </p>
            </div>

            {/* Equipo actual */}
            <Card className="p-6 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <input
                        type="text"
                        placeholder="Nombre del equipo..."
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="rounded-xl px-4 py-2 text-white text-sm placeholder-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 border-2 border-blue-900 flex-1 max-w-xs"
                        style={{ backgroundColor: 'var(--screen-bg)' }}
                    />
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={clearTeam} disabled={currentTeam.length === 0}>
                            Limpiar
                        </Button>
                        <Button onClick={handleSave} disabled={saving || currentTeam.length === 0}>
                            {saving ? '⏳ Guardando...' : '💾 Guardar equipo'}
                        </Button>
                    </div>
                </div>

                {error && <p className="text-red-400 text-sm mb-3 font-bold">⚠️ {error}</p>}
                {successMsg && <p className="text-green-400 text-sm mb-3 font-bold">{successMsg}</p>}

                {/* 6 slots */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {SLOTS.map((_, i) => {
                        const pokemon = currentTeam[i];
                        return (
                            <div
                                key={i}
                                className="aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-2 transition-all duration-200"
                                style={{
                                    borderColor: pokemon ? '#CC0000' : '#1e3a5f',
                                    backgroundColor: pokemon ? '#2a0a0a' : 'var(--screen-bg)',
                                    borderStyle: pokemon ? 'solid' : 'dashed',
                                }}
                            >
                                {pokemon ? (
                                    <>
                                        <img
                                            src={pokemon.sprite}
                                            alt={pokemon.name}
                                            className="w-12 h-12 object-contain drop-shadow"
                                            style={{ imageRendering: 'pixelated' }}
                                        />
                                        <p className="text-white text-xs font-black capitalize mt-1 truncate w-full text-center">
                                            {pokemon.name}
                                        </p>
                                        <button
                                            onClick={() => removeFromTeam(pokemon.id)}
                                            className="text-red-400 text-xs hover:text-red-200 mt-0.5 font-bold transition-colors"
                                        >
                                            ✕ Quitar
                                        </button>
                                    </>
                                ) : (
                                    <div className="w-10 h-10 rounded-full border-2 border-blue-900/50 flex items-center justify-center">
                                        <span className="text-blue-800 font-black text-sm">{i + 1}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Equipos guardados */}
            <div>
                <h2 className="text-xl font-black text-white mb-4">📋 Mis equipos guardados</h2>
                {loadingTeams ? (
                    <Loader message="Cargando equipos..." />
                ) : savedTeams.length === 0 ? (
                    <div className="text-center py-12 text-blue-400">
                        <p className="text-4xl mb-3">📭</p>
                        <p className="font-bold text-white mb-1">Aún no tienes equipos guardados.</p>
                        <p className="text-sm">Crea tu primer equipo y guárdalo.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
                        {savedTeams.map((team) => (
                            <Card key={team.id} className="p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-black text-white capitalize">{team.name}</h3>
                                    <button
                                        onClick={() => handleDelete(team.id)}
                                        className="text-red-500 hover:text-red-300 text-sm font-bold transition-colors"
                                    >
                                        🗑️ Borrar
                                    </button>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {team.pokemon.map((p) => (
                                        <div key={p.id} className="flex flex-col items-center">
                                            <img
                                                src={p.sprite}
                                                alt={p.name}
                                                className="w-12 h-12 object-contain"
                                                style={{ imageRendering: 'pixelated' }}
                                            />
                                            <span className="text-xs text-blue-300 capitalize">{p.name}</span>
                                            <div className="flex gap-0.5 mt-0.5">
                                                {p.types?.map((t) => (
                                                    <Badge key={t} label={t} type={t} className="text-[10px] px-1" />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </PageWrapper>
    );
}