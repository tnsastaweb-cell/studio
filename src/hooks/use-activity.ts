
'use client';

import { useState, useCallback, useEffect } from 'react';
import { startOfMonth, endOfMonth, isWithinInterval, format } from 'date-fns';

export interface ActivityLog {
  employeeCode: string;
  timestamp: string;
}

const ACTIVITY_STORAGE_KEY = 'sasta-activity-logs';

const getInitialActivityLogs = (): ActivityLog[] => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(ACTIVITY_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to access localStorage for activity logs:", error);
        return [];
    }
};

export const useActivity = () => {
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    const loadActivityLogs = useCallback(() => {
        setLoading(true);
        const data = getInitialActivityLogs();
        setActivityLogs(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadActivityLogs();
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === ACTIVITY_STORAGE_KEY) {
                loadActivityLogs();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadActivityLogs]);

    const syncActivityLogs = (updatedLogs: ActivityLog[]) => {
        setActivityLogs(updatedLogs);
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(updatedLogs));
                 window.dispatchEvent(new StorageEvent('storage', { key: ACTIVITY_STORAGE_KEY, newValue: JSON.stringify(updatedLogs) }));
            } catch (error) {
                console.error("Failed to save activity logs to localStorage:", error);
            }
        }
    };
    
    const logActivity = useCallback((employeeCode: string) => {
        const newLog: ActivityLog = {
            employeeCode,
            timestamp: new Date().toISOString(),
        };
        const updatedLogs = [...getInitialActivityLogs(), newLog];
        syncActivityLogs(updatedLogs);
    }, []);

    const clearMonthlyActivity = useCallback(() => {
        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);
        
        const remainingLogs = getInitialActivityLogs().filter(log => {
            return !isWithinInterval(new Date(log.timestamp), { start, end });
        });
        syncActivityLogs(remainingLogs);
    }, []);

    return { activityLogs, loading, logActivity, clearMonthlyActivity };
};
