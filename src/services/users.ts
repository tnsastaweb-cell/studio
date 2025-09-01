
'use client';

/**
 * @fileOverview User and Role management service.
 * This file contains the data models and mock data for users and roles
 * in the application.
 *
 * - Role: Defines the possible user roles.
 * - User: Defines the structure for a user account.
 * - ROLES: A constant array of all available roles.
 * - MOCK_USERS: A list of sample users for development and testing.
 */
import { useState, useEffect, useCallback } from 'react';

// Defines the set of user roles available in the application.
export type Role =
  | 'DIRECTOR'
  | 'JD (NR)'
  | 'JD (SR)'
  | 'AD'
  | 'SUPERINTENDENT (ADMIN)'
  | 'SUPERINTENDENT (AUDIT)'
  | 'AO'
  | 'CONSULTANT'
  | 'SS'
  | 'AAO'
  | 'SLM'
  | 'ADMIN'
  | 'MIS ASSISTANT'
  | 'DRP'
  | 'DRP I/C'
  | 'BRP'
  | 'VRP'
  | 'CREATOR';

// Represents a user account in the system.
export interface User {
  id: number;
  name: string;
  employeeCode: string;
  designation: Role;
  mobileNumber: string;
  dateOfBirth: string; // Format: 'YYYY-MM-DD'
  email?: string;
  password: string; // In a real app, this should be a securely stored hash.
  status: 'active' | 'inactive';
  profilePicture?: string | null;
  theme?: string;
  
  // Extended Profile Details
  recruitmentType?: 'direct' | 'retired';
  locationType?: 'rural' | 'urban';
  district?: string;
  block?: string;
  panchayat?: string; // LGD Code
  panchayatName?: string;
  lgdCode?: string;
  urbanBodyType?: 'town_panchayat' | 'municipality' | 'corporation';
  urbanBodyName?: string;
  fullAddress?: string;
  pincode?: string;
  fatherName?: string;
  motherName?: string;
  spouseName?: string;
  religion?: string;
  caste?: string;
  age?: number;
  gender?: string;
  femaleType?: string;
  bloodGroup?: string;
  isDifferentlyAbled?: 'yes' | 'no';
  differentlyAbledCert?: any;
  healthIssues?: 'normal' | 'minor' | 'major';
  healthIssuesDetails?: string;
  medicalCert?: any;
  contactNumber2?: string;
  emailId?: string;
  eportalEmailId?: string;
  pfmsId?: string;
  bankName?: string;
  branchName?: string;
  accountNumber?: string;
  ifscCode?: string;
  aadhaar?: string;
  aadhaarUpload?: any;
  pan?: string;
  panUpload?: any;
  uan?: string;

  // Education & Experience
  academicDetails?: any[];
  workExperience?: any[];
  skills?: any[];

  // Working Details
  joiningDate?: string;
  brpWorkHistory?: any[];
  drpWorkHistory?: any[];
  workedAsDrpIc?: 'yes' | 'no';
  drpIcWorkHistory?: any[];
  
  // Training & Audit
  trainingTaken?: 'yes' | 'no';
  trainingTakenDetails?: any[];
  trainingGiven?: 'yes' | 'no';
  trainingGivenDetails?: any[];
  pilotAudit?: 'yes' | 'no';
  pilotAuditDetails?: any[];
  stateOfficeActivities?: 'yes' | 'no';
  stateOfficeActivitiesDetails?: any[];
  complaints?: any[];
}

// A constant array of all available roles.
export const ROLES: Role[] = [
  'DIRECTOR',
  'JD (NR)',
  'JD (SR)',
  'AD',
  'SUPERINTENDENT (ADMIN)',
  'SUPERINTENDENT (AUDIT)',
  'AO',
  'CONSULTANT',
  'SS',
  'AAO',
  'SLM',
  'ADMIN',
  'MIS ASSISTANT',
  'DRP',
  'DRP I/C',
  'BRP',
  'VRP',
  'CREATOR',
];

// A list of mock users for development purposes.
export const MOCK_USERS: User[] = [
  { id: 1, name: 'M.Ravichandran', employeeCode: 'TN-729', designation: 'BRP', mobileNumber: '9965537235', dateOfBirth: '1972-06-10', password: 'password123', status: 'active', district: 'Ariyalur', block: 'Ariyalur' },
  { id: 2, name: 'S.Kanagathara', employeeCode: 'TN-767', designation: 'BRP', mobileNumber: '9840639323', dateOfBirth: '1978-05-30', password: 'password123', status: 'active', district: 'Coimbatore' },
  { id: 3, name: 'D.Rajendran', employeeCode: 'TN-1022', designation: 'DRP', mobileNumber: '9994814897', dateOfBirth: '1968-10-06', password: 'password123', status: 'active', district: 'Chennai' },
  { id: 4, name: 'T.Sankar', employeeCode: 'TN-755', designation: 'DRP I/C', mobileNumber: '8220588742', dateOfBirth: '1978-05-13', password: 'password123', status: 'active', district: 'Dharmapuri' },
  { id: 5, name: 'S.Malarvizhi', employeeCode: 'TN-759', designation: 'SLM', mobileNumber: '7010621372', dateOfBirth: '1986-05-03', password: 'password123', status: 'active', district: 'Chennai' },
  { id: 6, name: 'P.K.Bhoopalan', employeeCode: 'TN-837', designation: 'BRP', mobileNumber: '9444487005', dateOfBirth: '1977-06-07', password: 'password123', status: 'active', district: 'Erode' },
  { id: 497, name: 'Creator User', employeeCode: 'TN-CREATOR', designation: 'CREATOR', mobileNumber: '9944892005', dateOfBirth: '1986-03-31', email: 'creator@sasta.com', password: 'password123', status: 'active', district: 'Chennai' }
];

const USER_STORAGE_KEY = 'sasta-users';

// This function simulates fetching users and provides methods to manipulate the user list.
export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you might fetch this from an API.
    // For now, we use localStorage to persist changes during a session.
    try {
      const storedUsers = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        // Initialize localStorage with the mock data if it's empty.
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(MOCK_USERS));
        setUsers(MOCK_USERS);
      }
    } catch (error) {
      console.error("Failed to access localStorage:", error);
      setUsers(MOCK_USERS); // Fallback to in-memory mock data
    } finally {
      setLoading(false);
    }
  }, []);
  
  const syncUsers = (updatedUsers: User[]) => {
     setUsers(updatedUsers);
     try {
         localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUsers));
         window.dispatchEvent(new StorageEvent('storage', { key: USER_STORAGE_KEY, newValue: JSON.stringify(updatedUsers) }));
     } catch (error) {
         console.error("Failed to save users to localStorage:", error);
     }
  };


  const addUser = useCallback((user: Omit<User, 'id' | 'status'>) => {
    setUsers(prevUsers => {
      const newUser = {
        ...user,
        id: (prevUsers[prevUsers.length -1]?.id ?? 0) + 1,
        status: 'active' as const,
      };
      const newUsers = [...prevUsers, newUser];
      syncUsers(newUsers);
      return newUsers;
    });
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUsers(prevUsers => {
      const newUsers = prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user);
      syncUsers(newUsers);
      return newUsers;
    });
  }, []);

  const deleteUser = useCallback((userId: number) => {
    setUsers(prevUsers => {
       const newUsers = prevUsers.filter(user => user.id !== userId);
       syncUsers(newUsers);
       return newUsers;
    });
  }, []);

  return { users, loading, addUser, updateUser, deleteUser };
};
