
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

const MOCK_CALENDARS: CalendarFile[] = [];

export const useCalendars = () => {
    const [calendars, setCalendars] = useState<CalendarFile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(CALENDAR_STORAGE_KEY);
            if (stored) {
                setCalendars(JSON.parse(stored));
            } else {
                localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(MOCK_CALENDARS));
                setCalendars(MOCK_CALENDARS);
            }
        } catch (error) {
            console.error("Failed to access localStorage for calendars:", error);
            setCalendars(MOCK_CALENDARS);
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
                id: (prev[prev.length - 1]?.id ?? 0) + 1,
                uploadedAt: new Date().toISOString(),
            };
            const newCalendars = [...prev, newCalendar];
            syncCalendars(newCalendars);
            return newCalendars;
        });
    }, []);

    return { calendars, loading, addCalendar };
};
