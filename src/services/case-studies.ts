
'use client';

import { useState, useCallback, useEffect } from 'react';

export interface Photo {
    dataUrl: string;
    description: string;
}

export interface CaseStudy {
  id: number;
  caseStudyNo: string;
  scheme: string;
  district: string;
  block: string;
  panchayat: string;
  lgdCode: string;
  employeeCode: string;
  brpName: string;
  paraNo?: string;
  issueNo?: string;
  issueType?: string;
  issueCategory?: string;
  subCategory?: string;
  issueCode?: string;
  beneficiaries?: number;
  descriptionEnglish?: string;
  descriptionTamil?: string;
  tableRows?: number;
  tableCols?: number;
  tableData?: string[][];
  photoLayout?: string;
  photos?: Photo[];
}

const CASE_STUDY_STORAGE_KEY = 'sasta-case-studies';
const CASE_STUDY_COUNTER_STORAGE_KEY = 'sasta-case-study-counter';

const getInitialCaseStudies = (): CaseStudy[] => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(CASE_STUDY_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to access localStorage for Case Studies:", error);
        return [];
    }
};

const getCaseStudyCounters = (): { [key: string]: number } => {
    if (typeof window === 'undefined') return {};
    try {
        const stored = localStorage.getItem(CASE_STUDY_COUNTER_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.error("Failed to access localStorage for case study counters:", error);
        return {};
    }
};


export const useCaseStudies = () => {
    const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
    const [loading, setLoading] = useState(true);

    const loadCaseStudies = useCallback(() => {
        setLoading(true);
        const data = getInitialCaseStudies();
        setCaseStudies(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadCaseStudies();
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === CASE_STUDY_STORAGE_KEY) {
                loadCaseStudies();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadCaseStudies]);

    const syncCaseStudies = (updatedStudies: CaseStudy[]) => {
        setCaseStudies(updatedStudies);
         if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(CASE_STUDY_STORAGE_KEY, JSON.stringify(updatedStudies));
                window.dispatchEvent(new StorageEvent('storage', { key: CASE_STUDY_STORAGE_KEY, newValue: JSON.stringify(updatedStudies) }));
            } catch (error) {
                console.error("Failed to save case studies to localStorage:", error);
            }
        }
    };
    
    const getNextCaseStudyNumber = useCallback((districtName: string): string => {
        const counters = getCaseStudyCounters();
        const districtKey = districtName.toUpperCase().substring(0, 3);
        const currentSerial = counters[districtKey] || 0;
        const nextSerial = currentSerial + 1;
        const newCounters = { ...counters, [districtKey]: nextSerial };
        
        try {
            localStorage.setItem(CASE_STUDY_COUNTER_STORAGE_KEY, JSON.stringify(newCounters));
        } catch (error) {
            console.error("Failed to save case study counters:", error);
        }

        return `CS-${districtKey}-${String(nextSerial).padStart(3, '0')}`;
    }, []);

    const addCaseStudy = useCallback((studyData: Omit<CaseStudy, 'id'>) => {
        const newStudy: CaseStudy = {
            ...studyData,
            id: Date.now(),
        };
        const updatedStudies = [...getInitialCaseStudies(), newStudy];
        syncCaseStudies(updatedStudies);
    }, []);

    return { caseStudies, loading, addCaseStudy, getNextCaseStudyNumber };
};
