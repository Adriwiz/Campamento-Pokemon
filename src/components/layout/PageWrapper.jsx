import { cn } from '../../utils/cn';

/**
 * Contenedor de página con padding y ancho máximo consistente.
 */
export default function PageWrapper({ children, className }) {
    return (
        <main
            className={cn(
                'min-h-[calc(100vh-4rem)] max-w-[1920px] mx-auto px-4 xl:px-8 py-8',
                className
            )}
        >
            {children}
        </main>
    );
}
