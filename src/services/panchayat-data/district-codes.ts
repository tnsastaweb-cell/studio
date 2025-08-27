
import { DISTRICTS_WITH_CODES } from '@/services/district-offices';

export const getDistrictCode = (districtName: string): string => {
    if (!districtName) return 'XX';
    const district = DISTRICTS_WITH_CODES.find(d => d.name === districtName);
    return district ? district.code : 'XX';
};
