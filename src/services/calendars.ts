
'use client';

import { useState, useCallback, useEffect } from 'react';

export interface CalendarFile {
  id: number;
  scheme: string;
  year: string;
  district: string;
  type: string;
  originalFilename: string;
  filename: string;
  dataUrl: string; // Store file content as a data URL
  uploadedAt: string;
}

const CALENDAR_STORAGE_KEY = 'sasta-calendars';

// This function should only be called on the client side.
const getInitialCalendars = (): CalendarFile[] => {
    if (typeof window === 'undefined') {
        return [];
    }
    try {
        const stored = localStorage.getItem(CALENDAR_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to access localStorage for calendars:", error);
        return [];
    }
};

export const useCalendars = () => {
    const [calendars, setCalendars] = useState<CalendarFile[]>([]);
    const [loading, setLoading] = useState(true);

    const loadCalendars = useCallback(() => {
        setLoading(true);
        const data = getInitialCalendars();
        setCalendars(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        // Load initially
        loadCalendars();

        const handleStorageChange = (event: StorageEvent) => {
          if (event.key === CALENDAR_STORAGE_KEY) {
            loadCalendars();
          }
        };
        
        window.addEventListener('storage', handleStorageChange);
        return () => {
          window.removeEventListener('storage', handleStorageChange);
        };
    }, [loadCalendars]);

    const syncCalendars = useCallback((updatedCalendars: CalendarFile[]) => {
        setCalendars(updatedCalendars);
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(updatedCalendars));
                 // Dispatch a storage event to notify other tabs
                window.dispatchEvent(new StorageEvent('storage', { key: CALENDAR_STORAGE_KEY, newValue: JSON.stringify(updatedCalendars) }));
            } catch (error) {
                console.error("Failed to save calendars to localStorage:", error);
            }
        }
    }, []);

    const addCalendar = useCallback((calendarData: Omit<CalendarFile, 'id' | 'uploadedAt'>) => {
        const newCalendar: CalendarFile = {
            ...calendarData,
            id: Date.now(),
            uploadedAt: new Date().toISOString(),
        };
        const updatedCalendars = [...getInitialCalendars(), newCalendar];
        syncCalendars(updatedCalendars);
    }, [syncCalendars]);
    
    const deleteCalendar = useCallback((id: number) => {
        const updatedCalendars = getInitialCalendars().filter(cal => cal.id !== id);
        syncCalendars(updatedCalendars);
    }, [syncCalendars]);


    return { calendars, loading, addCalendar, deleteCalendar };
};
