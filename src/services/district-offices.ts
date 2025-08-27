
'use client';

import { useState, useCallback, useEffect } from 'react';

export interface DistrictInfo {
    name: string;
    code: string;
}

export interface DistrictOffice {
  id: number;
  district: string;
  buildingName: string;
  address: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  mapsLink?: string;
  contactPerson: string;
  contactNumbers: string[];
  email: string;
}

export const DISTRICTS_WITH_CODES: DistrictInfo[] = [
  { name: "Chennai", code: "00" },
  { name: "Ariyalur", code: "01" },
  { name: "Chengalpattu", code: "02" },
  { name: "Coimbatore", code: "03" },
  { name: "Cuddalore", code: "04" },
  { name: "Dharmapuri", code: "05" },
  { name: "Dindigul", code: "06" },
  { name: "Erode", code: "07" },
  { name: "Kallakurichi", code: "08" },
  { name: "Kancheepuram", code: "09" },
  { name: "Kanniyakumari", code: "10" },
  { name: "Karur", code: "11" },
  { name: "Krishnagiri", code: "12" },
  { name: "Madurai", code: "13" },
  { name: "Mayiladuthurai", code: "14" },
  { name: "Nagapattinam", code: "15" },
  { name: "Namakkal", code: "16" },
  { name: "Perambalur", code: "17" },
  { name: "Pudukkottai", code: "18" },
  { name: "Ramanathapuram", code: "19" },
  { name: "Ranipet", code: "20" },
  { name: "Salem", code: "21" },
  { name: "Sivaganga", code: "22" },
  { name: "Tenkasi", code: "23" },
  { name: "Thanjavur", code: "24" },
  { name: "The Nilgiris", code: "25" },
  { name: "Theni", code: "26" },
  { name: "Thoothukudi", code: "27" },
  { name: "Tiruchirappalli", code: "28" },
  { name: "Tirunelveli", code: "29" },
  { name: "Tirupathur", code: "30" },
  { name: "Tiruppur", code: "31" },
  { name: 'Tiruvallur', code: '32' },
  { name: 'Tiruvannamalai', code: '33' },
  { name: 'Tiruvarur', code: '34' },
  { name: 'Vellore', code: '35' },
  { name: 'Viluppuram', code: '36' },
  { name: 'Virudhunagar', code: '37' },
];


export const DISTRICTS = DISTRICTS_WITH_CODES.map(d => d.name);


const MOCK_OFFICES: DistrictOffice[] = [
    {
        id: 1,
        district: "Chennai",
        buildingName: "District Collectorate",
        address: "123, Rajaji Salai, George Town",
        pincode: "600001",
        latitude: 13.0827,
        longitude: 80.2707,
        mapsLink: "https://maps.google.com/?q=13.0827,80.2707",
        contactPerson: "Thiru. Admin",
        contactNumbers: ["9876543210"],
        email: "collector.chn@tn.gov.in"
    }
];

const OFFICE_STORAGE_KEY = 'sasta-district-offices';

const getInitialOffices = (): DistrictOffice[] => {
    if (typeof window === 'undefined') return MOCK_OFFICES;
    try {
        const stored = localStorage.getItem(OFFICE_STORAGE_KEY);
        return stored ? JSON.parse(stored) : MOCK_OFFICES;
    } catch (error) {
        console.error("Failed to access localStorage for offices:", error);
        return MOCK_OFFICES;
    }
}

export const useDistrictOffices = () => {
    const [offices, setOffices] = useState<DistrictOffice[]>([]);
    const [loading, setLoading] = useState(true);

     const loadOffices = useCallback(() => {
        setLoading(true);
        const data = getInitialOffices();
        setOffices(data);
        if (typeof window !== 'undefined' && !localStorage.getItem(OFFICE_STORAGE_KEY)) {
             localStorage.setItem(OFFICE_STORAGE_KEY, JSON.stringify(data));
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadOffices();
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === OFFICE_STORAGE_KEY) {
                loadOffices();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadOffices]);

    const syncOffices = (updatedOffices: DistrictOffice[]) => {
        setOffices(updatedOffices);
        try {
            localStorage.setItem(OFFICE_STORAGE_KEY, JSON.stringify(updatedOffices));
             window.dispatchEvent(new StorageEvent('storage', { key: OFFICE_STORAGE_KEY, newValue: JSON.stringify(updatedOffices) }));
        } catch (error) {
            console.error("Failed to save offices to localStorage:", error);
        }
    };

    const addOffice = useCallback((office: Omit<DistrictOffice, 'id'>) => {
        setOffices(prev => {
            const newOffice = {
                ...office,
                id: (prev[prev.length - 1]?.id ?? 0) + 1,
            };
            const newOffices = [...prev, newOffice];
            syncOffices(newOffices);
            return newOffices;
        });
    }, []);

    const updateOffice = useCallback((updatedOffice: DistrictOffice) => {
        setOffices(prev => {
            const newOffices = prev.map(o => o.id === updatedOffice.id ? updatedOffice : o);
            syncOffices(newOffices);
            return newOffices;
        });
    }, []);

    const deleteOffice = useCallback((officeId: number) => {
        setOffices(prev => {
            const newOffices = prev.filter(o => o.id !== officeId);
            syncOffices(newOffices);
            return newOffices;
        });
    }, []);

    return { offices, loading, addOffice, updateOffice, deleteOffice };
};
