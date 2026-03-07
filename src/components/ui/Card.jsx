import { cn } from '../../utils/cn';

/**
 * Tarjeta estilo pantalla Pokédex:
 * fondo azul oscuro, borde con brillo azulado.
 */
export default function Card({ children, className, ...props }) {
    return (
        <div
            className={cn(
                'rounded-2xl border border-blue-900/60 shadow-lg screen-glow screen-glow-hover transition-all duration-200',
                className
            )}
            style={{ backgroundColor: 'var(--screen-blue)' }}
            {...props}
        >
            {children}
        </div>
    );
}
