import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina clases de Tailwind de forma segura.
 * Usa clsx para condicionales y tailwind-merge para resolver conflictos.
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
