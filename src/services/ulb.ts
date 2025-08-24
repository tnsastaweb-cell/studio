
export const ULB_TYPES = ['town_panchayat', 'municipality', 'corporation'] as const;
export type UlbType = typeof ULB_TYPES[number];

export interface UrbanLocalBody {
    id: number;
    name: string;
    type: UlbType;
    district: string;
}

export const MOCK_ULBS: UrbanLocalBody[] = [
    { id: 1, name: 'Alandur', type: 'municipality', district: 'Chennai' },
    { id: 2, name: 'Ambattur', type: 'municipality', district: 'Tiruvallur' },
    { id: 3, name: 'Avadi', type: 'municipality', district: 'Tiruvallur' },
    { id: 4, name: 'Madhavaram', type: 'municipality', district: 'Tiruvallur' },
    { id: 5, name: 'Pallavaram', type: 'municipality', district: 'Chengalpattu' },
    { id: 6, name: 'Poonamallee', type: 'town_panchayat', district: 'Tiruvallur' },
    { id: 7, name: 'Tambaram', type: 'municipality', district: 'Chengalpattu' },
    { id: 8, name: 'Tiruvottiyur', type: 'municipality', district: 'Tiruvallur' },
    { id: 9, name: 'Coimbatore', type: 'corporation', district: 'Coimbatore' },
    { id: 10, name: 'Madurai', type: 'corporation', district: 'Madurai' },
    { id: 11, name: 'Salem', type: 'corporation', district: 'Salem' },
    { id: 12, name: 'Tiruchirappalli', type: 'corporation', district: 'Tiruchirappalli' },
    { id: 13, name: 'Tirunelveli', type: 'corporation', district: 'Tirunelveli' },
    { id: 14, name: 'Tiruppur', type: 'corporation', district: 'Tiruppur' },
    { id: 15, name: 'Vellore', type: 'corporation', district: 'Vellore' },
    { id: 16, name: 'Erode', type: 'corporation', district: 'Erode' },
    { id: 17, name: 'Thoothukudi', type: 'corporation', district: 'Thoothukudi' },
    { id: 18, name: 'Dindigul', type: 'corporation', district: 'Dindigul' },
    { id: 19, name: 'Thanjavur', type: 'corporation', district: 'Thanjavur' },
    { id: 20, name: 'Hosur', type: 'corporation', district: 'Krishnagiri' },
];
