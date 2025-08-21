
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

// This function now returns a new empty array to avoid mutation issues.
const getInitialCalendars = (): CalendarFile[] => [];

export const useCalendars = () => {
    const [calendars, setCalendars] = useState<CalendarFile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(CALENDAR_STORAGE_KEY);
            if (stored) {
                setCalendars(JSON.parse(stored));
            } else {
                // Initialize with an empty array if nothing is stored
                setCalendars(getInitialCalendars());
            }
        } catch (error) {
            console.error("Failed to access localStorage for calendars:", error);
            setCalendars(getInitialCalendars());
        } finally {
            setLoading(false);
        }
    }, []);

    const syncCalendars = (updatedCalendars: CalendarFile[]) => {
        setCalendars(updatedCalendars);
        try {
            localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(updatedCalendars));
        } catch (error) {
            console.error("Failed to save calendars to localStorage:", error);
        }
    };

    const addCalendar = useCallback((calendarData: Omit<CalendarFile, 'id' | 'uploadedAt'>) => {
        setCalendars(prev => {
            const newCalendar = {
                ...calendarData,
                id: (prev.reduce((maxId, cal) => Math.max(cal.id, maxId), 0)) + 1,
                uploadedAt: new Date().toISOString(),
            };
            const newCalendars = [...prev, newCalendar];
            syncCalendars(newCalendars);
            return newCalendars;
        });
    }, []);
    
    const deleteCalendar = useCallback((id: number) => {
        setCalendars(prev => {
            const newCalendars = prev.filter(cal => cal.id !== id);
            syncCalendars(newCalendars);
            return newCalendars;
        });
    }, []);


    return { calendars, loading, addCalendar, deleteCalendar };
};
