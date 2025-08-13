/**
 * @fileOverview Scheme management service.
 * This file contains the data models and mock data for schemes
 * in the application.
 */

export interface Scheme {
  id: string;
  name: string;
  type: string;
  category: string;
  subCategory: string;
  code: string;
}

export const MOCK_SCHEMES: Scheme[] = [
  { id: '1', name: 'MGNREGS', type: 'Employment', category: 'Rural', subCategory: 'Wage Employment', code: 'SCHM001' },
  { id: '2', name: 'PMAY-G', type: 'Housing', category: 'Rural', subCategory: 'New Construction', code: 'SCHM002' },
  { id: '3', name: 'NSAP', type: 'Pension', category: 'Social Security', subCategory: 'Old Age Pension', code: 'SCHM003' },
  { id: '4', name: 'NMP', type: 'Nutrition', category: 'Health', subCategory: 'Mid-day Meal', code: 'SCHM004' },
];
