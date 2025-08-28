
'use client';

import { useState, useCallback, useEffect } from 'react';

export interface PmaygIssue {
  id: number;
  issueNumber: string;
  type: string;
  category: string;
  subCategory: string;
  codeNumber: string;
  beneficiaries: number;
  centralAmount: number;
  stateAmount: number;
  otherAmount: number;
  grievances: number;
  hlcRegNo?: string;
  paraStatus: 'PENDING' | 'CLOSED';
  recoveryAmount: number;
}

const PMAYG_ISSUE_STORAGE_KEY = 'sasta-pmayg-issues';
const ISSUE_COUNTER_STORAGE_KEY = 'sasta-pmayg-issue-counter';

const getInitialIssues = (): PmaygIssue[] => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(PMAYG_ISSUE_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to access localStorage for PMAY-G issues:", error);
        return [];
    }
};

const getIssueCounters = (): { [key: string]: number } => {
    if (typeof window === 'undefined') return {};
    try {
        const stored = localStorage.getItem(ISSUE_COUNTER_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.error("Failed to access localStorage for issue counters:", error);
        return {};
    }
};

export const usePmaygIssues = () => {
    const [issues, setIssues] = useState<PmaygIssue[]>([]);
    const [loading, setLoading] = useState(true);

    const loadIssues = useCallback(() => {
        setLoading(true);
        const data = getInitialIssues();
        setIssues(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadIssues();
         const handleStorageChange = (event: StorageEvent) => {
            if (event.key === PMAYG_ISSUE_STORAGE_KEY) {
                loadIssues();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadIssues]);

    const syncIssues = (updatedIssues: PmaygIssue[]) => {
        setIssues(updatedIssues);
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(PMAYG_ISSUE_STORAGE_KEY, JSON.stringify(updatedIssues));
                window.dispatchEvent(new StorageEvent('storage', { key: PMAYG_ISSUE_STORAGE_KEY, newValue: JSON.stringify(updatedIssues) }));
            } catch (error) {
                console.error("Failed to save issues to localStorage:", error);
            }
        }
    };
    
    const getNextIssueSerialNumber = useCallback((districtName: string): string => {
        const counters = getIssueCounters();
        const currentSerial = counters[districtName] || 0;
        const nextSerial = currentSerial + 1;
        
        const newCounters = { ...counters, [districtName]: nextSerial };
        
        try {
            localStorage.setItem(ISSUE_COUNTER_STORAGE_KEY, JSON.stringify(newCounters));
        } catch (error) {
             console.error("Failed to save issue counters to localStorage:", error);
        }

        return `PMAY-G-${districtName.toUpperCase()}-ISSUE-${nextSerial}`;
    }, []);

    const addIssue = useCallback((issueData: Omit<PmaygIssue, 'id'>) => {
        const newIssue: PmaygIssue = {
            ...issueData,
            id: Date.now(),
        };
        const updatedIssues = [...getInitialIssues(), newIssue];
        syncIssues(updatedIssues);
    }, []);
    
    return { issues, loading, addIssue, getNextIssueSerialNumber };
};

    