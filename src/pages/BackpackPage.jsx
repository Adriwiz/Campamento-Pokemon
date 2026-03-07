import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useShopStore } from '../store/shopStore';
import { getShopItems, getOwnedItems } from '../services/firestoreService';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';

const itemSpriteUrl = (pokéapiName) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${pokéapiName}.png`;

export default function BackpackPage() {
    const { user } = useAuthStore();
    const { catalogItems, setCatalog, ownedItems, setOwnedItems } = useShopStore();
    const [loading, setLoading] = useState(true);

    // Siempre carga desde Firestore al montar (persiste tras recarga)
    useEffect(() => {
        if (!user) return;
        Promise.all([getShopItems(), getOwnedItems(user.uid)])
            .then(([items, owned]) => {
                setCatalog(items);
                setOwnedItems(owned);
            })
            .finally(() => setLoading(false));
    }, [user, setCatalog, setOwnedItems]);

    // Objetos que el usuario posee con sus datos del catálogo
    const myItems = catalogItems.filter((item) => ownedItems.includes(item.id));

    return (
        <PageWrapper>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white mb-1">
                    🎒 Mi <span style={{ color: '#CC0000' }}>Mochila</span>
                </h1>
                <p className="text-blue-300 text-sm">
                    {loading ? 'Cargando...' : `${myItems.length} objeto${myItems.length !== 1 ? 's' : ''} recopilado${myItems.length !== 1 ? 's' : ''}`}
                </p>
            </div>

            {loading ? (
                <Loader message="Cargando mochila..." />
            ) : myItems.length === 0 ? (
                <div className="text-center py-24 text-blue-400">
                    <p className="text-6xl mb-4">🎒</p>
                    <p className="text-xl font-black text-white mb-2">Tu mochila está vacía</p>
                    <p className="text-sm">Ve a la Tienda y compra objetos para tu aventura.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-8 gap-4">
                    {myItems.map((item) => (
                        <Card key={item.id} className="p-4 flex flex-col items-center gap-3 text-center">
                            {/* Sprite */}
                            <div
                                className="w-20 h-20 rounded-xl flex items-center justify-center border-2 border-black/40"
                                style={{ backgroundColor: 'var(--screen-bg)' }}
                            >
                                {item.pokéapiName ? (
                                    <img
                                        src={itemSpriteUrl(item.pokéapiName)}
                                        alt={item.name}
                                        className="w-14 h-14 object-contain"
                                        style={{ imageRendering: 'pixelated' }}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <span
                                    className="text-4xl items-center justify-center"
                                    style={{ display: item.pokéapiName ? 'none' : 'flex' }}
                                >
                                    {item.emoji || '📦'}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 w-full">
                                <p className="font-black text-white text-sm capitalize leading-tight">{item.name}</p>
                                <p className="text-blue-300 text-xs mt-1 line-clamp-2">{item.description}</p>
                            </div>

                            {/* Precio pagado */}
                            <div className="w-full border-t border-blue-900/40 pt-2 flex items-center justify-between">
                                <span className="text-[11px] text-blue-500">Comprado</span>
                                <span className="text-yellow-400 font-black text-sm">💰 {item.price?.toLocaleString()}</span>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </PageWrapper>
    );
}
