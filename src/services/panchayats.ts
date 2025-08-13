/**
 * @fileOverview Panchayat management service.
 * This file contains the data models and mock data for panchayats
 * in the application.
 */

export interface Panchayat {
  name: string;
  lgdCode: string;
  block: string;
  district: string;
}

export const MOCK_PANCHAYATS: Panchayat[] = [
    { name: 'Village A', lgdCode: 'LGD001', block: 'Block X', district: 'District 1' },
    { name: 'Village B', lgdCode: 'LGD002', block: 'Block Y', district: 'District 1' },
    { name: 'Village C', lgdCode: 'LGD003', block: 'Block X', district: 'District 2' },
    { name: 'Village D', lgdCode: 'LGD004', block: 'Block Z', district: 'District 2' },
];
