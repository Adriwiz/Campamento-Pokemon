/**
 * Spinner de carga centrado en pantalla completa.
 * @param {string} message - Texto opcional bajo el spinner
 */
export default function Loader({ message = 'Cargando...' }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">{message}</p>
        </div>
    );
}
