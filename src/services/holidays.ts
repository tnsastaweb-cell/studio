
'use client';

import { useState, useCallback, useEffect } from 'react';

export interface Holiday {
    id: number;
    date: string; // YYYY-MM-DD
    name: string;
}

const HOLIDAY_STORAGE_KEY = 'sasta-holidays';

const MOCK_HOLIDAYS: Holiday[] = [
    { id: 1, date: '2025-01-14', name: 'Pongal' },
    { id: 2, date: '2025-01-15', name: 'Thiruvalluvar Day' },
    { id: 3, date: '2025-01-16', name: 'Uzhavar Thirunal' },
    { id: 4, date: '2025-01-26', name: 'Republic Day' },
    { id: 5, date: '2025-08-15', name: 'Independence Day' },
    { id: 6, date: '2025-10-02', name: 'Gandhi Jayanti' },
];


const getInitialHolidays = (): Holiday[] => {
    if (typeof window === 'undefined') return MOCK_HOLIDAYS;
    try {
        const stored = localStorage.getItem(HOLIDAY_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        } else {
            localStorage.setItem(HOLIDAY_STORAGE_KEY, JSON.stringify(MOCK_HOLIDAYS));
            return MOCK_HOLIDAYS;
        }
    } catch (error) {
        console.error("Failed to access localStorage for holidays:", error);
        return MOCK_HOLIDAYS;
    }
};

export const useHolidays = () => {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [loading, setLoading] = useState(true);

    const loadHolidays = useCallback(() => {
        setLoading(true);
        const data = getInitialHolidays();
        setHolidays(data.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        setLoading(false);
    }, []);

    useEffect(() => {
        loadHolidays();
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === HOLIDAY_STORAGE_KEY) {
                loadHolidays();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadHolidays]);
    
    const syncHolidays = (updatedHolidays: Holiday[]) => {
         const sorted = updatedHolidays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setHolidays(sorted);
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(HOLIDAY_STORAGE_KEY, JSON.stringify(sorted));
                window.dispatchEvent(new StorageEvent('storage', { key: HOLIDAY_STORAGE_KEY, newValue: JSON.stringify(sorted) }));
            } catch (error) {
                console.error("Failed to save holidays to localStorage:", error);
            }
        }
    }

    const addHoliday = useCallback((holidayData: Omit<Holiday, 'id'>) => {
        const newHoliday: Holiday = {
            ...holidayData,
            id: Date.now(),
        };
        const updatedHolidays = [...getInitialHolidays(), newHoliday];
        syncHolidays(updatedHolidays);
    }, []);

    const deleteHoliday = useCallback((holidayId: number) => {
        const updatedHolidays = getInitialHolidays().filter(h => h.id !== holidayId);
        syncHolidays(updatedHolidays);
    }, []);

    return { holidays, loading, addHoliday, deleteHoliday };
};
