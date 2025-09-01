
'use client';

import { useState, useCallback, useEffect } from 'react';

export interface TourDiaryEntry {
    id: number;
    employeeCode: string;
    name: string;
    role: string;
    district: string;
    date: string; // YYYY-MM-DD
    departurePlace: string;
    campPlace: string;
    vehicleDetails: string;
    distance: number;
    workSummary: string;
}

export interface MonthlySummary {
    hqWorkDays: number;
    fieldVisitDays: number;
    hlcMeetingHeld: number;
    hlcMeetingAttended: number;
    totalCampDays: number;
    leaveDays: number;
    holidays: number;
    totalDays: number;
}

export interface TourDiaryRecord extends TourDiaryEntry, MonthlySummary {
    month: number; // 0-11
    year: number;
}


const TOUR_DIARY_STORAGE_KEY = 'sasta-tour-diary';

const getInitialEntries = (): TourDiaryRecord[] => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(TOUR_DIARY_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to access localStorage for tour diary entries:", error);
        return [];
    }
};

export const useTourDiary = () => {
    const [entries, setEntries] = useState<TourDiaryRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const loadEntries = useCallback(() => {
        setLoading(true);
        const data = getInitialEntries();
        setEntries(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadEntries();
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === TOUR_DIARY_STORAGE_KEY) {
                loadEntries();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadEntries]);

    const syncEntries = (updatedEntries: TourDiaryRecord[]) => {
        setEntries(updatedEntries);
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(TOUR_DIARY_STORAGE_KEY, JSON.stringify(updatedEntries));
                 window.dispatchEvent(new StorageEvent('storage', { key: TOUR_DIARY_STORAGE_KEY, newValue: JSON.stringify(updatedEntries) }));
            } catch (error) {
                console.error("Failed to save tour diary entries to localStorage:", error);
            }
        }
    };
    
    const addEntry = useCallback((entryData: Omit<TourDiaryRecord, 'id'>) => {
        const newEntry: TourDiaryRecord = {
            ...entryData,
            id: Date.now(),
        };
        const updatedEntries = [...getInitialEntries(), newEntry];
        syncEntries(updatedEntries);
        return newEntry;
    }, []);
    
    const updateEntry = useCallback((updatedEntry: TourDiaryRecord) => {
         const updatedEntries = getInitialEntries().map(entry => entry.id === updatedEntry.id ? updatedEntry : entry);
         syncEntries(updatedEntries);
    }, []);

    const deleteEntry = useCallback((entryId: number) => {
        const updatedEntries = getInitialEntries().filter(entry => entry.id !== entryId);
        syncEntries(updatedEntries);
    }, []);
    
    return { entries, loading, addEntry, updateEntry, deleteEntry };
};
