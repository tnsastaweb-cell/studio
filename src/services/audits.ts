
'use client';

import { useState, useCallback, useEffect } from 'react';

export const NIRNAY_STATUSES = ['Yes', 'No'] as const;
export type NirnayStatus = typeof NIRNAY_STATUSES[number];

export const MIS_STATUSES = ['Uploaded', 'Not Uploaded'] as const;
export type MisStatus = typeof MIS_STATUSES[number];

export interface AuditEntry {
  id: number;
  scheme: string;
  roundNo: string;
  district: string;
  block: string;
  panchayat: string; // LGD Code stored here
  lgdCode: string;
  panchayatName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  sgsDate: string; // YYYY-MM-DD
  auditVenue: string;
  sgsVenue: string;
  nirnayStatus: NirnayStatus;
  misStatus: MisStatus;
  comment?: string;
}

const AUDIT_STORAGE_KEY = 'sasta-audit-entries';

const getInitialAudits = (): AuditEntry[] => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to access localStorage for audits:", error);
        return [];
    }
};

export const useAudits = () => {
    const [audits, setAudits] = useState<AuditEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const loadAudits = useCallback(() => {
        setLoading(true);
        const data = getInitialAudits();
        setAudits(data.sort((a,b) => new Date(b.sgsDate).getTime() - new Date(a.sgsDate).getTime()));
        setLoading(false);
    }, []);

    useEffect(() => {
        loadAudits();
        
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === AUDIT_STORAGE_KEY) {
                loadAudits();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadAudits]);

    const syncAudits = (updatedAudits: AuditEntry[]) => {
        const sorted = updatedAudits.sort((a,b) => new Date(b.sgsDate).getTime() - new Date(a.sgsDate).getTime());
        setAudits(sorted);
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(sorted));
                window.dispatchEvent(new StorageEvent('storage', { key: AUDIT_STORAGE_KEY, newValue: JSON.stringify(sorted) }));
            } catch (error) {
                console.error("Failed to save audits to localStorage:", error);
            }
        }
    };
    
    const addAudit = useCallback((auditData: Omit<AuditEntry, 'id'>) => {
        const newAudit: AuditEntry = {
            ...auditData,
            id: Date.now(),
        };
        const updatedAudits = [...getInitialAudits(), newAudit];
        syncAudits(updatedAudits);
    }, []);
    
    const updateAudit = useCallback((updatedAudit: AuditEntry) => {
         const updatedAudits = getInitialAudits().map(audit => audit.id === updatedAudit.id ? updatedAudit : audit);
         syncAudits(updatedAudits);
    }, []);

    const deleteAudit = useCallback((auditId: number) => {
        const updatedAudits = getInitialAudits().filter(audit => audit.id !== auditId);
        syncAudits(updatedAudits);
    }, []);
    
    return { audits, loading, addAudit, updateAudit, deleteAudit };
};
