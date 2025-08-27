
import { DISTRICTS } from '@/services/district-offices';

const sortedDistricts = DISTRICTS.filter(d => d !== "Chennai").sort((a, b) => a.localeCompare(b));

export const getDistrictCode = (district: string): string => {
    if (!district) return 'XX';
    if (district === "Chennai") return "00";
    
    const index = sortedDistricts.indexOf(district);
    return index !== -1 ? String(index + 1).padStart(2, '0') : 'XX';
};
