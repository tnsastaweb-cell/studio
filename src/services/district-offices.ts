
'use client';

import { useState, useCallback } from 'react';

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

export const DISTRICTS = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri",
  "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur",
  "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal",
  "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet",
  "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi",
  "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur",
  "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"
].sort();


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

export const useDistrictOffices = () => {
    const [offices, setOffices] = useState<DistrictOffice[]>([]);
    const [loading, setLoading] = useState(true);

    useState(() => {
        try {
            const stored = localStorage.getItem(OFFICE_STORAGE_KEY);
            if (stored) {
                setOffices(JSON.parse(stored));
            } else {
                localStorage.setItem(OFFICE_STORAGE_KEY, JSON.stringify(MOCK_OFFICES));
                setOffices(MOCK_OFFICES);
            }
        } catch (error) {
            console.error("Failed to access localStorage for offices:", error);
            setOffices(MOCK_OFFICES);
        } finally {
            setLoading(false);
        }
    });

    const syncOffices = (updatedOffices: DistrictOffice[]) => {
        setOffices(updatedOffices);
        try {
            localStorage.setItem(OFFICE_STORAGE_KEY, JSON.stringify(updatedOffices));
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
