
'use client';

import { useState, useCallback, useEffect } from 'react';

export type FeedbackType = "Suggestion" | "Appreciation" | "Feedback" | "Issue";

export interface Feedback {
  id: number;
  name: string;
  email: string;
  type: FeedbackType;
  feedback: string;
  submittedAt: string;
}

const FEEDBACK_STORAGE_KEY = 'sasta-feedbacks';

const getInitialFeedbacks = (): Feedback[] => {
    if (typeof window === 'undefined') {
        return [];
    }
    try {
        const stored = localStorage.getItem(FEEDBACK_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to access localStorage for feedbacks:", error);
        return [];
    }
}

export const useFeedback = () => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);

    const loadFeedbacks = useCallback(() => {
        setLoading(true);
        const data = getInitialFeedbacks();
        setFeedbacks(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadFeedbacks();

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === FEEDBACK_STORAGE_KEY) {
                loadFeedbacks();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);

    }, [loadFeedbacks]);

    const syncFeedbacks = (updatedFeedbacks: Feedback[]) => {
        setFeedbacks(updatedFeedbacks);
        try {
            localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updatedFeedbacks));
            window.dispatchEvent(new StorageEvent('storage', { key: FEEDBACK_STORAGE_KEY, newValue: JSON.stringify(updatedFeedbacks) }));
        } catch (error) {
            console.error("Failed to save feedbacks to localStorage:", error);
        }
    };

  const addFeedback = useCallback((newFeedback: Omit<Feedback, 'id' | 'submittedAt'>) => {
    const feedbackWithMeta = {
      ...newFeedback,
      id: Date.now(),
      submittedAt: new Date().toISOString(),
    };
    const updatedFeedbacks = [...getInitialFeedbacks(), feedbackWithMeta];
    syncFeedbacks(updatedFeedbacks);
  }, []);

  return { feedbacks, loading, addFeedback };
};
