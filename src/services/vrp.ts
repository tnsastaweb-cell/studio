
'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { DISTRICTS } from './district-offices';
import { MOCK_PANCHAYATS } from './panchayats';

// Base VRP data structure
export interface BaseVrp {
  role: 'VRP';
  name: string;
  district: string;
  address: string;
  pincode: string;
  familyRelation: "father" | "husband";
  familyName: string;
  caste: string;
  dob: string;
  age: number;
  gender: 'Female';
  qualification: string;
  contactNumber1: string;
  contactNumber2?: string;
  bankName: string;
  branchName: string;
  accountNumber: string;
  ifscCode: string;
  aadhaar: string;
  pan?: string;
  pfmsId: string;
}

// VRP with an existing employee code
export interface VrpWithCode extends BaseVrp {
  hasEmployeeCode: 'yes';
  employeeCode: string; // The existing MGNREGA code
  block: string;
  panchayat: string; // LGD Code
  lgdCode: string;
  panchayatName: string;
  mgnregaJobCard: string;
}

// VRP without an existing employee code
export interface VrpWithoutCode extends BaseVrp {
  hasEmployeeCode: 'no';
  employeeCode: string; // The newly generated code
  scheme: 'NMP' | 'Other';
  locationType: 'rural' | 'urban';
  block?: string;
  panchayat?: string; // LGD Code
  lgdCode?: string;
  panchayatName?: string;
  urbanBodyType?: 'town_panchayat' | 'municipality' | 'corporation';
  urbanBodyName?: string;
}

export type Vrp = (VrpWithCode | VrpWithoutCode) & { id: number };

const VRP_STORAGE_KEY = 'sasta-vrps';

const getInitialVRPs = (): Vrp[] => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(VRP_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to access localStorage for VRPs:", error);
        return [];
    }
};

export const useVRPs = () => {
    const [vrps, setVrps] = useState<Vrp[]>([]);
    const [loading, setLoading] = useState(true);

    const panchayatNameMap = useMemo(() => {
        const map = new Map<string, { panchayat: string, block: string }>();
        MOCK_PANCHAYATS.forEach(p => {
            map.set(p.lgdCode, { panchayat: p.name, block: p.block });
        });
        return map;
    }, []);

    const enrichedVrps = useMemo(() => {
        return vrps.map(vrp => {
            const panchayatInfo = vrp.panchayat ? panchayatNameMap.get(vrp.panchayat) : undefined;
            return {
                ...vrp,
                panchayatName: panchayatInfo ? panchayatInfo.panchayat : vrp.panchayatName || '',
                block: panchayatInfo ? panchayatInfo.block : vrp.block || '',
            };
        });
    }, [vrps, panchayatNameMap]);

    const loadVRPs = useCallback(() => {
        setLoading(true);
        const data = getInitialVRPs();
        setVrps(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadVRPs();
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === VRP_STORAGE_KEY) {
                loadVRPs();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadVRPs]);
    
    const syncVRPs = (updatedVRPs: Vrp[]) => {
        setVrps(updatedVRPs);
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(VRP_STORAGE_KEY, JSON.stringify(updatedVRPs));
                window.dispatchEvent(new StorageEvent('storage', { key: VRP_STORAGE_KEY, newValue: JSON.stringify(updatedVRPs) }));
            } catch (error) {
                console.error("Failed to save VRPs to localStorage:", error);
            }
        }
    };
    
    const generateEmployeeCode = useCallback((): string => {
        const currentVRPs = getInitialVRPs();
        const serialNo = currentVRPs.filter(v => v.hasEmployeeCode === 'no').length + 1;
        return `TN-VRP-N-${serialNo}`;
    }, []);

    const addVrp = useCallback((vrpData: Omit<Vrp, 'id'>) => {
        const newVrp: Vrp = {
            ...vrpData,
            id: Date.now(),
        };
        const updatedVRPs = [...getInitialVRPs(), newVrp];
        syncVRPs(updatedVRPs);
    }, []);

    const updateVrp = useCallback((updatedVrp: Vrp) => {
         const updatedVRPs = getInitialVRPs().map(v => v.id === updatedVrp.id ? updatedVrp : v);
         syncVRPs(updatedVRPs);
    }, []);

    const deleteVrp = useCallback((vrpId: number) => {
        const updatedVRPs = getInitialVRPs().filter(v => v.id !== vrpId);
        syncVRPs(updatedVRPs);
    }, []);

    return { vrps: enrichedVrps, loading, addVrp, updateVrp, deleteVrp, generateEmployeeCode };
};
