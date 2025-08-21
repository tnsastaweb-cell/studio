
'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { MOCK_PANCHAYATS } from './panchayats';

export const galleryActivityTypes = [
  "Orientation Meeting", "Habitation Meeting", "Record Verification", "Door to Door Visit",
  "Community Engagement", "Report Preparation", "Special Grama Sabha", "Social Justice Program",
  "Noon Meals Program", "Training", "HLC Meeting", "Team Visit",
  "Beneficiary Sabha", "District Assembly", "State Assembly", "Others"
] as const;

export const galleryMediaTypes = ["photo", "video", "news", "blog"] as const;

export type GalleryActivityType = typeof galleryActivityTypes[number];
export type GalleryMediaType = typeof galleryMediaTypes[number];


export interface GalleryItem {
  id: number;
  scheme: string;
  district: string;
  block: string;
  panchayat: string; // This will store the LGD code
  activityType: GalleryActivityType;
  isWorkRelated: 'yes' | 'no';
  workName?: string;
  workCode?: string;
  mediaType: GalleryMediaType;
  originalFilename: string;
  dataUrl: string;
  uploadedAt: string;
}

// Enriched type for display purposes
export interface EnrichedGalleryItem extends GalleryItem {
    districtName: string;
    blockName: string;
    panchayatName: string;
}


const GALLERY_STORAGE_KEY = 'sasta-gallery-items';

const getInitialGalleryItems = (): GalleryItem[] => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(GALLERY_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to access localStorage for gallery:", error);
        return [];
    }
};

const toTitleCase = (str: string) => {
    if (!str) return '';
    return str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
};

export const useGallery = () => {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    
    const panchayatNameMap = useMemo(() => {
        const map = new Map<string, { panchayat: string, block: string, district: string }>();
        MOCK_PANCHAYATS.forEach(p => {
            map.set(p.lgdCode, { panchayat: p.name, block: p.block, district: p.district });
        });
        return map;
    }, []);

    const enrichedItems = useMemo((): EnrichedGalleryItem[] => {
        return items.map(item => {
            const panchayatInfo = panchayatNameMap.get(item.panchayat);
            return {
                ...item,
                panchayatName: panchayatInfo ? toTitleCase(panchayatInfo.panchayat) : 'N/A',
                blockName: panchayatInfo ? toTitleCase(panchayatInfo.block) : 'N/A',
                districtName: panchayatInfo ? toTitleCase(panchayatInfo.district) : 'N/A',
            };
        }).sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    }, [items, panchayatNameMap]);

    const loadItems = useCallback(() => {
        setLoading(true);
        const data = getInitialGalleryItems();
        setItems(data);
        setLoading(false);
    }, []);
    
    useEffect(() => {
        loadItems();
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === GALLERY_STORAGE_KEY) {
                loadItems();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadItems]);
    
    const syncItems = useCallback((updatedItems: GalleryItem[]) => {
        setItems(updatedItems);
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(updatedItems));
                window.dispatchEvent(new StorageEvent('storage', { key: GALLERY_STORAGE_KEY, newValue: JSON.stringify(updatedItems) }));
            } catch (error) {
                console.error("Failed to save gallery items to localStorage:", error);
            }
        }
    }, []);

    const addGalleryItem = useCallback((itemData: Omit<GalleryItem, 'id' | 'uploadedAt'>) => {
        const newItem: GalleryItem = {
            ...itemData,
            id: Date.now(),
            uploadedAt: new Date().toISOString(),
        };
        const updatedItems = [newItem, ...getInitialGalleryItems()];
        syncItems(updatedItems);
    }, [syncItems]);

    return { items: enrichedItems, loading, addGalleryItem };
};

