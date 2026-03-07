import { useState } from 'react';
import Button from './Button';
import { cn } from '../../utils/cn';

/**
 * Paginador reutilizable con ventana deslizante + input de salto de página.
 *
 * Props:
 *  - page:        número de página actual (0-indexed)
 *  - totalPages:  total de páginas
 *  - onPageChange: función (newPage: number) => void
 */
export default function Paginator({ page, totalPages, onPageChange }) {
    const [jumpValue, setJumpValue] = useState('');

    if (totalPages <= 1) return null;

    const handleJump = (e) => {
        e.preventDefault();
        const n = parseInt(jumpValue, 10);
        if (!isNaN(n) && n >= 1 && n <= totalPages) {
            onPageChange(n - 1);
        }
        setJumpValue('');
    };

    // Ventana deslizante de hasta 5 páginas centrada en `page`
    const windowSize = Math.min(totalPages, 5);
    const startPage = Math.max(0, Math.min(page - Math.floor(windowSize / 2), totalPages - windowSize));

    return (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {/* Anterior */}
            <Button variant="secondary" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
                ← Anterior
            </Button>

            {/* Números de página */}
            {Array.from({ length: windowSize }, (_, i) => {
                const p = startPage + i;
                return (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={cn(
                            'w-9 h-9 rounded-lg font-black text-sm border-2 transition-all',
                            p === page
                                ? 'bg-[#CC0000] border-black text-white'
                                : 'bg-[#1a2744] border-blue-900 text-blue-300 hover:border-blue-400'
                        )}
                    >
                        {p + 1}
                    </button>
                );
            })}

            {/* Siguiente */}
            <Button variant="secondary" disabled={page + 1 >= totalPages} onClick={() => onPageChange(page + 1)}>
                Siguiente →
            </Button>

            {/* Input salto de página */}
            {totalPages > 5 && (
                <form onSubmit={handleJump} className="flex items-center gap-1.5 ml-2">
                    <span className="text-blue-500 text-xs hidden sm:block">Ir a:</span>
                    <input
                        type="number"
                        min={1}
                        max={totalPages}
                        value={jumpValue}
                        onChange={(e) => setJumpValue(e.target.value)}
                        placeholder="pág."
                        className="w-16 px-2 py-1.5 rounded-lg border-2 border-blue-900 bg-[#0a0f1e] text-white text-xs text-center focus:outline-none focus:border-blue-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                        type="submit"
                        className="px-2 py-1.5 rounded-lg text-xs font-black border-2 border-blue-900 bg-[#1a2744] text-blue-300 hover:border-blue-400 hover:text-white transition-all"
                    >
                        ↵
                    </button>
                </form>
            )}

            {/* Info */}
            <p className="w-full text-center text-blue-600 text-xs mt-1">
                Página {page + 1} de {totalPages}
            </p>
        </div>
    );
}
