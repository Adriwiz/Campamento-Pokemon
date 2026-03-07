import { cn } from '../../utils/cn';

const TYPE_COLORS = {
    fire: 'bg-red-500/20 text-red-400',
    water: 'bg-blue-500/20 text-blue-400',
    grass: 'bg-green-500/20 text-green-400',
    electric: 'bg-yellow-400/20 text-yellow-400',
    ice: 'bg-cyan-400/20 text-cyan-400',
    fighting: 'bg-orange-600/20 text-orange-400',
    poison: 'bg-purple-500/20 text-purple-400',
    ground: 'bg-amber-600/20 text-amber-400',
    flying: 'bg-sky-400/20 text-sky-400',
    psychic: 'bg-pink-500/20 text-pink-400',
    bug: 'bg-lime-500/20 text-lime-400',
    rock: 'bg-stone-500/20 text-stone-400',
    ghost: 'bg-indigo-600/20 text-indigo-400',
    dragon: 'bg-violet-600/20 text-violet-400',
    dark: 'bg-gray-600/20 text-gray-400',
    steel: 'bg-slate-400/20 text-slate-400',
    fairy: 'bg-rose-400/20 text-rose-400',
    normal: 'bg-gray-500/20 text-gray-300',
    admin: 'bg-red-500/20 text-red-400',
    user: 'bg-yellow-400/20 text-yellow-400',
};

/**
 * Etiqueta colorida para tipos Pokémon, roles, etc.
 * @param {string} label - Texto a mostrar
 * @param {string} type - Clave de la paleta de colores
 */
export default function Badge({ label, type = 'normal', className }) {
    return (
        <span
            className={cn(
                'inline-block px-2 py-0.5 rounded-full text-xs font-bold capitalize tracking-wide',
                TYPE_COLORS[type] ?? TYPE_COLORS.normal,
                className
            )}
        >
            {label}
        </span>
    );
}
