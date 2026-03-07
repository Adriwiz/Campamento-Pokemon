import { useState, useEffect, useCallback, useRef } from 'react';
import { getPokemonList, getPokemonDetail } from '../services/pokeapiService';
import { useTeamStore } from '../store/teamStore';
import PageWrapper from '../components/layout/PageWrapper';
import Paginator from '../components/ui/Paginator';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import Modal from '../components/ui/Modal';
import { cn } from '../utils/cn';

const PAGE_SIZE = 20;

// Artwork de alta resolución (formas no siempre lo tienen → fallback a sprite normal)
const artworkUrl = (id) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

const idFromUrl = (url) => Number(url.replace(/\/$/, '').split('/').pop());

// ─── Tipos con colores propios ────────────────────────────────────────────
const TYPES = [
    { name: 'fire', color: '#ef4444', bg: '#450a0a' },
    { name: 'water', color: '#60a5fa', bg: '#0c1a3a' },
    { name: 'grass', color: '#4ade80', bg: '#052e16' },
    { name: 'electric', color: '#facc15', bg: '#1a1203' },
    { name: 'ice', color: '#67e8f9', bg: '#083344' },
    { name: 'fighting', color: '#fb923c', bg: '#431407' },
    { name: 'poison', color: '#c084fc', bg: '#2e1065' },
    { name: 'ground', color: '#fbbf24', bg: '#422006' },
    { name: 'flying', color: '#7dd3fc', bg: '#082f49' },
    { name: 'psychic', color: '#f472b6', bg: '#500724' },
    { name: 'bug', color: '#a3e635', bg: '#1a2e05' },
    { name: 'rock', color: '#d6d3d1', bg: '#1c1917' },
    { name: 'ghost', color: '#a78bfa', bg: '#1c0038' },
    { name: 'dragon', color: '#818cf8', bg: '#1e1b4b' },
    { name: 'dark', color: '#9ca3af', bg: '#111827' },
    { name: 'steel', color: '#cbd5e1', bg: '#0f172a' },
    { name: 'fairy', color: '#f9a8d4', bg: '#4a0520' },
    { name: 'normal', color: '#d1d5db', bg: '#1f2937' },
];

// ─── Generaciones por rango de ID ─────────────────────────────────────────
// Los Pokémon con formas/megas/variantes tienen ID >= 10001 en PokéAPI
const GENERATIONS = [
    { label: 'Todos', min: 1, max: 99999 },
    { label: 'Gen I', min: 1, max: 151 },
    { label: 'Gen II', min: 152, max: 251 },
    { label: 'Gen III', min: 252, max: 386 },
    { label: 'Gen IV', min: 387, max: 493 },
    { label: 'Gen V', min: 494, max: 649 },
    { label: 'Gen VI', min: 650, max: 721 },
    { label: 'Gen VII', min: 722, max: 809 },
    { label: 'Gen VIII', min: 810, max: 905 },
    { label: 'Gen IX', min: 906, max: 1025 },
    { label: '✨ Formas', min: 10001, max: 99999 },
];

export default function PokedexPage() {
    // Catálogo completo (Pokémon estándar + formas/variantes)
    const allPokemonRef = useRef([]);
    const typeCacheRef = useRef({});
    const [catalogLoaded, setCatalogLoaded] = useState(false);

    const [displayList, setDisplayList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filtros
    const [search, setSearch] = useState('');
    const [activeType, setActiveType] = useState(null);
    const [activeGen, setActiveGen] = useState(GENERATIONS[0]);

    const [page, setPage] = useState(0);
    const [totalFiltered, setTotalFiltered] = useState(0);

    // Modal
    const [selected, setSelected] = useState(null);

    const { currentTeam, addToTeam } = useTeamStore();

    // ── 1. Carga catálogo completo incluyendo formas (hasta ~3000) ──────────
    useEffect(() => {
        // Cargamos estándar (1-1025) + formas (10001+) en dos peticiones paralelas
        Promise.all([
            getPokemonList(1025, 0),       // Gen I–IX regulares
            getPokemonList(2000, 1025),    // formas / variantes con ID >= 10001
        ]).then(([regular, extras]) => {
            const regularEntries = regular.results.map((p) => ({
                name: p.name,
                id: idFromUrl(p.url),
            }));
            // Las "formas" en PokéAPI tienen IDs >= 10001 (no son consecutivas)
            const formEntries = extras.results
                .map((p) => ({ name: p.name, id: idFromUrl(p.url) }))
                .filter((p) => p.id >= 10001);   // descartar slots vacíos/futuros

            allPokemonRef.current = [...regularEntries, ...formEntries];
            setCatalogLoaded(true);
        });
    }, []);

    // ── 2. Filtra + pagina cada vez que cambia un filtro ────────────────────
    const loadPage = useCallback(async () => {
        if (!catalogLoaded) return;
        setLoading(true);

        let filtered = allPokemonRef.current;

        // Filtro por tipo (cache de listas de tipo desde PokéAPI)
        if (activeType) {
            if (!typeCacheRef.current[activeType]) {
                const res = await fetch(`https://pokeapi.co/api/v2/type/${activeType}`);
                const data = await res.json();
                typeCacheRef.current[activeType] = new Set(data.pokemon.map((e) => e.pokemon.name));
            }
            const typeSet = typeCacheRef.current[activeType];
            filtered = filtered.filter((p) => typeSet.has(p.name));
        }

        // Filtro por generación / ID range
        filtered = filtered.filter((p) => p.id >= activeGen.min && p.id <= activeGen.max);

        // Filtro por texto
        const q = search.toLowerCase().trim();
        if (q) filtered = filtered.filter((p) => p.name.includes(q));

        setTotalFiltered(filtered.length);

        const slice = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
        const details = await Promise.all(slice.map((p) => getPokemonDetail(p.id)));
        setDisplayList(details);
        setLoading(false);
    }, [catalogLoaded, search, activeType, activeGen, page]);

    useEffect(() => { loadPage(); }, [loadPage]);

    const resetPage = () => setPage(0);
    const handleSearch = (e) => { setSearch(e.target.value); resetPage(); };
    const handleType = (t) => { setActiveType((prev) => (prev === t ? null : t)); resetPage(); };
    const handleGen = (g) => { setActiveGen(g); resetPage(); };

    const handleAddToTeam = (pokemon) =>
        addToTeam({
            id: pokemon.id,
            name: pokemon.name,
            sprite: pokemon.sprites.front_default,
            types: pokemon.types.map((t) => t.type.name),
        });

    const totalPages = Math.ceil(totalFiltered / PAGE_SIZE);
    const inTeam = (id) => currentTeam.some((p) => p.id === id);
    const statColor = (v) => v >= 100 ? '#22c55e' : v >= 60 ? '#3b82f6' : '#CC0000';

    return (
        <PageWrapper>
            {/* Header + buscador */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                <div>
                    <h1 className="text-3xl font-black text-white mb-0.5">
                        📖 <span style={{ color: '#CC0000' }}>Poké</span>dex
                    </h1>
                    <p className="text-blue-300 text-sm">
                        {catalogLoaded ? `${totalFiltered.toLocaleString()} Pokémon encontrados` : 'Cargando catálogo...'}
                    </p>
                </div>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-sm">🔍</span>
                    <input type="text" placeholder="Buscar en toda la Pokédex..." value={search} onChange={handleSearch}
                        className="pl-9 pr-8 py-2.5 rounded-xl border-2 border-blue-900 text-white placeholder-blue-600 focus:outline-none focus:border-blue-400 text-sm w-full sm:w-72"
                        style={{ backgroundColor: '#0f1d3a' }} />
                    {search && (
                        <button onClick={() => { setSearch(''); resetPage(); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-white text-xs">✕</button>
                    )}
                </div>
            </div>

            {/* ─── Filtros ───────────────────────────────────────────────────── */}
            <div className="mb-5 space-y-3">
                {/* Generación */}
                <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest w-8">Gen</span>
                    {GENERATIONS.map((g) => (
                        <button key={g.label} onClick={() => handleGen(g)}
                            className={cn(
                                'px-2.5 py-1 rounded-lg text-xs font-black border-2 transition-all',
                                activeGen.label === g.label
                                    ? 'bg-[#CC0000] border-black text-white'
                                    : 'border-blue-900 text-blue-400 hover:border-blue-500 hover:text-white bg-[var(--screen-bg)]'
                            )}>
                            {g.label}
                        </button>
                    ))}
                </div>

                {/* Tipos */}
                <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest w-8">Tipo</span>
                    {TYPES.map((t) => {
                        const isActive = activeType === t.name;
                        return (
                            <button key={t.name} onClick={() => handleType(t.name)}
                                className={cn(
                                    'px-2.5 py-1 rounded-lg text-xs font-black border-2 capitalize transition-all',
                                    isActive ? 'border-black scale-105' : 'border-transparent hover:border-black/30'
                                )}
                                style={{
                                    backgroundColor: isActive ? t.color : t.bg,
                                    color: isActive ? '#000' : t.color,
                                }}>
                                {t.name}
                            </button>
                        );
                    })}
                    {activeType && (
                        <button onClick={() => { setActiveType(null); resetPage(); }}
                            className="px-2 py-1 rounded-lg text-xs font-black border-2 border-blue-900 text-blue-400 hover:text-white bg-[var(--screen-bg)]">
                            ✕ Tipo
                        </button>
                    )}
                </div>
            </div>

            {/* ─── Grid ───────────────────────────────────────────────────────── */}
            {loading ? (
                <Loader message="Cargando Pokémon..." />
            ) : displayList.length === 0 ? (
                <div className="text-center py-20 text-blue-400">
                    <p className="text-5xl mb-3">🔍</p>
                    <p className="font-bold text-white mb-1">Sin resultados</p>
                    <p className="text-sm">Prueba con otros filtros o un nombre distinto.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-8 gap-3">
                        {displayList.map((pokemon) => (
                            <Card key={pokemon.id} className="p-3 flex flex-col items-center gap-2 cursor-pointer group"
                                onClick={() => setSelected(pokemon)}>
                                <div className="relative w-full flex justify-center">
                                    <div className="w-20 h-20 rounded-xl flex items-center justify-center border border-blue-900/40"
                                        style={{ backgroundColor: 'var(--screen-bg)' }}>
                                        <img src={pokemon.sprites.front_default}
                                            alt={pokemon.name}
                                            className="w-16 h-16 object-contain group-hover:scale-110 transition-transform duration-300"
                                            style={{ imageRendering: 'pixelated' }} />
                                    </div>
                                    <span className="absolute top-0 right-0 text-[10px] bg-black/70 text-blue-300 rounded-full px-1.5 py-0.5 font-mono">
                                        #{String(pokemon.id).padStart(3, '0')}
                                    </span>
                                </div>
                                <p className="text-white font-black text-xs capitalize text-center leading-tight">{pokemon.name}</p>
                                <div className="flex flex-wrap gap-1 justify-center">
                                    {pokemon.types.map((t) => <Badge key={t.type.name} label={t.type.name} type={t.type.name} />)}
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); handleAddToTeam(pokemon); }}
                                    disabled={inTeam(pokemon.id) || currentTeam.length >= 6}
                                    className="mt-auto w-full text-xs font-black py-1 rounded-lg border-2 border-black transition-all bg-[#CC0000] text-white hover:bg-[#ee0000] disabled:bg-blue-900/40 disabled:text-blue-400 disabled:border-blue-900 disabled:cursor-not-allowed">
                                    {inTeam(pokemon.id) ? '✓ En equipo' : '+ Añadir'}
                                </button>
                            </Card>
                        ))}
                    </div>

                    <Paginator page={page} totalPages={totalPages} onPageChange={setPage} />
                </>
            )}

            {/* ─── Modal detalle ──────────────────────────────────────────────── */}
            <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name}>
                {!selected ? null : (
                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="flex flex-col items-center gap-3 sm:w-40">
                            <img src={artworkUrl(selected.id)} alt={selected.name}
                                className="w-36 h-36 object-contain drop-shadow-2xl"
                                onError={(e) => { e.target.src = selected.sprites.front_default; }} />
                            <div className="flex gap-1 flex-wrap justify-center">
                                {selected.types.map((t) => <Badge key={t.type.name} label={t.type.name} type={t.type.name} />)}
                            </div>
                            <span className="text-blue-400 text-xs font-mono">#{String(selected.id).padStart(3, '0')}</span>
                            <Button onClick={() => { handleAddToTeam(selected); setSelected(null); }}
                                disabled={inTeam(selected.id) || currentTeam.length >= 6} className="w-full text-xs">
                                {inTeam(selected.id) ? '✓ Ya en equipo' : '⚔️ Añadir al equipo'}
                            </Button>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-blue-400 text-xs font-black uppercase tracking-widest mb-3">Stats base</p>
                            <div className="space-y-2.5">
                                {selected.stats.map((s) => (
                                    <div key={s.stat.name}>
                                        <div className="flex justify-between text-xs mb-1 capitalize">
                                            <span className="text-blue-300">{s.stat.name.replace('special-', 'sp.')}</span>
                                            <span className="text-white font-black">{s.base_stat}</span>
                                        </div>
                                        <div className="h-2 bg-[#0a0f1e] rounded-full overflow-hidden border border-blue-900/50">
                                            <div className="h-full rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min((s.base_stat / 255) * 100, 100)}%`, backgroundColor: statColor(s.base_stat) }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                                {[['Altura', `${selected.height / 10} m`], ['Peso', `${selected.weight / 10} kg`],
                                ['Exp. base', selected.base_experience], ['Habilidades', selected.abilities.length]
                                ].map(([label, val]) => (
                                    <div key={label} className="flex justify-between border-b border-blue-900/40 pb-1">
                                        <span className="text-blue-400">{label}</span>
                                        <span className="text-white font-bold">{val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </PageWrapper>
    );
}