
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
  urbanBodyType?: 'town_panchayat' | 'municipality' | 'corporation';
  urbanBodyName?: string;
}

export type Vrp = (VrpWithCode | VrpWithoutCode) & { id: number };

const VRP_STORAGE_KEY = 'sasta-vrps';

const DISTRICT_CODE_MAP: { [key: string]: string } = {
  "Chennai": "00", "Tiruvallur": "01", "Kancheepuram": "02", "Vellore": "03", "Tiruvannamalai": "04",
  "Viluppuram": "05", "Dharmapuri": "06", "Krishnagiri": "07", "Salem": "08", "Coimbatore": "09",
  "The Nilgiris": "10", "Erode": "11", "Tiruppur": "12", "Tiruchirappalli": "13", "Karur": "14",
  "Perambalur": "15", "Ariyalur": "16", "Cuddalore": "17", "Nagapattinam": "18", "Tiruvarur": "19",
  "Thanjavur": "20", "Pudukkottai": "21", "Sivaganga": "22", "Madurai": "23", "Theni": "24",
  "Dindigul": "25", "Ramanathapuram": "26", 'Virudhunagar': "27", "Tirunelveli": "28", "Thoothukudi": "29",
  "Kanniyakumari": "30", "Tenkasi": "31", "Kallakurichi": "32", "Chengalpattu": "33", "Ranipet": "34",
  "Tirupathur": "35", "Mayiladuthurai": "36"
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

    return { vrps, loading, addVrp, updateVrp, deleteVrp, generateEmployeeCode };
};
