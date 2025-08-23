
'use client';

import { useState, useCallback, useEffect } from 'react';
import { MOCK_SCHEMES } from './schemes';

const DISTRICT_CODE_MAP: { [key: string]: string } = {
  "Ariyalur": "16", "Chengalpattu": "33", "Chennai": "00", "Coimbatore": "09", "Cuddalore": "17",
  "Dharmapuri": "06", "Dindigul": "25", "Erode": "11", "Kallakurichi": "32", "Kancheepuram": "02",
  "Kanniyakumari": "30", "Karur": "14", "Krishnagiri": "07", "Madurai": "23", "Mayiladuthurai": "36",
  "Nagapattinam": "18", "Namakkal": "08", "Nilgiris": "10", "Perambalur": "15", "Pudukkottai": "21",
  "Ramanathapuram": "26", "Ranipet": "34", "Salem": "08", "Sivaganga": "22", "Tenkasi": "31",
  "Thanjavur": "20", "Theni": "24", "Thoothukudi": "29", "Tiruchirappalli": "13", "Tirunelveli": "28",
  "Tirupathur": "35", "Tiruppur": "12", "Tiruvallur": "01", "Tiruvannamalai": "04", "Tiruvarur": "19",
  "Vellore": "03", "Viluppuram": "05", "Virudhunagar": "27"
};

interface MgnregsDetails {
    fmParas?: number;
    fmAmount?: number;
    fdParas?: number;
    fdAmount?: number;
    pvParas?: number;
    pvAmount?: number;
    grParas?: number;
    grAmount?: number;
}

export interface HlcItem {
    id: number;
    regNo: string;
    scheme: string;
    district: string;
    drpName: string;
    hlcNo: string;
    hlcDate: string; // YYYY-MM-DD
    proceedingNo: string;
    proceedingDate: string; // YYYY-MM-DD
    placedParas: number;
    closedParas: number;
    pendingParas: number;
    recoveredAmount?: number;
    fir: 'yes' | 'no';
    firNo?: string;
    charges: 'yes' | 'no';
    chargeDetails?: string;
    actionTaken?: string;
    hlcMinutes?: {
        name: string;
        originalName: string;
        dataUrl: string;
    };
    mgnregsDetails?: MgnregsDetails;
}

const HLC_STORAGE_KEY = 'sasta-hlc-entries';

const getInitialHlcItems = (): HlcItem[] => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(HLC_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to access localStorage for HLC entries:", error);
        return [];
    }
};

export const useHlc = () => {
    const [hlcItems, setHlcItems] = useState<HlcItem[]>([]);
    const [loading, setLoading] = useState(true);

    const loadHlcItems = useCallback(() => {
        setLoading(true);
        const data = getInitialHlcItems();
        setHlcItems(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadHlcItems();
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === HLC_STORAGE_KEY) {
                loadHlcItems();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadHlcItems]);

    const syncHlcItems = (updatedItems: HlcItem[]) => {
        setHlcItems(updatedItems);
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(HLC_STORAGE_KEY, JSON.stringify(updatedItems));
                window.dispatchEvent(new StorageEvent('storage', { key: HLC_STORAGE_KEY, newValue: JSON.stringify(updatedItems) }));
            } catch (error) {
                console.error("Failed to save HLC entries to localStorage:", error);
            }
        }
    };
    
    const generateHlcRegNo = useCallback((data: {scheme: string, district: string, hlcNo: string, date: Date}): string => {
        const schemeCode = MOCK_SCHEMES.find(s => s.name === data.scheme)?.name.substring(0, 4).toUpperCase() || 'NA';
        const districtCode = DISTRICT_CODE_MAP[data.district] || 'XX';
        const hlcNo = data.hlcNo.padStart(2, '0');
        const dateStr = format(data.date, 'dd.MM.yyyy');
        return `HLC-${schemeCode}-${districtCode}-${hlcNo}-${dateStr}`;
    }, []);

    const addHlc = useCallback((itemData: Omit<HlcItem, 'id'>) => {
        const newItem: HlcItem = {
            ...itemData,
            id: Date.now(),
        };
        const updatedItems = [...getInitialHlcItems(), newItem];
        syncHlcItems(updatedItems);
    }, []);

    const updateHlc = useCallback((updatedItem: HlcItem) => {
         const updatedItems = getInitialHlcItems().map(item => item.id === updatedItem.id ? updatedItem : item);
         syncHlcItems(updatedItems);
    }, []);

    const deleteHlc = useCallback((itemId: number) => {
        const updatedItems = getInitialHlcItems().filter(item => item.id !== itemId);
        syncHlcItems(updatedItems);
    }, []);

    return { hlcItems, loading, addHlc, updateHlc, deleteHlc, generateHlcRegNo };
};
