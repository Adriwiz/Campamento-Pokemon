import { create } from 'zustand';

/**
 * Store global de la tienda.
 * - catalogItems: objetos disponibles en Firestore (gestionados por el admin).
 * - ownedItems: IDs de los objetos que el usuario ha comprado/asignado.
 */
export const useShopStore = create((set, get) => ({
    catalogItems: [],
    ownedItems: [],   // Array de IDs de objetos comprados

    setCatalog: (items) => set({ catalogItems: items }),

    addCatalogItem: (item) =>
        set((state) => ({ catalogItems: [item, ...state.catalogItems] })),

    updateCatalogItem: (id, data) =>
        set((state) => ({
            catalogItems: state.catalogItems.map((item) =>
                item.id === id ? { ...item, ...data } : item
            ),
        })),

    removeCatalogItem: (id) =>
        set((state) => ({
            catalogItems: state.catalogItems.filter((item) => item.id !== id),
        })),

    setOwnedItems: (items) => set({ ownedItems: items }),

    buyItem: (itemId) => {
        const { ownedItems } = get();
        if (ownedItems.includes(itemId)) return;
        set({ ownedItems: [...ownedItems, itemId] });
    },
}));
