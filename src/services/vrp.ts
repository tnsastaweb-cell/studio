
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

const DISTRICT_CODE_MAP: { [key: string]: string } = {
  "Ariyalur": "16", "Chengalpattu": "33", "Chennai": "00", "Coimbatore": "09", "Cuddalore": "17",
  "Dharmapuri": "06", "Dindigul": "25", "Erode": "11", "Kallakurichi": "32", "Kancheepuram": "02",
  "Kanniyakumari": "30", "Karur": "14", "Krishnagiri": "07", "Madurai": "23", "Mayiladuthurai": "36",
  "Nagapattinam": "18", "Namakkal": "08", "Nilgiris": "10", "Perambalur": "15", "Pudukkottai": "21",
  "Ramanathapuram": "26", "Ranipet": "34", "Salem": "08", "Sivaganga": "22", "Tenkasi": "31",
  "Thanjavur": "20", "Theni": "24", "Thoothukudi": "29", "Tiruchirappalli": "13", "Tirunelveli": "28",
  "Tirupathur": "35", "Tiruppur": "12", "Tiruvallur": "01", "Tiruvannamalai": "04", "Tiruvarur": "19",
  "Vellore": "03", "Viluppuram": "05", "Virudhunagar": "27"
};


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
    
    const generateEmployeeCode = useCallback((district: string): string => {
        const districtCode = DISTRICT_CODE_MAP[district] || 'XX';
        const currentVRPs = getInitialVRPs();
        const serialNo = currentVRPs.filter(v => v.hasEmployeeCode === 'no').length + 1;
        return `SAU${districtCode}VRP${serialNo}`;
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
