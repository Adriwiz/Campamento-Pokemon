import { useEffect } from 'react';
import { cn } from '../../utils/cn';

export default function Modal({ isOpen, onClose, title, children, className }) {
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className={cn(
                    'relative w-full max-w-lg border-4 border-black rounded-2xl shadow-2xl screen-glow overflow-hidden',
                    className
                )}
                style={{ backgroundColor: 'var(--screen-blue)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header rojo estilo Pokédex */}
                <div className="flex items-center justify-between px-5 py-3 border-b-4 border-black"
                    style={{ background: 'linear-gradient(135deg, #CC0000, #990000)' }}>
                    <h2 className="text-base font-black text-white capitalize tracking-wide">{title}</h2>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/70 transition-colors font-bold text-sm"
                        aria-label="Cerrar"
                    >
                        ✕
                    </button>
                </div>
                <div className="px-6 py-5">{children}</div>
            </div>
        </div>
    );
}
