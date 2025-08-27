
import { DISTRICTS } from '@/services/district-offices';

const sortedDistricts = DISTRICTS.filter(d => d !== "Chennai").sort((a, b) => a.localeCompare(b));

export const getDistrictCode = (district: string): string => {
    if (!district) return 'XX';
    if (district === "Chennai") return "00";
    
    // Find the index in the alphabetically sorted list of districts (excluding Chennai)
    const index = sortedDistricts.indexOf(district);
    
    // Add 1 to the index to start numbering from 1, then pad with a leading zero if needed
    return index !== -1 ? String(index + 1).padStart(2, '0') : 'XX';
};
