
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
import { TIRUPPUR_PANCHAYATS } from './panchayat-data/tiruppur';
import { THANJAVUR_PANCHAYATS } from './panchayat-data/thanjavur';
import { NAGAPATTINAM_PANCHAYATS } from './panchayat-data/nagapattinam';
import { MAYILADUTHURAI_PANCHAYATS } from './panchayat-data/mayiladuthurai';
import { TIRUVARUR_PANCHAYATS } from './panchayat-data/tiruvarur';
import { TIRUCHIRAPPALLI_PANCHAYATS } from './panchayat-data/tiruchirappalli';
import { KARUR_PANCHAYATS } from './panchayat-data/karur';
import { PERAMBALUR_PANCHAYATS } from './panchayat-data/perambalur';
import { ARIYALUR_PANCHAYATS } from './panchayat-data/ariyalur';
import { PUDUKKOTTAI_PANCHAYATS } from './panchayat-data/pudukkottai';
import { MADURAI_PANCHAYATS } from './panchayat-data/madurai';
import { THENI_PANCHAYATS } from './panchayat-data/theni';
import { DINDIGUL_PANCHAYATS } from './panchayat-data/dindigul';
import { RAMANATHAPURAM_PANCHAYATS } from './panchayat-data/ramanathapuram';
import { VIRUDHUNAGAR_PANCHAYATS } from './panchayat-data/virudhunagar';
import { SIVAGANGAI_PANCHAYATS } from './panchayat-data/sivagangai';
import { TIRUNELVELI_PANCHAYATS } from './panchayat-data/tirunelveli';
import { THOOTHUKKUDI_PANCHAYATS } from './panchayat-data/thoothukkudi';
import { KANNIYAKUMARI_PANCHAYATS } from './panchayat-data/kanniyakumari';
import { KRISHNAGIRI_PANCHAYATS } from './panchayat-data/krishnagiri';
import { KALLAKURICHI_PANCHAYATS } from './panchayat-data/kallakurichi';
import { CHENGALPATTU_PANCHAYATS } from './panchayat-data/chengalpattu';
import { RANIPET_PANCHAYATS } from './panchayat-data/ranipet';
import { TIRUPATHUR_PANCHAYATS } from './panchayat-data/tirupathur';

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
    ...COIMBATORE_PANCHAYATS,
    ...THE_NILGIRIS_PANCHAYATS,
    ...THANJAVUR_PANCHAYATS,
    ...NAGAPATTINAM_PANCHAYATS,
    ...MAYILADUTHURAI_PANCHAYATS,
    ...TIRUVARUR_PANCHAYATS,
    ...TIRUCHIRAPPALLI_PANCHAYATS,
    ...KARUR_PANCHAYATS,
    ...PERAMBALUR_PANCHAYATS,
    ...PUDUKKOTTAI_PANCHAYATS,
    ...MADURAI_PANCHAYATS,
    ...THENI_PANCHAYATS,
    ...DINDIGUL_PANCHAYATS,
    ...RAMANATHAPURAM_PANCHAYATS,
    ...VIRUDHUNAGAR_PANCHAYATS,
    ...SIVAGANGAI_PANCHAYATS,
    ...TIRUNELVELI_PANCHAYATS,
    ...THOOTHUKKUDI_PANCHAYATS,
    ...KANNIYAKUMARI_PANCHAYATS,
    ...KRISHNAGIRI_PANCHAYATS,
    ...ARIYALUR_PANCHAYATS,
    ...TIRUPPUR_PANCHAYATS,
    ...TENKASI_PANCHAYATS,
    ...KALLAKURICHI_PANCHAYATS,
    ...CHENGALPATTU_PANCHAYATS,
    ...RANIPET_PANCHAYATS,
    ...TIRUPATHUR_PANCHAYATS,
];
