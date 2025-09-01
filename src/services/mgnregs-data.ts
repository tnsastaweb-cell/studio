
'use client';

import { useState, useCallback, useEffect } from 'react';
import type { MgnregsFormValues } from '@/app/data-entry/mgnregs/page';

export interface MgnregsEntry extends MgnregsFormValues {
  id: number;
  submittedAt: string;
}

const MGNREGS_STORAGE_KEY = 'sasta-mgnregs-entries';

const getInitialMgnregsEntries = (): MgnregsEntry[] => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(MGNREGS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to access localStorage for MGNREGS entries:", error);
        return [];
    }
};

export const useMgnregs = () => {
    const [entries, setEntries] = useState<MgnregsEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const loadEntries = useCallback(() => {
        setLoading(true);
        const data = getInitialMgnregsEntries();
        setEntries(data.sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
        setLoading(false);
    }, []);

    useEffect(() => {
        loadEntries();
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === MGNREGS_STORAGE_KEY) {
                loadEntries();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadEntries]);

    const syncEntries = (updatedEntries: MgnregsEntry[]) => {
        const sorted = updatedEntries.sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setEntries(sorted);
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(MGNREGS_STORAGE_KEY, JSON.stringify(sorted));
                window.dispatchEvent(new StorageEvent('storage', { key: MGNREGS_STORAGE_KEY, newValue: JSON.stringify(sorted) }));
            } catch (error) {
                console.error("Failed to save MGNREGS entries to localStorage:", error);
            }
        }
    };
    
    const addMgnregsEntry = useCallback((entryData: MgnregsFormValues) => {
        const newEntry: MgnregsEntry = {
            ...entryData,
            id: Date.now(),
            submittedAt: new Date().toISOString()
        };
        const updatedEntries = [...getInitialMgnregsEntries(), newEntry];
        syncEntries(updatedEntries);
        return newEntry;
    }, []);

    const updateMgnregsEntry = useCallback((updatedEntry: MgnregsEntry) => {
         const updatedEntries = getInitialMgnregsEntries().map(entry => entry.id === updatedEntry.id ? updatedEntry : entry);
         syncEntries(updatedEntries);
    }, []);

    const deleteMgnregsEntry = useCallback((entryId: number) => {
        const updatedEntries = getInitialMgnregsEntries().filter(entry => entry.id !== entryId);
        syncEntries(updatedEntries);
    }, []);
    
    return { entries, loading, addMgnregsEntry, updateMgnregsEntry, deleteMgnregsEntry };
};
