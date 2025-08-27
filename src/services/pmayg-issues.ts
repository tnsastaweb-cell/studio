
'use client';

import { useState, useCallback, useEffect }from 'react';

export interface PmaygParaParticular {
  id: number;
  issueNumber: string;
  type: string;
  category: string;
  subCategory: string;
  codeNumber: string;
  cases: number;
  centralAmount: number;
  stateAmount: number;
  otherAmount: number;
  grievances: number;
  hlcRegNo?: string;
  paraStatus: 'PENDING' | 'CLOSED';
}

const ISSUE_STORAGE_KEY = 'sasta-pmayg-issues';

const getInitialIssues = (): PmaygParaParticular[] => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(ISSUE_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to access localStorage for PMAY-G issues:", error);
        return [];
    }
};

export const usePmaygIssues = () => {
    const [issues, setIssues] = useState<PmaygParaParticular[]>([]);
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

    const syncIssues = (updatedIssues: PmaygParaParticular[]) => {
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
    
    const addIssue = useCallback((issue: Omit<PmaygParaParticular, 'id'>) => {
        const newIssue: PmaygParaParticular = { ...issue, id: Date.now() };
        const updatedIssues = [...getInitialIssues(), newIssue];
        syncIssues(updatedIssues);
        return newIssue;
    }, []);
    
    const getNextIssueSerialNumber = (districtCode: string): number => {
        const issuesForDistrict = getInitialIssues().filter(
            issue => issue.issueNumber.startsWith(`PMAY-${districtCode}-`)
        );
        return issuesForDistrict.length + 1;
    }

    return { issues, loading, addIssue, getNextIssueSerialNumber };
}
