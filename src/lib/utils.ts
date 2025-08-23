import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const toTitleCase = (str: string) => {
  if (!str) return '';
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

// Assuming MOCK_PANCHAYATS is imported or available in the scope where this is used
import { MOCK_PANCHAYATS } from "@/services/panchayats";
export const uniqueDistricts = Array.from(new Set(MOCK_PANCHAYATS.map(p => p.district))).sort();
