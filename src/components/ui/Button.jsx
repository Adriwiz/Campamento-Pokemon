import { cn } from '../../utils/cn';

/**
 * Botón reutilizable con variantes estilo Pokédex.
 */
export default function Button({ children, variant = 'primary', className, disabled, ...props }) {
    const base =
        'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-black text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0f1e] disabled:opacity-40 disabled:cursor-not-allowed border-2 active:scale-95';

    const variants = {
        primary: 'bg-[#CC0000] text-white border-black hover:bg-[#ee0000] focus:ring-red-600 shadow-md',
        secondary: 'bg-[#1a2744] text-blue-200 border-blue-900 hover:bg-[#243660] focus:ring-blue-700',
        danger: 'bg-black text-red-400 border-red-700 hover:bg-red-950 focus:ring-red-700',
        ghost: 'bg-transparent text-white border-white/30 hover:bg-white/10 focus:ring-white',
    };

    return (
        <button className={cn(base, variants[variant], className)} disabled={disabled} {...props}>
            {children}
        </button>
    );
}
