import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useShopStore } from '../store/shopStore';
import { getShopItems, addShopItem, updateShopItem, deleteShopItem } from '../services/firestoreService';
import { getItemList, getItemDetail } from '../services/pokeapiService';
import PageWrapper from '../components/layout/PageWrapper';
import Paginator from '../components/ui/Paginator';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import Modal from '../components/ui/Modal';
import { cn } from '../utils/cn';

const itemSpriteUrl = (name) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${name}.png`;

const idFromUrl = (url) => Number(url.replace(/\/$/, '').split('/').pop());

// Item ID de "roto-catch" en PokéAPI - todo lo que venga después se omite
// (los ítems con IDs > 948 son internos/datos de juego sin uso en la tienda)
const ROTO_CATCH_NAME = 'roto-catch';

const TABS = [
    { id: 'catalog', label: '📦 Catálogo actual' },
    { id: 'browser', label: '🔍 Añadir desde PokéAPI' },
];
const API_ITEMS_PAGE = 24;

// Extrae la descripción en inglés del detalle de un item PokéAPI
const getEnglishDescription = (itemData) => {
    const entry = (itemData.flavor_text_entries || []).find(
        (e) => e.language.name === 'en'
    );
    return entry ? entry.text.replace(/\n|\f/g, ' ').trim() : '';
};

export default function AdminDashboardPage() {
    const { catalogItems, setCatalog, addCatalogItem, updateCatalogItem, removeCatalogItem } = useShopStore();
    const [activeTab, setActiveTab] = useState('catalog');
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);
    const [editItem, setEditItem] = useState(null);

    // ── Browser de PokéAPI ──────────────────────────────────────────────────
    const allApiItemsRef = useRef([]);        // todos los items (hasta roto-catch)
    const [browserLoaded, setBrowserLoaded] = useState(false);
    const [apiSearch, setApiSearch] = useState('');
    const [apiPage, setApiPage] = useState(0);
    const [selectedApiItem, setSelectedApiItem] = useState(null);
    const [fetchingDetail, setFetchingDetail] = useState(false);

    // ── Forms ───────────────────────────────────────────────────────────────
    const editForm = useForm();
    const addForm = useForm();

    // ── Carga catálogo actual ───────────────────────────────────────────────
    useEffect(() => {
        getShopItems().then(setCatalog).finally(() => setLoading(false));
    }, [setCatalog]);

    // ── Carga índice PokéAPI (una vez) y recorta en roto-catch ─────────────
    useEffect(() => {
        if (browserLoaded) return;
        getItemList(2000, 0).then((data) => {
            const all = data.results.map((i) => ({ name: i.name, id: idFromUrl(i.url) }));

            // Encontrar el índice de roto-catch y cortar (inclusive)
            const cutIdx = all.findIndex((i) => i.name === ROTO_CATCH_NAME);
            allApiItemsRef.current = cutIdx !== -1 ? all.slice(0, cutIdx + 1) : all;

            setBrowserLoaded(true);
        });
    }, [browserLoaded]);

    // ── Items filtrados ─────────────────────────────────────────────────────
    const filteredApiItems = useCallback(() => {
        const q = apiSearch.toLowerCase().trim();
        return q
            ? allApiItemsRef.current.filter((i) => i.name.includes(q))
            : allApiItemsRef.current;
    }, [apiSearch]);

    const apiSlice = useCallback(
        () => filteredApiItems().slice(apiPage * API_ITEMS_PAGE, (apiPage + 1) * API_ITEMS_PAGE),
        [filteredApiItems, apiPage]
    );

    const apiTotalPages = Math.ceil(filteredApiItems().length / API_ITEMS_PAGE);

    const handleApiSearch = (e) => { setApiSearch(e.target.value); setApiPage(0); };

    // ── Seleccionar item del browser: fetch detalles para pre-llenar descripción
    const selectApiItem = async (item) => {
        setFetchingDetail(true);
        try {
            const detail = await getItemDetail(item.name);
            const desc = getEnglishDescription(detail);
            setSelectedApiItem(item);
            addForm.reset({
                name: item.name.replace(/-/g, ' '),
                pokéapiName: item.name,
                price: 100,
                description: desc,
            });
        } finally {
            setFetchingDetail(false);
        }
    };

    // ── Guardar nuevo item ──────────────────────────────────────────────────
    const handleAddFromApi = async (data) => {
        const payload = {
            name: data.name,
            description: data.description,
            price: Number(data.price),
            emoji: '',
            pokéapiName: data.pokéapiName?.trim() || '',
        };
        const id = await addShopItem(payload);
        addCatalogItem({ id, ...payload });
        setSelectedApiItem(null);
        setActiveTab('catalog');
    };

    // ── Editar ──────────────────────────────────────────────────────────────
    const openEdit = (item) => {
        setEditItem(item);
        editForm.reset({
            name: item.name,
            description: item.description,
            price: item.price,
            pokéapiName: item.pokéapiName || '',
        });
    };

    const handleEdit = async (data) => {
        if (!editItem) return;
        const updated = {
            name: data.name,
            description: data.description,
            price: Number(data.price),
            pokéapiName: data.pokéapiName?.trim() || '',
        };
        await updateShopItem(editItem.id, updated);
        updateCatalogItem(editItem.id, updated);
        setEditItem(null);
    };

    const handleDelete = async (id) => {
        setDeleteId(id);
        try { await deleteShopItem(id); removeCatalogItem(id); }
        finally { setDeleteId(null); }
    };

    // ── Campo de formulario genérico ────────────────────────────────────────
    const Field = ({ form, name, label, placeholder, type = 'text', required, as }) => (
        <div>
            <label className="block text-xs font-black text-blue-300 mb-1 uppercase tracking-wider">
                {label}{required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {as === 'textarea' ? (
                <textarea rows={3} placeholder={placeholder}
                    className={cn(
                        'w-full rounded-xl px-4 py-2.5 text-white text-sm placeholder-blue-700 focus:outline-none focus:ring-2 border-2 resize-none transition-all',
                        form.formState.errors[name] ? 'border-red-600 focus:ring-red-600' : 'border-blue-900 focus:ring-blue-500 focus:border-blue-500'
                    )}
                    style={{ backgroundColor: 'var(--screen-bg)' }}
                    {...form.register(name, { required: required && `${label} es obligatorio` })}
                />
            ) : (
                <input type={type} placeholder={placeholder}
                    className={cn(
                        'w-full rounded-xl px-4 py-2.5 text-white text-sm placeholder-blue-700 focus:outline-none focus:ring-2 border-2 transition-all',
                        form.formState.errors[name] ? 'border-red-600 focus:ring-red-600' : 'border-blue-900 focus:ring-blue-500 focus:border-blue-500'
                    )}
                    style={{ backgroundColor: 'var(--screen-bg)' }}
                    {...form.register(name, { required: required && `${label} es obligatorio` })}
                />
            )}
            {form.formState.errors[name] && (
                <p className="text-red-400 text-xs mt-1">⚠ {form.formState.errors[name].message}</p>
            )}
        </div>
    );

    // ────────────────────────────────────────────────────────────────────────
    return (
        <PageWrapper>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-black text-white mb-1">
                        🛠️ Panel <span style={{ color: '#CC0000' }}>Admin</span>
                    </h1>
                    <p className="text-blue-300 text-sm">Gestiona el catálogo de la tienda</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Card className="p-4 flex items-center gap-4">
                    <span className="text-4xl">📦</span>
                    <div>
                        <p className="text-3xl font-black text-white">{catalogItems.length}</p>
                        <p className="text-blue-400 text-xs">Objetos en catálogo</p>
                    </div>
                </Card>

                {catalogItems.length > 0 && (() => {
                    const top = [...catalogItems].sort((a, b) => (b.price || 0) - (a.price || 0))[0];
                    return (
                        <Card className="p-4 flex items-center gap-4">
                            {top.pokéapiName
                                ? <img src={itemSpriteUrl(top.pokéapiName)} className="w-10 h-10 object-contain shrink-0" style={{ imageRendering: 'pixelated' }} alt="" />
                                : <span className="text-3xl shrink-0">💎</span>}
                            <div className="min-w-0">
                                <p className="text-yellow-400 font-black text-lg">💰 {top.price?.toLocaleString()}</p>
                                <p className="text-white text-xs font-bold capitalize truncate">{top.name}</p>
                                <p className="text-blue-500 text-[10px]">Objeto más caro</p>
                            </div>
                        </Card>
                    );
                })()}

                {catalogItems.length > 0 && (() => {
                    const low = [...catalogItems].sort((a, b) => (a.price || 0) - (b.price || 0))[0];
                    return (
                        <Card className="p-4 flex items-center gap-4">
                            {low.pokéapiName
                                ? <img src={itemSpriteUrl(low.pokéapiName)} className="w-10 h-10 object-contain shrink-0" style={{ imageRendering: 'pixelated' }} alt="" />
                                : <span className="text-3xl shrink-0">🏷️</span>}
                            <div className="min-w-0">
                                <p className="text-green-400 font-black text-lg">💰 {low.price?.toLocaleString()}</p>
                                <p className="text-white text-xs font-bold capitalize truncate">{low.name}</p>
                                <p className="text-blue-500 text-[10px]">Mejor precio</p>
                            </div>
                        </Card>
                    );
                })()}
            </div>

            {/* Tabs */}
            <div className="flex border-b-2 border-blue-900 mb-6">
                {TABS.map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            'px-5 py-3 font-black text-sm border-b-4 -mb-0.5 transition-all',
                            activeTab === tab.id ? 'border-[#CC0000] text-white' : 'border-transparent text-blue-400 hover:text-white'
                        )}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ─── TAB: CATÁLOGO ─────────────────────────────────────────────── */}
            {activeTab === 'catalog' && (
                loading ? <Loader message="Cargando catálogo..." /> :
                    catalogItems.length === 0 ? (
                        <div className="text-center py-16 text-blue-400">
                            <p className="text-5xl mb-3">📭</p>
                            <p className="text-white font-bold mb-3">No hay objetos aún.</p>
                            <Button onClick={() => setActiveTab('browser')}>+ Añadir desde PokéAPI</Button>
                        </div>
                    ) : (
                        <Card className="overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b-2 border-black" style={{ backgroundColor: 'var(--screen-bg)' }}>
                                            {['', 'Objeto', 'Descripción', 'Precio', 'PokéAPI ID', 'Acciones'].map((h) => (
                                                <th key={h} className="text-left px-4 py-3 text-blue-400 font-black text-xs uppercase tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-blue-900/40">
                                        {catalogItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-blue-900/10 transition-colors">
                                                <td className="px-4 py-3 w-12">
                                                    {item.pokéapiName
                                                        ? <img src={itemSpriteUrl(item.pokéapiName)} alt={item.name} className="w-10 h-10 object-contain" style={{ imageRendering: 'pixelated' }} />
                                                        : <span className="text-2xl">{item.emoji || '📦'}</span>}
                                                </td>
                                                <td className="px-4 py-3 font-black text-white capitalize">{item.name}</td>
                                                <td className="px-4 py-3 text-blue-300 max-w-[180px]"><p className="line-clamp-1 text-xs">{item.description}</p></td>
                                                <td className="px-4 py-3 font-black text-yellow-400">💰 {item.price?.toLocaleString()}</td>
                                                <td className="px-4 py-3"><code className="text-xs text-blue-400 bg-[#0a0f1e] px-2 py-1 rounded">{item.pokéapiName || '—'}</code></td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        <Button variant="secondary" className="text-xs py-1 px-2" onClick={() => openEdit(item)}>✏️</Button>
                                                        <Button variant="danger" className="text-xs py-1 px-2" onClick={() => handleDelete(item.id)} disabled={deleteId === item.id}>
                                                            {deleteId === item.id ? '⏳' : '🗑️'}
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )
            )}

            {/* ─── TAB: BROWSER DE POKÉAPI ────────────────────────────────────── */}
            {activeTab === 'browser' && (
                <div>
                    <p className="text-blue-500 text-xs mb-4">
                        ℹ️ Los que ya están en tu catálogo muestran ✓.
                    </p>

                    <div className="relative mb-5">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-sm">🔍</span>
                        <input type="text" placeholder="Buscar objeto (ej: potion, ball, berry)..."
                            value={apiSearch} onChange={handleApiSearch}
                            className="pl-9 pr-4 py-2.5 rounded-xl border-2 border-blue-900 text-white placeholder-blue-700 focus:outline-none focus:border-blue-400 text-sm w-full sm:w-80"
                            style={{ backgroundColor: 'var(--screen-bg)' }} />
                        {apiSearch && (
                            <button onClick={() => { setApiSearch(''); setApiPage(0); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-white text-xs">✕</button>
                        )}
                    </div>

                    {!browserLoaded ? (
                        <Loader message="Cargando catálogo de PokéAPI..." />
                    ) : (
                        <>
                            {/* Overlay de carga al hacer clic */}
                            {fetchingDetail && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                    <div className="text-white text-center">
                                        <p className="text-4xl mb-2 animate-spin">⚙️</p>
                                        <p className="font-black">Cargando datos del objeto...</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-12 gap-3 mb-4">
                                {apiSlice().map((item) => {
                                    const alreadyAdded = catalogItems.some((c) => c.pokéapiName === item.name);
                                    return (
                                        <button key={item.id} onClick={() => !alreadyAdded && selectApiItem(item)}
                                            disabled={alreadyAdded || fetchingDetail}
                                            className={cn(
                                                'relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all duration-150 group',
                                                alreadyAdded
                                                    ? 'border-green-700 opacity-50 cursor-default'
                                                    : 'border-blue-900 hover:border-[#CC0000] cursor-pointer active:scale-95'
                                            )}
                                            style={{ backgroundColor: 'var(--screen-bg)' }} title={item.name}>
                                            {alreadyAdded && <span className="absolute top-1 right-1 text-green-400 text-xs font-black">✓</span>}
                                            <img src={itemSpriteUrl(item.name)} alt={item.name}
                                                className="w-10 h-10 object-contain group-hover:scale-110 transition-transform"
                                                style={{ imageRendering: 'pixelated' }}
                                                onError={(e) => { e.target.style.opacity = '0.15'; }} />
                                            <p className="text-[10px] text-blue-300 group-hover:text-white capitalize leading-tight line-clamp-2 w-full">
                                                {item.name.replace(/-/g, ' ')}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Paginador del browser con salto */}
                            <Paginator page={apiPage} totalPages={apiTotalPages} onPageChange={setApiPage} />
                        </>
                    )}
                </div>
            )}

            {/* ─── MODAL: Añadir desde PokéAPI ───────────────────────────────── */}
            <Modal isOpen={!!selectedApiItem} onClose={() => setSelectedApiItem(null)}
                title={`Añadir: ${selectedApiItem?.name.replace(/-/g, ' ')}`}>
                {selectedApiItem && (
                    <div className="flex gap-5">
                        <div className="flex flex-col items-center gap-2 shrink-0">
                            <div className="w-20 h-20 rounded-xl flex items-center justify-center border-2 border-black"
                                style={{ backgroundColor: 'var(--screen-bg)' }}>
                                <img src={itemSpriteUrl(selectedApiItem.name)} alt={selectedApiItem.name}
                                    className="w-14 h-14 object-contain" style={{ imageRendering: 'pixelated' }} />
                            </div>
                            <code className="text-[10px] text-blue-400 text-center">{selectedApiItem.name}</code>
                        </div>

                        <form onSubmit={addForm.handleSubmit(handleAddFromApi)} className="flex-1 space-y-3">
                            <Field form={addForm} name="name" label="Nombre visible" placeholder="Super Poción" required />
                            <Field form={addForm} name="description" label="Descripción (editable)" placeholder="Restaura 50 PS." as="textarea" required />
                            <Field form={addForm} name="price" label="Precio 💰" placeholder="200" type="number" required />
                            <input type="hidden" {...addForm.register('pokéapiName')} />
                            <div className="flex gap-2 justify-end pt-1">
                                <Button variant="ghost" type="button" onClick={() => setSelectedApiItem(null)}>Cancelar</Button>
                                <Button type="submit">✅ Añadir a la tienda</Button>
                            </div>
                        </form>
                    </div>
                )}
            </Modal>

            {/* ─── MODAL: Editar ──────────────────────────────────────────────── */}
            <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title={`✏️ Editar: ${editItem?.name}`}>
                <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
                    <Field form={editForm} name="name" label="Nombre" placeholder="Super Poción" required />
                    <Field form={editForm} name="description" label="Descripción" placeholder="Restaura 50 PS." as="textarea" required />
                    <div className="grid grid-cols-2 gap-3">
                        <Field form={editForm} name="price" label="Precio 💰" placeholder="200" type="number" required />
                        <Field form={editForm} name="pokéapiName" label="PokéAPI ID" placeholder="super-potion" />
                    </div>
                    <div className="flex gap-3 justify-end pt-1">
                        <Button variant="ghost" type="button" onClick={() => setEditItem(null)}>Cancelar</Button>
                        <Button type="submit">💾 Guardar</Button>
                    </div>
                </form>
            </Modal>
        </PageWrapper>
    );
}