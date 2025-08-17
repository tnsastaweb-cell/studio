
/**
 * @fileOverview Panchayat management service.
 * This file contains the data models and mock data for panchayats
 * in the application. It imports data from individual district files
 * and combines them into a single list.
 */
import type { Panchayat } from './panchayat-data/types';
import { KANCHEEPURAM_PANCHAYATS } from './panchayat-data/kancheepuram';
import { TIRUVALLUR_PANCHAYATS } from './panchayat-data/tiruvallur';
import { CUDDALORE_PANCHAYATS } from './panchayat-data/cuddalore';
import { VILUPPURAM_PANCHAYATS } from './panchayat-data/viluppuram';
import { VELLORE_PANCHAYATS } from './panchayat-data/vellore';
import { TIRUVANNAMALAI_PANCHAYATS } from './panchayat-data/tiruvannamalai';
import { SALEM_PANCHAYATS } from './panchayat-data/salem';
import { NAMAKKAL_PANCHAYATS } from './panchayat-data/namakkal';
import { DHARMAPURI_PANCHAYATS } from './panchayat-data/dharmapuri';
import { ERODE_PANCHAYATS } from './panchayat-data/erode';
import { THE_NILGIRIS_PANCHAYATS } from './panchayat-data/the-nilgiris';
import { COIMBATORE_PANCHAYATS } from './panchayat-data/coimbatore';
import { THANJAVUR_PANCHAYATS } from './panchayat-data/thanjavur';
import { NAGAPATTINAM_PANCHAYATS } from './panchayat-data/nagapattinam';
import { MAYILADUTHURAI_PANCHAYATS } from './panchayat-data/mayiladuthurai';
import { TIRUVARUR_PANCHAYATS } from './panchayat-data/tiruvarur';

export type { Panchayat };

export const MOCK_PANCHAYATS: Panchayat[] = [
  ...KANCHEEPURAM_PANCHAYATS,
  ...TIRUVALLUR_PANCHAYATS,
  ...CUDDALORE_PANCHAYATS,
  ...VILUPPURAM_PANCHAYATS,
  ...VELLORE_PANCHAYATS,
  ...TIRUVANNAMALAI_PANCHAYATS,
  ...SALEM_PANCHAYATS,
  ...NAMAKKAL_PANCHAYATS,
  ...DHARMAPURI_PANCHAYATS,
  ...ERODE_PANCHAYATS,
  ...THE_NILGIRIS_PANCHAYATS,
  ...COIMBATORE_PANCHAYATS,
  ...THANJAVUR_PANCHAYATS,
  ...NAGAPATTINAM_PANCHAYATS,
  ...MAYILADUTHURAI_PANCHAYATS,
  ...TIRUVARUR_PANCHAYATS,
];
