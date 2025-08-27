
'use client';

import { useState, useCallback, useEffect } from 'react';

export interface PmaygIssue {
  issueNumber: string;
  type: string;
  category: string;
  subCategory: string;
  codeNumber: string;
  cases: number;
  centralAmount: number;
  stateAmount: number;
  othersAmount: number;
  grievances: number;
  hlcRegNo?: string;
  paraStatus: 'PENDING' | 'CLOSED';
  recoveryAmount: number;
}

const ISSUE_STORAGE_KEY = 'sasta-pmayg-issues';
const ISSUE_COUNTER_KEY = 'sasta-pmayg-issue-counter';

const getInitialIssues = (): PmaygIssue[] => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(ISSUE_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to access localStorage for PMAY-G issues:", error);
        return [];
    }
};

const getIssueCounter = (): number => {
    if (typeof window === 'undefined') return 0;
    try {
        const stored = localStorage.getItem(ISSUE_COUNTER_KEY);
        return stored ? parseInt(stored, 10) : 0;
    } catch (error) {
        console.error("Failed to access localStorage for issue counter:", error);
        return 0;
    }
};

const saveIssueCounter = (counter: number) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(ISSUE_COUNTER_KEY, counter.toString());
    } catch (error) {
        console.error("Failed to save issue counter to localStorage:", error);
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
            if (event.key === ISSUE_STORAGE_KEY) {
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
                localStorage.setItem(ISSUE_STORAGE_KEY, JSON.stringify(updatedIssues));
                window.dispatchEvent(new StorageEvent('storage', { key: ISSUE_STORAGE_KEY, newValue: JSON.stringify(updatedIssues) }));
            } catch (error) {
                console.error("Failed to save issues to localStorage:", error);
            }
        }
    };
    
    const getNextIssueSerialNumber = useCallback((): number => {
        const currentCounter = getIssueCounter();
        return currentCounter + 1;
    }, []);

    const addIssue = useCallback((issue: PmaygIssue) => {
        const updatedIssues = [...getInitialIssues(), issue];
        syncIssues(updatedIssues);
        
        // Update the global counter
        const currentCounter = getIssueCounter();
        saveIssueCounter(currentCounter + 1);
    }, []);

    return { issues, loading, addIssue, getNextIssueSerialNumber };
};
