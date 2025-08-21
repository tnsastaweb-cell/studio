
'use client';

import { useState, useCallback, useEffect } from 'react';

export const libraryCategories = [
    "Scheme Guidelines", "Handbooks", "GOs (Government Orders)", "Presentations",
    "Relevant Acts & Laws", "Social Audit Reports & Formats", "Social Audit Training Materials",
    "Banners", "Office Formats"
] as const;

export type LibraryCategory = typeof libraryCategories[number];

export interface LibraryItem {
  id: number;
  scheme: string;
  category: LibraryCategory;
  filename: string;
  size: number; // in bytes
  dataUrl: string; // Store file content as a data URL
  uploadedAt: string;
}

const LIBRARY_STORAGE_KEY = 'sasta-library-items';

// This function should only be called on the client side.
const getInitialLibraryItems = (): LibraryItem[] => {
    if (typeof window === 'undefined') {
        return [];
    }
    try {
        const stored = localStorage.getItem(LIBRARY_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to access localStorage for library items:", error);
        return [];
    }
};

export const useLibrary = () => {
    const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
    const [loading, setLoading] = useState(true);

    const loadItems = useCallback(() => {
        setLoading(true);
        const data = getInitialLibraryItems().sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
        setLibraryItems(data);
        setLoading(false);
    }, []);
    
    useEffect(() => {
        loadItems();

        const handleStorageChange = (event: StorageEvent) => {
          if (event.key === LIBRARY_STORAGE_KEY) {
            loadItems();
          }
        };
        
        window.addEventListener('storage', handleStorageChange);
        return () => {
          window.removeEventListener('storage', handleStorageChange);
        };
    }, [loadItems]);

    const syncItems = useCallback((updatedItems: LibraryItem[]) => {
        const sortedItems = updatedItems.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
        setLibraryItems(sortedItems);
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(sortedItems));
                window.dispatchEvent(new StorageEvent('storage', { key: LIBRARY_STORAGE_KEY, newValue: JSON.stringify(sortedItems) }));
            } catch (error) {
                console.error("Failed to save library items to localStorage:", error);
            }
        }
    }, []);

    const addLibraryItem = useCallback((itemData: Omit<LibraryItem, 'id' | 'uploadedAt'>) => {
        const newItem: LibraryItem = {
            ...itemData,
            id: Date.now(),
            uploadedAt: new Date().toISOString(),
        };
        const updatedItems = [...getInitialLibraryItems(), newItem];
        syncItems(updatedItems);
    }, [syncItems]);
    
    const deleteLibraryItem = useCallback((id: number) => {
        const updatedItems = getInitialLibraryItems().filter(item => item.id !== id);
        syncItems(updatedItems);
    }, [syncItems]);


    return { libraryItems, loading, addLibraryItem, deleteLibraryItem };
};
