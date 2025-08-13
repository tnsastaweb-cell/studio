
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

// Defines the set of user roles available in the application.
export type Role =
  | 'CREATOR'
  | 'ADMIN'
  | 'CONSULTANT'
  | 'HR'
  | 'SLM'
  | 'DRP'
  | 'DRP I/C'
  | 'BRP'
  | 'VRP';

// Represents a user account in the system.
export interface User {
  id: number;
  name: string;
  employeeCode: string;
  designation: Role;
  mobileNumber: string;
  dateOfBirth: string; // Format: 'YYYY-MM-DD'
  password: string; // In a real app, this should be a securely stored hash.
  status: 'active' | 'inactive';
}

// A constant array of all available roles.
export const ROLES: Role[] = [
  'CREATOR',
  'ADMIN',
  'CONSULTANT',
  'HR',
  'SLM',
  'DRP',
  'DRP I/C',
  'BRP',
  'VRP',
];

// A list of mock users for development purposes.
export const MOCK_USERS: User[] = [
  {
    id: 1,
    name: 'S. Admin',
    employeeCode: 'EMP001',
    designation: 'ADMIN',
    mobileNumber: '9876543210',
    dateOfBirth: '1985-01-15',
    password: 'password123', // Demo password
    status: 'active',
  },
  {
    id: 2,
    name: 'H. Resources',
    employeeCode: 'EMP002',
    designation: 'HR',
    mobileNumber: '9876543211',
    dateOfBirth: '1990-05-20',
    password: 'password123',
    status: 'active',
  },
   {
    id: 3,
    name: 'B. Resource Person',
    employeeCode: 'EMP003',
    designation: 'BRP',
    mobileNumber: '9876543212',
    dateOfBirth: '1992-08-01',
    password: 'password123',
    status: 'active',
  },
   {
    id: 4,
    name: 'V. Resource Person',
    employeeCode: 'EMP004',
    designation: 'VRP',
    mobileNumber: '9876543213',
    dateOfBirth: '1995-11-30',
    password: 'password123',
    status: 'inactive',
  },
];
