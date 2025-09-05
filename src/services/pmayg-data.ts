

'use client';

import { useState, useCallback, useEffect } from 'react';
import type { PmaygFormValues } from '@/app/data-entry/pamy-g/page';
import type { PmaygIssue } from './pmayg-issues';

export interface PmaygEntry extends PmaygFormValues {
  id: number;
  submittedAt: string;
}

const MOCK_PMAYG_ENTRIES: PmaygEntry[] = [];

const PMAYG_STORAGE_KEY = 'sasta-pmayg-entries';

const getInitialPmaygEntries = (): PmaygEntry[] => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(PMAYG_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return parsed.map((item: any) => ({
                ...item,
                auditStartDate: item.auditStartDate ? new Date(item.auditStartDate) : undefined,
                auditEndDate: item.auditEndDate ? new Date(item.auditEndDate) : undefined,
                sgsDate: item.sgsDate ? new Date(item.sgsDate) : undefined,
            }));
        }
        localStorage.setItem(PMAYG_STORAGE_KEY, JSON.stringify(MOCK_PMAYG_ENTRIES));
        return MOCK_PMAYG_ENTRIES;

    } catch (error) {
        console.error("Failed to access localStorage for PMAY-G entries:", error);
        return [];
    }
};

export const usePmayg = () => {
    const [entries, setEntries] = useState<PmaygEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const loadEntries = useCallback(() => {
        setLoading(true);
        const data = getInitialPmaygEntries();
        setEntries(data.sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
        setLoading(false);
    }, []);

    useEffect(() => {
        loadEntries();
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === PMAYG_STORAGE_KEY) {
                loadEntries();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadEntries]);

    const syncEntries = (updatedEntries: PmaygEntry[]) => {
        const sorted = updatedEntries.sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setEntries(sorted);
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(PMAYG_STORAGE_KEY, JSON.stringify(sorted));
                window.dispatchEvent(new StorageEvent('storage', { key: PMAYG_STORAGE_KEY, newValue: JSON.stringify(sorted) }));
            } catch (error) {
                console.error("Failed to save PMAY-G entries to localStorage:", error);
            }
        }
    };
    
    const addPmaygEntry = useCallback((entryData: PmaygFormValues) => {
        const newEntry: PmaygEntry = {
            ...entryData,
            id: Date.now(),
            submittedAt: new Date().toISOString()
        };
        const updatedEntries = [...getInitialPmaygEntries(), newEntry];
        syncEntries(updatedEntries);
        return newEntry;
    }, []);
    
    return { entries, loading, addPmaygEntry };
};
