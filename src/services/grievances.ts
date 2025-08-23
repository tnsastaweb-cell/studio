
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useUsers } from './users';

export type GrievanceStatus = 'Submitted' | 'In Progress' | 'Resolved' | 'Rejected' | 'Anonymous - No Reply';

export interface Grievance {
    id: number;
    regNo: string;
    fromName: string;
    fromAddress: string;
    district: string;
    pincode: string;
    contactNumber: string;
    aadhaarNumber?: string;
    email: string;
    subject: string;
    content: string;
    date: string;
    place: string;
    sincerelyName: string;
    attachment?: {
        name: string;
        type: string;
        size: number;
        dataUrl: string;
    };
    isAnonymous: boolean;
    status: GrievanceStatus;
    submittedAt: string;
    reply?: {
        content: string;
        attachment?: {
            name: string;
            type: string;
            size: number;
            dataUrl: string;
        },
        repliedBy: string; // User's name
        repliedAt: string;
    }
}


const GRIEVANCE_STORAGE_KEY = 'sasta-grievances';

const generateRegNo = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'GRV-';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

const getInitialGrievances = (): Grievance[] => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(GRIEVANCE_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to access localStorage for grievances:", error);
        return [];
    }
};

export const useGrievances = () => {
    const [grievances, setGrievances] = useState<Grievance[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUsers();

    const loadGrievances = useCallback(() => {
        setLoading(true);
        const data = getInitialGrievances();
        setGrievances(data.sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
        setLoading(false);
    }, []);

    useEffect(() => {
        loadGrievances();
        
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === GRIEVANCE_STORAGE_KEY) {
                loadGrievances();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadGrievances]);

    const syncGrievances = (updatedGrievances: Grievance[]) => {
        const sorted = updatedGrievances.sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setGrievances(sorted);
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(GRIEVANCE_STORAGE_KEY, JSON.stringify(sorted));
                window.dispatchEvent(new StorageEvent('storage', { key: GRIEVANCE_STORAGE_KEY, newValue: JSON.stringify(sorted) }));
            } catch (error) {
                console.error("Failed to save grievances to localStorage:", error);
            }
        }
    };
    
    const addGrievance = useCallback((grievance: Omit<Grievance, 'id' | 'submittedAt' | 'regNo' | 'status'>) => {
        const isAnonymous = !grievance.contactNumber;
        const newGrievance: Grievance = {
            ...grievance,
            id: Date.now(),
            regNo: generateRegNo(),
            status: isAnonymous ? 'Anonymous - No Reply' : 'Submitted',
            submittedAt: new Date().toISOString(),
        };
        
        const currentGrievances = getInitialGrievances();
        syncGrievances([...currentGrievances, newGrievance]);
        return newGrievance;
    }, []);

    const addReply = useCallback((grievanceId: number, replyContent: string, replyAttachment?: Grievance['reply']['attachment']) => {
        if (!user) return; // Or handle error

        setGrievances(prev => {
            const updatedGrievances = prev.map(g => {
                if (g.id === grievanceId) {
                    return {
                        ...g,
                        status: 'Resolved' as GrievanceStatus,
                        reply: {
                            content: replyContent,
                            attachment: replyAttachment,
                            repliedBy: user.name,
                            repliedAt: new Date().toISOString(),
                        }
                    }
                }
                return g;
            });
            syncGrievances(updatedGrievances);
            return updatedGrievances;
        });
    }, [user]);
    
    return { grievances, loading, addGrievance, addReply };
};
