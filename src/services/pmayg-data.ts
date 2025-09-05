

'use client';

import { useState, useCallback, useEffect } from 'react';
import * as z from 'zod';
import type { PmaygFormValues } from '@/app/data-entry/pamy-g/page';
import type { PmaygIssue } from './pmayg-issues';

export const paraParticularsSchema = z.object({
  id: z.number(), // Added for unique identification
  issueNumber: z.string(),
  type: z.string().min(1, "Type is required."),
  category: z.string().min(1, "Category is required."),
  subCategory: z.string(),
  codeNumber: z.string(),
  description: z.string().max(1000, "Description cannot exceed 1000 characters.").min(1, "Description is required."),
  beneficiaries: z.coerce.number().default(0),
  centralAmount: z.coerce.number().default(0),
  stateAmount: z.coerce.number().default(0),
  otherAmount: z.coerce.number().default(0),
  grievances: z.coerce.number().default(0),
  hlcRegNo: z.string().optional(),
  paraStatus: z.enum(['PENDING', 'CLOSED']).default('PENDING'),
  recoveryAmount: z.coerce.number().default(0),
  hlcRecoveryAmount: z.coerce.number().default(0),
});

export const pmaygFormSchema = z.object({
  // Section A - BRP Details
  brpEmployeeCode: z.string().min(1, "Employee Code is required."),
  brpName: z.string(),
  brpContact: z.string(),
  brpDistrict: z.string(),
  brpBlock: z.string(),

  // Section B - Basic Details
  district: z.string().min(1, "District is required"),
  block: z.string().min(1, "Block is required"),
  panchayat: z.string().min(1, "Panchayat is required"),
  lgdCode: z.string(),
  roundNo: z.string().min(1, "Round No. is required"),
  auditStartDate: z.date({ required_error: "Start Date is required" }),
  auditEndDate: z.date({ required_error: "End Date is required" }),
  sgsDate: z.date({ required_error: "SGS Date is required" }),
  expenditureYear: z.string().default('2016-2022'),
  auditYear: z.string(),
  observer: z.enum(['yes', 'no']),
  observerName: z.string().optional(),
  observerDesignation: z.string().optional(),
  coram: z.coerce.number().max(999, "Must be max 3 digits"),

  // Section C - Verification Details
  totalHouses: z.coerce.number().default(0),
  firstInstallment: z.coerce.number().default(0),
  secondInstallment: z.coerce.number().default(0),
  thirdInstallment: z.coerce.number().default(0),
  fourthInstallment: z.coerce.number().default(0),
  notCompletedAfterFourth: z.coerce.number().default(0),
  
  // Section D - Panchayat Summary
  gsDecision: z.enum(['yes', 'no']),
  projectDeficiencies: z.string().optional(),
  specialRemarks: z.string().optional(),
  auditOutcome: z.string().optional(),

  // Section E - Panchayat Verification Analysis
  misSeccCount: z.coerce.number().default(0),
  misSeccNonRejected: z.coerce.number().default(0),
  misSeccSelected: z.coerce.number().default(0),
  misAwaasPlusCount: z.coerce.number().default(0),
  misAwaasPlusSelected: z.coerce.number().default(0),
  misTotalSelected: z.coerce.number().default(0),
  fieldInterviewed: z.coerce.number().default(0),
  fieldVisited: z.coerce.number().default(0),
  fieldCouldNotIdentify: z.coerce.number().default(0),
  fieldTotalVerified: z.coerce.number().default(0),
  format3KutchaCount: z.coerce.number().default(0),

  // Section F - Report
  reportFile: z.any().optional(),

  // Section G - Para Particulars
  paraParticulars: z.array(paraParticularsSchema).optional(),
});

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
