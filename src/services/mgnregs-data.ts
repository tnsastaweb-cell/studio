
'use client';

import { useState, useCallback, useEffect } from 'react';
import type { MgnregsFormValues } from '@/app/data-entry/mgnregs/page';

export interface MgnregsEntry extends MgnregsFormValues {
  id: number;
  submittedAt: string;
}

const MOCK_MGNREGS_ENTRIES: MgnregsEntry[] = [
  {
    id: 1,
    submittedAt: "2024-01-15T10:00:00Z",
    brpEmployeeCode: "TN-729",
    brpName: "M.Ravichandran",
    brpContact: "9965537235",
    brpDistrict: "Ariyalur",
    brpBlock: "Ariyalur",
    district: "Ariyalur",
    block: "Ariyalur",
    panchayat: "226362",
    lgdCode: "226362",
    roundNo: "1",
    auditStartDate: new Date("2024-01-01"),
    auditEndDate: new Date("2024-01-10"),
    sgsDate: new Date("2024-01-15"),
    expenditureYear: '2022-2023',
    auditYear: '2023-2024',
    observer: 'yes',
    observerName: 'Observer One',
    coram: 150,
    drpRole: 'DRP',
    drpEmployeeCode: 'TN-1022',
    drpName: 'D.Rajendran',
    drpContact: '9994814897',
    drpDistrict: 'Chennai',
    vrpDetails: [
      { vrpSearchValue: '9876543210' },
      { vrpSearchValue: '9876543211' },
      { vrpSearchValue: '9876543212' },
    ],
    pvtIndividualLandWorks: 5, pvtIndividualLandAmount: 50000,
    pvtIndividualAssetsWorks: 2, pvtIndividualAssetsAmount: 100000,
    pubCommunityLandWorks: 3, pubCommunityLandAmount: 75000,
    pubCommunityAssetsWorks: 1, pubCommunityAssetsAmount: 200000,
    skilledSemiSkilledAmount: 25000, materialAmount: 150000,
    totalWorks: 11, totalAmount: 600000,
    worksVerified: 10, householdsWorked: 50, householdsVerified: 45,
    paraParticulars: [
      {
        issueNumber: "FM-ARI-001",
        type: 'FM - Financial Misappropriation',
        category: 'Work Related',
        subCategory: 'Work was done through machines',
        codeNumber: 'FM-3.7',
        amount: 25000,
        paraStatus: 'PENDING',
      },
      {
        issueNumber: "PV-ARI-001",
        type: 'PV - Process Violation',
        category: 'Denial Of Entitlements',
        subCategory: 'Work site facilities are not provided',
        codeNumber: 'PV-1.11',
        amount: 0,
        paraStatus: 'PENDING',
      },
    ],
  },
];


const MGNREGS_STORAGE_KEY = 'sasta-mgnregs-entries';

const getInitialMgnregsEntries = (): MgnregsEntry[] => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(MGNREGS_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return parsed.map((item: any) => ({
                ...item,
                auditStartDate: item.auditStartDate ? new Date(item.auditStartDate) : undefined,
                auditEndDate: item.auditEndDate ? new Date(item.auditEndDate) : undefined,
                sgsDate: item.sgsDate ? new Date(item.sgsDate) : undefined,
            }));
        }
         // If nothing is in storage, initialize with mock data
        localStorage.setItem(MGNREGS_STORAGE_KEY, JSON.stringify(MOCK_MGNREGS_ENTRIES));
        return MOCK_MGNREGS_ENTRIES;

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
