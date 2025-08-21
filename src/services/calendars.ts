
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

    useEffect(() => {
        // This effect runs once on component mount to load data from localStorage.
        // It guarantees that the component will re-render with the loaded data.
        setCalendars(getInitialCalendars());
        setLoading(false);
    }, []);

    const syncCalendars = useCallback((updatedCalendars: CalendarFile[]) => {
        setCalendars(updatedCalendars);
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(updatedCalendars));
            } catch (error) {
                console.error("Failed to save calendars to localStorage:", error);
            }
        }
    }, []);

    const addCalendar = useCallback((calendarData: Omit<CalendarFile, 'id' | 'uploadedAt'>) => {
        const newCalendar: CalendarFile = {
            ...calendarData,
            id: Date.now(), // Use timestamp for a more robust unique ID
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
