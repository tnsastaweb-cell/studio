

'use client';

import { useState, useEffect, useCallback } from 'react';
import * as z from 'zod';

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

// A constant array of all available roles.
export const ROLES: Role[] = [
  'DIRECTOR', 'JD (NR)', 'JD (SR)', 'AD', 'SUPERINTENDENT (ADMIN)',
  'SUPERINTENDENT (AUDIT)', 'AO', 'CONSULTANT', 'SS', 'AAO', 'SLM',
  'ADMIN', 'MIS ASSISTANT', 'DRP', 'DRP I/C', 'BRP', 'VRP', 'CREATOR',
];


export const staffFormSchema = z.object({
  designation: z.string().min(1, "Role/Designation is required."),
  
  // Basic Information
  photo: z.any().optional(),
  recruitmentType: z.enum(['direct', 'retired'], { required_error: "Recruitment Type is required."}),
  employeeCode: z.string().min(1, "Employee Code is required."),
  name: z.string().min(1, "Name is required."),
  contactNumber: z.string().min(1, "Contact Number is required."),

  // Location Details
  locationType: z.enum(['rural', 'urban'], { required_error: "Location Type is required."}),
  district: z.string().min(1, "District is required."),
  block: z.string().optional(),
  panchayat: z.string().optional(),
  lgdCode: z.string().optional(),
  urbanBodyType: z.enum(['town_panchayat', 'municipality', 'corporation']).optional(),
  urbanBodyName: z.string().optional(),
  fullAddress: z.string().min(1, "Full Address is required.").max(200, "Address is too long"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits."),

  // Family Details
  fatherName: z.string().min(1, "Father's Name is required."),
  motherName: z.string().min(1, "Mother's Name is required."),
  spouseName: z.string().optional(),

  // Personal details
  religion: z.string().min(1, "Religion is required."),
  caste: z.string().optional(),
  dateOfBirth: z.date({ required_error: "Date of birth is required." }),
  age: z.string().optional(),
  gender: z.string().min(1, "Gender is required"),
  femaleType: z.string().optional(),
  bloodGroup: z.string().optional(),
  isDifferentlyAbled: z.enum(['yes', 'no'], { required_error: "This field is required."}),
  differentlyAbledCert: z.any().optional(),
  healthIssues: z.enum(['normal', 'minor', 'major'], { required_error: "This field is required."}),
  healthIssuesDetails: z.string().optional(),
  medicalCert: z.any().optional(),
  
  // Personal Info
  contactNumber2: z.string().optional(),
  emailId: z.string().email("Invalid email address.").min(1, "Email is required."),
  eportalEmailId: z.string().email("Invalid E-Portal email address.").min(1, "E-portal email is required."),
  pfmsId: z.string().min(1, "PFMS ID is required."),
  bankName: z.string().min(1, "Bank Name is required."),
  branchName: z.string().min(1, "Branch Name is required."),
  accountNumber: z.string().min(1, "Account Number is required."),
  ifscCode: z.string().min(1, "IFSC Code is required."),
  aadhaar: z.string().min(12, "Aadhaar must be 12 digits.").max(12, "Aadhaar must be 12 digits."),
  aadhaarUpload: z.any().refine(file => file?.[0], "Aadhaar copy is required."),
  pan: z.string().min(10, "PAN must be 10 characters.").max(10, "PAN must be 10 characters."),
  panUpload: z.any().refine(file => file?.[0], "PAN copy is required."),
  uan: z.string().optional(),

  // Education & Experience
  academicDetails: z.array(z.object({
    level: z.string().min(1, 'Level is required'),
    course: z.string().min(1, 'Course is required'),
    institution: z.string().min(1, 'Institution is required'),
    board: z.string().min(1, 'Board/University is required'),
    fromYear: z.date({ required_error: 'From year is required' }),
    toYear: z.date({ required_error: 'To year is required' }),
    aggregate: z.coerce.number().min(0).max(100, "Cannot be over 100%"),
    certificate: z.any().optional(),
  })).min(1, "At least one academic detail is required."),

  workExperience: z.array(z.object({
    companyName: z.string().min(1, 'Company Name is required'),
    natureOfJob: z.string().min(1, 'Nature of Job is required'),
    fromDate: z.date({ required_error: 'From date is required' }),
    toDate: z.date({ required_error: 'To date is required' }),
    duration: z.string().optional(),
    certificate: z.any().optional(),
  })).min(1, "At least one work experience is required."),

  skills: z.array(z.object({
    skill: z.string().min(1, "Skill cannot be empty")
  })).min(1, "At least one skill is required."),

  // Working Details
  joiningDate: z.date({ required_error: "Joining date is required." }),
  brpWorkHistory: z.array(z.object({
    station: z.enum(['worked', 'present']),
    district: z.string().min(1),
    block: z.string().min(1),
    fromDate: z.date(),
    toDate: z.date(),
    duration: z.string().optional(),
  })).optional(),
  drpWorkHistory: z.array(z.object({
    station: z.enum(['worked', 'present']),
    district: z.string().min(1),
    fromDate: z.date(),
    toDate: z.date(),
    duration: z.string().optional(),
  })).optional(),
  workedAsDrpIc: z.enum(['yes', 'no']).optional(),
  drpIcWorkHistory: z.array(z.object({
    station: z.enum(['worked', 'present']),
    district: z.string().min(1),
    fromDate: z.date(),
    toDate: z.date(),
    duration: z.string().optional(),
  })).optional(),
  
  // Training & Audit
  trainingTaken: z.enum(['yes', 'no']),
  trainingTakenDetails: z.array(z.object({
    startDate: z.date(),
    endDate: z.date(),
    location: z.string(),
    trainingName: z.string(),
    grade: z.string(),
  })).optional(),
  
  trainingGiven: z.enum(['yes', 'no']),
  trainingGivenDetails: z.array(z.object({
    startDate: z.date(),
    endDate: z.date(),
    location: z.string(),
    trainingName: z.string(),
  })).optional(),

  pilotAudit: z.enum(['yes', 'no']),
  pilotAuditDetails: z.array(z.object({
    startDate: z.date(),
    endDate: z.date(),
    location: z.string(),
    schemeName: z.string(),
  })).optional(),

  stateOfficeActivities: z.enum(['yes', 'no']),
  stateOfficeActivitiesDetails: z.array(z.object({
    year: z.date(),
    workParticulars: z.string(),
  })).optional(),

  complaints: z.array(z.object({
    receivedOn: z.date(),
    complainantDetails: z.string().optional(),
    complaint: z.string().optional(),
    remarks: z.string().optional(),
    actionTaken: z.string().optional(),
  })).optional(),
  
  declaration: z.boolean().default(true),

}).refine(data => {
    if (data.locationType === 'rural') return !!data.block && !!data.panchayat;
    return true;
}, { message: "Block and Panchayat are required for Rural locations.", path: ['panchayat'],
}).refine(data => {
    if (data.locationType === 'urban') return !!data.urbanBodyType && !!data.urbanBodyName;
    return true;
}, { message: "Urban Body Type and Name are required for Urban locations.", path: ['urbanBodyName'],
}).refine(data => {
    if (data.isDifferentlyAbled === 'yes') return !!data.differentlyAbledCert?.[0];
    return true;
}, { message: "Certificate is required if differently abled.", path: ['differentlyAbledCert']
}).refine(data => {
    if (data.healthIssues === 'major') return !!data.medicalCert?.[0];
    return true;
}, { message: "Medical certificate is required for major health issues.", path: ['medicalCert']
});

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
  renewalDate?: string;
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



// A list of mock users for development purposes.
export const MOCK_USERS: User[] = [
  { id: 1, name: 'M.Ravichandran', employeeCode: 'TN-729', designation: 'BRP', mobileNumber: '9965537235', dateOfBirth: '1972-06-10', password: 'password123', status: 'active', district: 'Ariyalur', block: 'Ariyalur' },
  { id: 2, name: 'S.Kanagathara', employeeCode: 'TN-767', designation: 'BRP', mobileNumber: '9840639323', dateOfBirth: '1978-05-30', password: 'password123', status: 'active', district: 'Coimbatore' },
  { id: 3, name: 'D.Rajendran', employeeCode: 'TN-1022', designation: 'DRP', mobileNumber: '9994814897', dateOfBirth: '1968-10-06', password: 'password123', status: 'active', district: 'Chennai' },
  { id: 4, name: 'T.Sankar', employeeCode: 'TN-755', designation: 'DRP I/C', mobileNumber: '8220588742', dateOfBirth: '1978-05-13', password: 'password123', status: 'active', district: 'Dharmapuri' },
  { id: 5, name: 'S.Malarvizhi', employeeCode: 'TN-759', designation: 'SLM', mobileNumber: '7010621372', dateOfBirth: '1986-05-03', password: 'password123', status: 'active', district: 'Chennai' },
  { id: 6, name: 'P.K.Bhoopalan', employeeCode: 'TN-837', designation: 'BRP', mobileNumber: '944487005', dateOfBirth: '1977-06-07', password: 'password123', status: 'active', district: 'Erode' },
  { id: 497, name: 'Creator User', employeeCode: 'TN-CREATOR', designation: 'CREATOR', mobileNumber: '9944892005', dateOfBirth: '1986-03-31', email: 'creator@sasta.com', password: 'password123', status: 'active', district: 'Chennai' },
  { id: 537, name: 'S. Manimaran', employeeCode: 'TN-1087-IC', designation: 'DRP I/C', mobileNumber: '9626205694', dateOfBirth: '1986-01-18', password: 'password123', status: 'active' },
  { id: 538, name: 'G.Kalilur Rehman', employeeCode: 'TN-957-IC', designation: 'DRP I/C', mobileNumber: '8072267181', dateOfBirth: '1986-07-11', password: 'password123', status: 'active' },
  { id: 539, name: 'K.Ramanajothi', employeeCode: 'TN-752', designation: 'DRP', mobileNumber: '9585973351', dateOfBirth: '1975-06-03', password: 'password123', status: 'active' },
  { id: 540, name: 'P.Prema', employeeCode: 'TN-1268-IC', designation: 'DRP I/C', mobileNumber: '8667232805', dateOfBirth: '1968-07-16', password: 'password123', status: 'active' },
  { id: 541, name: 'G.Ashok Kumar', employeeCode: 'TN-881', designation: 'DRP', mobileNumber: '9489042846', dateOfBirth: '1984-10-24', password: 'password123', status: 'active' },
  { id: 542, name: 'N.Senthil', employeeCode: 'TN-753', designation: 'DRP', mobileNumber: '9443074060', dateOfBirth: '1974-07-22', password: 'password123', status: 'active' },
  { id: 543, name: 'T.Rajinikanthan', employeeCode: 'TN-1197-IC', designation: 'DRP I/C', mobileNumber: '9843125659', dateOfBirth: '1977-06-01', password: 'password123', status: 'active' },
  { id: 544, name: 'P.Venkatesan', employeeCode: 'TN-889-IC', designation: 'DRP I/C', mobileNumber: '8220248808', dateOfBirth: '1982-03-01', password: 'password123', status: 'active' },
  { id: 545, name: 'M.Pugalenthi', employeeCode: 'TN-998 -IC', designation: 'DRP I/C', mobileNumber: '7010836348', dateOfBirth: '1977-07-04', password: 'password123', status: 'active' },
  { id: 546, name: 'P.Govindarajan', employeeCode: 'TN-913', designation: 'DRP', mobileNumber: '9843843807', dateOfBirth: '1983-09-26', password: 'password123', status: 'active' },
  { id: 547, name: 'M.Subbaiah', employeeCode: 'TN-790', designation: 'DRP', mobileNumber: '7200002721', dateOfBirth: '1976-06-09', password: 'password123', status: 'active' },
  { id: 548, name: 'S.Ramesh', employeeCode: 'TN-1287-IC', designation: 'DRP I/C', mobileNumber: '8056328310', dateOfBirth: '1984-06-17', password: 'password123', status: 'active' },
  { id: 549, name: 'G.Vinoth', employeeCode: 'TN-1008-IC', designation: 'DRP I/C', mobileNumber: '7904706149', dateOfBirth: '1985-06-10', password: 'password123', status: 'active' },
  { id: 550, name: 'P.Vajjiravel', employeeCode: 'TN-1105-IC', designation: 'DRP I/C', mobileNumber: '8148868321', dateOfBirth: '1977-09-06', password: 'password123', status: 'active' },
  { id: 551, name: 'K.Abdul Kadhar Jailani', employeeCode: 'TN-706', designation: 'DRP', mobileNumber: '9342666803', dateOfBirth: '1982-05-31', password: 'password123', status: 'active' },
  { id: 552, name: 'K.Sundararajan', employeeCode: 'TN-997', designation: 'DRP', mobileNumber: '8015801694', dateOfBirth: '1981-07-15', password: 'password123', status: 'active' },
  { id: 553, name: 'S.Maharajan', employeeCode: 'TN-732-IC', designation: 'DRP I/C', mobileNumber: '8220826461', dateOfBirth: '1989-11-23', password: 'password123', status: 'active' },
  { id: 554, name: 'M.Ghouskhan', employeeCode: 'TN-982-IC', designation: 'DRP I/C', mobileNumber: '9047705380', dateOfBirth: '1990-10-22', password: 'password123', status: 'active' },
  { id: 555, name: 'T.Muthukumaran', employeeCode: 'TN-21', designation: 'DRP', mobileNumber: '9944817100', dateOfBirth: '1978-09-11', password: 'password123', status: 'active' },
  { id: 556, name: 'S.Vijayalakshmi', employeeCode: 'TN-1349', designation: 'DRP', mobileNumber: '9944111187', dateOfBirth: '1978-05-16', password: 'password123', status: 'active' },
  { id: 557, name: 'J.Sathya', employeeCode: 'TN-763', designation: 'DRP', mobileNumber: '8012109906', dateOfBirth: '1985-07-15', password: 'password123', status: 'active' },
  { id: 558, name: 'K.Sivasubramanian', employeeCode: 'TN-1016', designation: 'DRP', mobileNumber: '9655859638', dateOfBirth: '1979-08-18', password: 'password123', status: 'active' },
  { id: 559, name: 'P.Prabhakar', employeeCode: 'TN-839-IC', designation: 'DRP I/C', mobileNumber: '9952688998', dateOfBirth: '1977-06-12', password: 'password123', status: 'active' },
  { id: 560, name: 'M.Alagumurugan', employeeCode: 'TN-667', designation: 'DRP', mobileNumber: '6385132063', dateOfBirth: '1972-02-17', password: 'password123', status: 'active' },
  { id: 561, name: 'T.Saravanan', employeeCode: 'TN-1345-IC', designation: 'DRP I/C', mobileNumber: '9842519503', dateOfBirth: '1984-01-26', password: 'password123', status: 'active' },
  { id: 562, name: 'S.Pandiyan', employeeCode: 'TN-1017-IC', designation: 'DRP I/C', mobileNumber: '9790590043', dateOfBirth: '1971-06-30', password: 'password123', status: 'active' },
  { id: 563, name: 'S.Sivakumar', employeeCode: 'TN-896-IC', designation: 'DRP I/C', mobileNumber: '8807115346', dateOfBirth: '1973-05-20', password: 'password123', status: 'active' },
  { id: 564, name: 'K.Velthai', employeeCode: 'TN-14', designation: 'DRP', mobileNumber: '9791776165', dateOfBirth: '1973-05-22', password: 'password123', status: 'active' },
  { id: 565, name: 'C.Manimaran', employeeCode: 'TN-1163', designation: 'DRP', mobileNumber: '9941557767', dateOfBirth: '1976-03-25', password: 'password123', status: 'active' },
  { id: 566, name: 'S.James Billa Mary', employeeCode: 'TN-731-IC', designation: 'DRP I/C', mobileNumber: '8608007171', dateOfBirth: '1976-05-17', password: 'password123', status: 'active' },
  { id: 567, name: 'T.Sekar', employeeCode: 'TN-975', designation: 'DRP', mobileNumber: '9943398201', dateOfBirth: '1982-02-17', password: 'password123', status: 'active' },
  { id: 568, name: 'M.Chinnsamy', employeeCode: 'TN-1095', designation: 'DRP', mobileNumber: '9790291322', dateOfBirth: '1976-04-10', password: 'password123', status: 'active' },
  { id: 569, name: 'A.Pushpalatha', employeeCode: 'TN-1013', designation: 'DRP', mobileNumber: '8610494781', dateOfBirth: '1983-06-01', password: 'password123', status: 'active' },
  { id: 570, name: 'S.Mani', employeeCode: 'TN-1350', designation: 'DRP', mobileNumber: '9976880100', dateOfBirth: '1973-12-17', password: 'password123', status: 'active' },
  { id: 571, name: 'V.Sekar', employeeCode: 'TN-867', designation: 'DRP', mobileNumber: '9994836638', dateOfBirth: '1978-03-11', password: 'password123', status: 'active' },
  { id: 572, name: 'E.Mohan', employeeCode: 'TN-22', designation: 'DRP', mobileNumber: '9894915623', dateOfBirth: '1984-06-02', password: 'password123', status: 'active' },
  { id: 573, name: 'M.Kanson', employeeCode: 'TN-683-IC', designation: 'DRP I/C', mobileNumber: '9994574681', dateOfBirth: '1975-09-16', password: 'password123', status: 'active' },
  { id: 574, name: 'K.Yogamangalam', employeeCode: 'TN-1378', designation: 'ADMIN', mobileNumber: '8056943916', dateOfBirth: '1983-01-12', password: 'password123', status: 'active' },
  { id: 575, name: 'KARUNA', employeeCode: 'TN-CON', designation: 'CONSULTANT', mobileNumber: '9444839240', dateOfBirth: '1976-01-01', password: 'password123', status: 'active' }
];

const USER_STORAGE_KEY = 'sasta-users';

// This function simulates fetching users and provides methods to manipulate the user list.
export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(() => {
    setLoading(true);
    if (typeof window !== 'undefined') {
        try {
            const storedUsers = localStorage.getItem(USER_STORAGE_KEY);
            if (storedUsers) {
                setUsers(JSON.parse(storedUsers));
            } else {
                localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(MOCK_USERS));
                setUsers(MOCK_USERS);
            }
        } catch (error) {
            console.error("Failed to access localStorage:", error);
            setUsers(MOCK_USERS);
        }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUsers();
    
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === USER_STORAGE_KEY) {
            loadUsers();
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };

  }, [loadUsers]);
  
  const syncUsers = (updatedUsers: User[]) => {
     setUsers(updatedUsers);
     if (typeof window !== 'undefined') {
         try {
             localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUsers));
             window.dispatchEvent(new StorageEvent('storage', { key: USER_STORAGE_KEY, newValue: JSON.stringify(updatedUsers) }));
         } catch (error) {
             console.error("Failed to save users to localStorage:", error);
         }
     }
  };


  const addUser = useCallback((user: Omit<User, 'id' | 'status'>) => {
    setUsers(prevUsers => {
      const newUsers = [...prevUsers, {
        ...user,
        id: (prevUsers[prevUsers.length -1]?.id ?? 0) + 1,
        status: 'active' as const,
      }];
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
