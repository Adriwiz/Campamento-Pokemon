import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useShopStore } from '../store/shopStore';
import { getShopItems, buyItem as firestoreBuyItem, getOwnedItems } from '../services/firestoreService';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';

// Sprite oficial del objeto sacado de PokéAPI (sin necesitar llamada extra)
// El campo pokéapiName del admin mapea directo al sprite
const itemSpriteUrl = (pokéapiName) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${pokéapiName}.png`;

export default function ShopPage() {
    const { user } = useAuthStore();
    const { catalogItems, setCatalog, ownedItems, setOwnedItems, buyItem: markBought } = useShopStore();
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState(null);
    const [successItem, setSuccessItem] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!user) return;
        Promise.all([getShopItems(), getOwnedItems(user.uid)])
            .then(([items, owned]) => { setCatalog(items); setOwnedItems(owned); })
            .finally(() => setLoading(false));
    }, [user, setCatalog, setOwnedItems]);

    const handleBuy = async (item) => {
        setBuying(item.id);
        try {
            await firestoreBuyItem(user.uid, item.id);
            markBought(item.id);
            setSuccessItem(item.name);
            setTimeout(() => setSuccessItem(null), 2500);
        } finally {
            setBuying(null);
        }
    };

    const isOwned = (id) => ownedItems.includes(id);

    const filteredItems = search.trim()
        ? catalogItems.filter((i) => i.name.toLowerCase().includes(search.toLowerCase().trim()))
        : catalogItems;

    return (
        <PageWrapper>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white mb-1">
                        🛒 <span style={{ color: '#CC0000' }}>Tienda</span> de Objetos
                    </h1>
                    <p className="text-blue-300 text-sm">
                        {filteredItems.length} de {catalogItems.length} objetos
                    </p>
                </div>
                {/* Buscador */}
                {!loading && catalogItems.length > 0 && (
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-sm">🔍</span>
                        <input
                            type="text"
                            placeholder="Buscar objeto..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-8 py-2.5 rounded-xl border-2 border-blue-900 text-white placeholder-blue-600 focus:outline-none focus:border-blue-400 text-sm w-full sm:w-56"
                            style={{ backgroundColor: '#0f1d3a' }}
                        />
                        {search && (
                            <button onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-white text-xs">
                                ✕
                            </button>
                        )}
                    </div>
                )}
            </div>

            {successItem && (
                <div className="mb-6 border-2 border-black rounded-xl px-5 py-3 font-bold text-sm"
                    style={{ background: '#0f3d2a', color: '#4ade80' }}>
                    ✅ ¡<strong>{successItem}</strong> añadido a tu mochila!
                </div>
            )}

            {loading ? (
                <Loader message="Cargando tienda..." />
            ) : catalogItems.length === 0 ? (
                <div className="text-center py-20 text-blue-400">
                    <p className="text-5xl mb-4">🏪</p>
                    <p className="text-lg font-black text-white mb-2">La tienda está vacía</p>
                    <p className="text-sm">El administrador añadirá objetos pronto.</p>
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="text-center py-20 text-blue-400">
                    <p className="text-5xl mb-3">🔍</p>
                    <p className="font-bold text-white mb-1">No hay objetos con ese nombre</p>
                    <button onClick={() => setSearch('')} className="text-sm text-blue-400 hover:text-white underline">Limpiar búsqueda</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-5">
                    {filteredItems.map((item) => {
                        const owned = isOwned(item.id);
                        return (
                            <Card
                                key={item.id}
                                className={`p-5 flex flex-col gap-3 ${owned ? 'opacity-75' : ''}`}
                            >
                                {/* Sprite del objeto */}
                                <div className="flex items-center justify-center rounded-xl h-24 border-2 border-black/50"
                                    style={{ backgroundColor: '#0a0f1e' }}>
                                    {item.pokéapiName ? (
                                        <img
                                            src={itemSpriteUrl(item.pokéapiName)}
                                            alt={item.name}
                                            className="h-16 w-16 object-contain"
                                            style={{ imageRendering: 'pixelated' }} // mantiene el pixel art nítido
                                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                                        />
                                    ) : null}
                                    {/* Fallback emoji si no hay sprite o falla la carga */}
                                    <span
                                        className="text-5xl"
                                        style={{ display: item.pokéapiName ? 'none' : 'block' }}
                                    >
                                        {item.emoji || '📦'}
                                    </span>
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-black text-white capitalize text-sm">{item.name}</h3>
                                    <p className="text-blue-300 text-xs mt-1 line-clamp-2">{item.description}</p>
                                </div>

                                <div className="flex items-center justify-between border-t border-blue-900/40 pt-3">
                                    <span className="font-black text-lg" style={{ color: '#fbbf24' }}>
                                        💰 {item.price?.toLocaleString() ?? '?'}
                                    </span>
                                    {owned ? (
                                        <span className="text-green-400 text-xs font-black border border-green-700 rounded-lg px-2 py-1">
                                            ✓ En mochila
                                        </span>
                                    ) : (
                                        <Button onClick={() => handleBuy(item)} disabled={buying === item.id} className="text-xs px-3 py-1.5">
                                            {buying === item.id ? '⏳' : 'Comprar'}
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </PageWrapper>
    );
}
