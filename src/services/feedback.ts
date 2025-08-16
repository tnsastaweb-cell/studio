
'use client';

import { useState, useCallback } from 'react';

export interface Feedback {
  id: number;
  name: string;
  email: string;
  feedback: string;
  submittedAt: Date;
}

const MOCK_FEEDBACKS: Feedback[] = [];

export const useFeedback = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(MOCK_FEEDBACKS);

  const addFeedback = useCallback((newFeedback: Omit<Feedback, 'id' | 'submittedAt'>) => {
    const feedbackWithMeta = {
      ...newFeedback,
      id: MOCK_FEEDBACKS.length + 1,
      submittedAt: new Date(),
    };
    MOCK_FEEDBACKS.push(feedbackWithMeta);
    setFeedbacks([...MOCK_FEEDBACKS]);
  }, []);

  return { feedbacks, addFeedback };
};
