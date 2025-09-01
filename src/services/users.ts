
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
  { id: 7, name: 'S. Manimaran', employeeCode: 'TN-1087-IC', designation: 'DRP I/C', mobileNumber: '9626205694', dateOfBirth: '1986-01-18', password: 'password123', status: 'active' },
  { id: 8, name: 'G.Kalilur Rehman', employeeCode: 'TN-957-IC', designation: 'DRP I/C', mobileNumber: '8072267181', dateOfBirth: '1986-07-11', password: 'password123', status: 'active' },
  { id: 9, name: 'K.Ramanajothi', employeeCode: 'TN-752', designation: 'DRP', mobileNumber: '9585973351', dateOfBirth: '1975-06-03', password: 'password123', status: 'active' },
  { id: 10, name: 'P.Prema', employeeCode: 'TN-1268-IC', designation: 'DRP I/C', mobileNumber: '8667232805', dateOfBirth: '1968-07-16', password: 'password123', status: 'active' },
  { id: 11, name: 'G.Ashok Kumar', employeeCode: 'TN-881', designation: 'DRP', mobileNumber: '9489042846', dateOfBirth: '1970-01-01', password: 'password123', status: 'active' },
  { id: 12, name: 'N.Senthil', employeeCode: 'TN-753', designation: 'DRP', mobileNumber: '9443074060', dateOfBirth: '1970-01-01', password: 'password123', status: 'active' },
  { id: 13, name: 'T.Rajinikanthan', employeeCode: 'TN-1197-IC', designation: 'DRP I/C', mobileNumber: '9843125659', dateOfBirth: '1977-06-01', password: 'password123', status: 'active' },
  { id: 14, name: 'P.Venkatesan', employeeCode: 'TN-889-IC', designation: 'DRP I/C', mobileNumber: '8220248808', dateOfBirth: '1982-03-01', password: 'password123', status: 'active' },
  { id: 15, name: 'M.Pugalenthi', employeeCode: 'TN-998 -IC', designation: 'DRP I/C', mobileNumber: '7010836348', dateOfBirth: '1977-07-04', password: 'password123', status: 'active' },
  { id: 16, name: 'P.Govindarajan', employeeCode: 'TN-913', designation: 'DRP', mobileNumber: '9843843807', dateOfBirth: '1983-09-26', password: 'password123', status: 'active' },
  { id: 17, name: 'M.Subbaiah', employeeCode: 'TN-790', designation: 'DRP', mobileNumber: '7200002721', dateOfBirth: '1970-01-01', password: 'password123', status: 'active' },
  { id: 18, name: 'S.Ramesh', employeeCode: 'TN-1287-IC', designation: 'DRP I/C', mobileNumber: '8056328310', dateOfBirth: '1984-06-17', password: 'password123', status: 'active' },
  { id: 19, name: 'G.Vinoth', employeeCode: 'TN-1008-IC', designation: 'DRP I/C', mobileNumber: '7904706149', dateOfBirth: '1985-06-10', password: 'password123', status: 'active' },
  { id: 20, name: 'P.Vajjiravel', employeeCode: 'TN-1105-IC', designation: 'DRP I/C', mobileNumber: '8148868321', dateOfBirth: '1977-09-06', password: 'password123', status: 'active' },
  { id: 21, name: 'K.Abdul Kadhar Jailani', employeeCode: 'TN-706', designation: 'DRP', mobileNumber: '9342666803', dateOfBirth: '1982-05-31', password: 'password123', status: 'active' },
  { id: 22, name: 'K.Sundararajan', employeeCode: 'TN-997', designation: 'DRP', mobileNumber: '8015801694', dateOfBirth: '1981-07-15', password: 'password123', status: 'active' },
  { id: 23, name: 'S.Maharajan', employeeCode: 'TN-732-IC', designation: 'DRP I/C', mobileNumber: '8220826461', dateOfBirth: '1989-11-23', password: 'password123', status: 'active' },
  { id: 24, name: 'M.Ghouskhan', employeeCode: 'TN-982-IC', designation: 'DRP I/C', mobileNumber: '9047705380', dateOfBirth: '1990-10-22', password: 'password123', status: 'active' },
  { id: 25, name: 'T.Muthukumaran', employeeCode: 'TN-21', designation: 'DRP', mobileNumber: '9944817100', dateOfBirth: '1978-09-11', password: 'password123', status: 'active' },
  { id: 26, name: 'S.Vijayalakshmi', employeeCode: 'TN-1349', designation: 'DRP', mobileNumber: '9944111187', dateOfBirth: '1978-05-16', password: 'password123', status: 'active' },
  { id: 27, name: 'J.Sathya', employeeCode: 'TN-763', designation: 'DRP', mobileNumber: '8012109906', dateOfBirth: '1970-01-01', password: 'password123', status: 'active' },
  { id: 28, name: 'K.Sivasubramanian', employeeCode: 'TN-1016', designation: 'DRP', mobileNumber: '9655859638', dateOfBirth: '1979-08-18', password: 'password123', status: 'active' },
  { id: 29, name: 'P.Prabhakar', employeeCode: 'TN-839-IC', designation: 'DRP I/C', mobileNumber: '9952688998', dateOfBirth: '1977-06-12', password: 'password123', status: 'active' },
  { id: 30, name: 'M.Alagumurugan', employeeCode: 'TN-667', designation: 'DRP', mobileNumber: '6385132063', dateOfBirth: '1970-01-01', password: 'password123', status: 'active' },
  { id: 31, name: 'T.Saravanan', employeeCode: 'TN-1345-IC', designation: 'DRP I/C', mobileNumber: '9842519503', dateOfBirth: '1984-01-26', password: 'password123', status: 'active' },
  { id: 32, name: 'S.Pandiyan', employeeCode: 'TN-1017-IC', designation: 'DRP I/C', mobileNumber: '9790590043', dateOfBirth: '1971-06-30', password: 'password123', status: 'active' },
  { id: 33, name: 'S.Sivakumar', employeeCode: 'TN-896-IC', designation: 'DRP I/C', mobileNumber: '8807115346', dateOfBirth: '1973-05-20', password: 'password123', status: 'active' },
  { id: 34, name: 'K.Velthai', employeeCode: 'TN-14', designation: 'DRP', mobileNumber: '9791776165', dateOfBirth: '1973-05-22', password: 'password123', status: 'active' },
  { id: 35, name: 'C.Manimaran', employeeCode: 'TN-1163', designation: 'DRP', mobileNumber: '9941557767', dateOfBirth: '1976-03-25', password: 'password123', status: 'active' },
  { id: 36, name: 'S.James Billa Mary', employeeCode: 'TN-731-IC', designation: 'DRP I/C', mobileNumber: '8608007171', dateOfBirth: '1976-05-17', password: 'password123', status: 'active' },
  { id: 37, name: 'T.Sekar', employeeCode: 'TN-975', designation: 'DRP', mobileNumber: '9943398201', dateOfBirth: '1982-02-17', password: 'password123', status: 'active' },
  { id: 38, name: 'M.Chinnsamy', employeeCode: 'TN-1095', designation: 'DRP', mobileNumber: '9790291322', dateOfBirth: '1976-04-10', password: 'password123', status: 'active' },
  { id: 39, name: 'A.Pushpalatha', employeeCode: 'TN-1013', designation: 'DRP', mobileNumber: '8610494781', dateOfBirth: '1970-01-01', password: 'password123', status: 'active' },
  { id: 40, name: 'S.Mani', employeeCode: 'TN-1350', designation: 'DRP', mobileNumber: '9976880100', dateOfBirth: '1973-12-17', password: 'password123', status: 'active' },
  { id: 41, name: 'V.Sekar', employeeCode: 'TN-867', designation: 'DRP', mobileNumber: '9994836638', dateOfBirth: '1978-03-11', password: 'password123', status: 'active' },
  { id: 42, name: 'E.Mohan', employeeCode: 'TN-22', designation: 'DRP', mobileNumber: '9894915623', dateOfBirth: '1984-06-02', password: 'password123', status: 'active' },
  { id: 43, name: 'M.Kanson', employeeCode: 'TN-683-IC', designation: 'DRP I/C', mobileNumber: '9994574681', dateOfBirth: '1975-09-16', password: 'password123', status: 'active' },
  { id: 44, name: 'K.Yogamangalam', employeeCode: 'TN-1378', designation: 'ADMIN', mobileNumber: '8056943916', dateOfBirth: '1983-01-12', password: 'password123', status: 'active' },
  { id: 45, name: 'KARUNA', employeeCode: 'TN-CON', designation: 'CONSULTANT', mobileNumber: '9444839240', dateOfBirth: '1970-01-01', password: 'password123', status: 'active' },
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

    