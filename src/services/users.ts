
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
  { id: 1, name: 'M.Ravichandran', employeeCode: 'TN-729', designation: 'BRP', mobileNumber: '9965537235', dateOfBirth: '1972-06-10', password: 'password123', status: 'active' },
  { id: 2, name: 'S.Kanagathara', employeeCode: 'TN-767', designation: 'BRP', mobileNumber: '9840639323', dateOfBirth: '1978-05-30', password: 'password123', status: 'active' },
  { id: 3, name: 'D.Rajendran', employeeCode: 'TN-1022', designation: 'BRP', mobileNumber: '9994814897', dateOfBirth: '1968-10-06', password: 'password123', status: 'active' },
  { id: 4, name: 'T.Sankar', employeeCode: 'TN-755', designation: 'BRP', mobileNumber: '8220588742', dateOfBirth: '1978-05-13', password: 'password123', status: 'active' },
  { id: 5, name: 'S.Malarvizhi', employeeCode: 'TN-759', designation: 'BRP', mobileNumber: '7010621372', dateOfBirth: '1986-05-03', password: 'password123', status: 'active' },
  { id: 6, name: 'P.K.Bhoopalan', employeeCode: 'TN-837', designation: 'BRP', mobileNumber: '9444487005', dateOfBirth: '1977-06-07', password: 'password123', status: 'active' },
  { id: 7, name: 'M.Thangameenakshi', employeeCode: 'TN-703', designation: 'BRP', mobileNumber: '7358441060', dateOfBirth: '1980-08-28', password: 'password123', status: 'active' },
  { id: 8, name: 'N.Megarajan', employeeCode: 'TN-685', designation: 'BRP', mobileNumber: '9543715419', dateOfBirth: '1971-10-05', password: 'password123', status: 'active' },
  { id: 9, name: 'R.Jayapal', employeeCode: 'TN-772', designation: 'BRP', mobileNumber: '8939437659', dateOfBirth: '1969-05-02', password: 'password123', status: 'active' },
  { id: 10, name: 'S.Senthamizh selvan', employeeCode: 'TN-727', designation: 'BRP', mobileNumber: '9787883883', dateOfBirth: '1986-05-13', password: 'password123', status: 'active' },
  { id: 11, name: 'P.Umamaheswari', employeeCode: 'TN-698', designation: 'BRP', mobileNumber: '9884645577', dateOfBirth: '1982-11-26', password: 'password123', status: 'active' },
  { id: 12, name: 'M.A.Muthamil selvan', employeeCode: 'TN-1298', designation: 'BRP', mobileNumber: '9994161621', dateOfBirth: '1981-11-18', password: 'password123', status: 'active' },
  { id: 13, name: 'B.Bakiyaraj', employeeCode: 'TN-981', designation: 'BRP', mobileNumber: '8248085838', dateOfBirth: '1983-05-03', password: 'password123', status: 'active' },
  { id: 14, name: 'R.Pandian', employeeCode: 'TN-948', designation: 'BRP', mobileNumber: '9943647105', dateOfBirth: '1970-03-17', password: 'password123', status: 'active' },
  { id: 15, name: 'S.Vijayakumari', employeeCode: 'TN-964', designation: 'BRP', mobileNumber: '8110862631', dateOfBirth: '1979-04-03', password: 'password123', status: 'active' },
  { id: 16, name: 'L.Durgadevi', employeeCode: 'TN-680', designation: 'BRP', mobileNumber: '8610900399', dateOfBirth: '1984-06-11', password: 'password123', status: 'active' },
  { id: 17, name: 'A.E.Thanigachalam', employeeCode: 'TN-719', designation: 'BRP', mobileNumber: '9791328772', dateOfBirth: '1976-06-09', password: 'password123', status: 'active' },
  { id: 18, name: 'D.Ashok kumar', employeeCode: 'TN-672', designation: 'BRP', mobileNumber: '9600828265', dateOfBirth: '1983-06-13', password: 'password123', status: 'active' },
  { id: 19, name: 'T.K.Raja', employeeCode: 'TN-678', designation: 'BRP', mobileNumber: '9042094530', dateOfBirth: '1984-06-10', password: 'password123', status: 'active' },
  { id: 20, name: 'P.Thiyagarajan', employeeCode: 'TN-673', designation: 'BRP', mobileNumber: '9444437591', dateOfBirth: '1978-02-06', password: 'password123', status: 'active' },
  { id: 21, name: 'A.S.Selvakumar', employeeCode: 'TN-675', designation: 'BRP', mobileNumber: '9444111794', dateOfBirth: '1984-06-03', password: 'password123', status: 'active' },
  { id: 22, name: 'K.Kalaiyarasi', employeeCode: 'TN-728', designation: 'BRP', mobileNumber: '9629956946', dateOfBirth: '1977-05-30', password: 'password123', status: 'active' },
  { id: 23, name: 'S.V.Vinayagam', employeeCode: 'TN-669', designation: 'BRP', mobileNumber: '8667581853', dateOfBirth: '1979-04-04', password: 'password123', status: 'active' },
  { id: 24, name: 'S.Suresh', employeeCode: 'TN-671', designation: 'BRP', mobileNumber: '9944486982', dateOfBirth: '1981-05-15', password: 'password123', status: 'active' },
  { id: 25, name: 'S.M.Vinayagam', employeeCode: 'TN-701', designation: 'BRP', mobileNumber: '8667096387', dateOfBirth: '1989-07-15', password: 'password123', status: 'active' },
  { id: 26, name: 'M.Saritha', employeeCode: 'TN-677', designation: 'BRP', mobileNumber: '7904891794', dateOfBirth: '1980-07-21', password: 'password123', status: 'active' },
  { id: 27, name: 'T.V.Vinayagam', employeeCode: 'TN-720', designation: 'BRP', mobileNumber: '9786336073', dateOfBirth: '1974-04-10', password: 'password123', status: 'active' },
  { id: 28, name: 'V.Suresh', employeeCode: 'TN-676', designation: 'BRP', mobileNumber: '9176020008', dateOfBirth: '1979-05-02', password: 'password123', status: 'active' },
  { id: 29, name: 'A.R.Raja', employeeCode: 'TN-682', designation: 'BRP', mobileNumber: '8825938268', dateOfBirth: '1984-06-05', password: 'password123', status: 'active' },
  { id: 30, name: 'V.Kalaiselvan', employeeCode: 'TN-929', designation: 'BRP', mobileNumber: '9787373895', dateOfBirth: '1981-08-10', password: 'password123', status: 'active' },
  { id: 31, name: 'G.Sudhakar', employeeCode: 'TN-950', designation: 'BRP', mobileNumber: '8870047070', dateOfBirth: '1987-06-09', password: 'password123', status: 'active' },
  { id: 32, name: 'P.Felix Maria Xavior', employeeCode: 'TN-922', designation: 'BRP', mobileNumber: '7010317294', dateOfBirth: '1976-03-10', password: 'password123', status: 'active' },
  { id: 33, name: 'D.Prabu', employeeCode: 'TN-919', designation: 'BRP', mobileNumber: '7010642456', dateOfBirth: '1983-06-08', password: 'password123', status: 'active' },
  { id: 34, name: 'K.Gnanasoundari', employeeCode: 'TN-907', designation: 'BRP', mobileNumber: '8778076891', dateOfBirth: '1978-05-05', password: 'password123', status: 'active' },
  { id: 35, name: 'K.Palanivel', employeeCode: 'TN-959', designation: 'BRP', mobileNumber: '9344842524', dateOfBirth: '1970-07-29', password: 'password123', status: 'active' },
  { id: 36, name: 'M.Akila', employeeCode: 'TN-915', designation: 'BRP', mobileNumber: '8248154018', dateOfBirth: '1973-06-17', password: 'password123', status: 'active' },
  { id: 37, name: 'P.Prema', employeeCode: 'TN-917', designation: 'BRP', mobileNumber: '8667232805', dateOfBirth: '1981-08-04', password: 'password123', status: 'active' },
  { id: 38, name: 'K.Pushbalatha', employeeCode: 'TN-1295', designation: 'BRP', mobileNumber: '6369533719', dateOfBirth: '1981-03-15', password: 'password123', status: 'active' },
  { id: 39, name: 'A. Malarvizhi', employeeCode: 'TN-914', designation: 'BRP', mobileNumber: '9498426408', dateOfBirth: '1980-05-08', password: 'password123', status: 'active' },
  { id: 40, name: 'A.Ummal Fazriya', employeeCode: 'TN-912', designation: 'BRP', mobileNumber: '9791447039', dateOfBirth: '1976-05-18', password: 'password123', status: 'active' },
  { id: 41, name: 'A.Velvizhi', employeeCode: 'TN-947', designation: 'BRP', mobileNumber: '9894961181', dateOfBirth: '1984-05-25', password: 'password123', status: 'active' },
  { id: 42, name: 'K.Jawahar', employeeCode: 'TN-935', designation: 'BRP', mobileNumber: '8072564524', dateOfBirth: '1966-11-14', password: 'password123', status: 'active' },
  { id: 43, name: 'D.Mani', employeeCode: 'TN-961', designation: 'BRP', mobileNumber: '9585387238', dateOfBirth: '1981-08-10', password: 'password123', status: 'active' },
  { id: 44, name: 'K.Suresh', employeeCode: 'TN-934', designation: 'BRP', mobileNumber: '9842289800', dateOfBirth: '1984-06-04', password: 'password123', status: 'active' },
  { id: 45, name: 'S.Vinothini', employeeCode: 'TN-1283', designation: 'BRP', mobileNumber: '9655446555', dateOfBirth: '1993-04-11', password: 'password123', status: 'active' },
  { id: 46, name: 'V.Jeyamoorthy', employeeCode: 'TN-911', designation: 'BRP', mobileNumber: '9976993814', dateOfBirth: '1978-07-26', password: 'password123', status: 'active' },
  { id: 47, name: 'G.Raghupathy', employeeCode: 'TN-827', designation: 'BRP', mobileNumber: '9944144121', dateOfBirth: '1982-12-16', password: 'password123', status: 'active' },
  { id: 48, name: 'D. Ramamurthy', employeeCode: 'TN-1294', designation: 'BRP', mobileNumber: '8778085545', dateOfBirth: '1978-05-09', password: 'password123', status: 'active' },
  { id: 49, name: 'J.Revathi', employeeCode: 'TN-954', designation: 'BRP', mobileNumber: '8148263839', dateOfBirth: '1978-06-05', password: 'password123', status: 'active' },
  { id: 50, name: 'K.Srila', employeeCode: 'TN-949', designation: 'BRP', mobileNumber: '9688407555', dateOfBirth: '1975-01-30', password: 'password123', status: 'active' },
  { id: 51, name: 'M.Mohan', employeeCode: 'TN-965', designation: 'BRP', mobileNumber: '9159695233', dateOfBirth: '1983-04-22', password: 'password123', status: 'active' },
  { id: 52, name: 'V.Kothainayaki', employeeCode: 'TN-952', designation: 'BRP', mobileNumber: '9095133882', dateOfBirth: '1975-03-20', password: 'password123', status: 'active' },
  { id: 53, name: 'C.Kumar', employeeCode: 'TN-978', designation: 'BRP', mobileNumber: '8838507206', dateOfBirth: '1978-06-07', password: 'password123', status: 'active' },
  { id: 54, name: 'G.Kalilur Rehman', employeeCode: 'TN-957', designation: 'BRP', mobileNumber: '8072267181', dateOfBirth: '1986-07-11', password: 'password123', status: 'active' },
  { id: 55, name: 'G.Syed shahid', employeeCode: 'TN-943', designation: 'BRP', mobileNumber: '8608786304', dateOfBirth: '1988-09-15', password: 'password123', status: 'active' },
  { id: 56, name: 'S.Sudakar', employeeCode: 'TN-955', designation: 'BRP', mobileNumber: '9976949976', dateOfBirth: '1979-08-06', password: 'password123', status: 'active' },
  { id: 57, name: 'S.Padma', employeeCode: 'TN-973', designation: 'BRP', mobileNumber: '9965870219', dateOfBirth: '1976-06-10', password: 'password123', status: 'active' },
  { id: 58, name: 'T.Sivaganasundari', employeeCode: 'TN-977', designation: 'BRP', mobileNumber: '9047895518', dateOfBirth: '1976-10-06', password: 'password123', status: 'active' },
  { id: 59, name: 'L.Karunaneedhi', employeeCode: 'TN-859', designation: 'BRP', mobileNumber: '8525904544', dateOfBirth: '1983-06-09', password: 'password123', status: 'active' },
  { id: 60, name: 'V.Sekar', employeeCode: 'TN-770', designation: 'BRP', mobileNumber: '9965138004', dateOfBirth: '1978-06-10', password: 'password123', status: 'active' },
  { id: 61, name: 'A.Paul Martin', employeeCode: 'TN-846', designation: 'BRP', mobileNumber: '9994647520', dateOfBirth: '1985-06-17', password: 'password123', status: 'active' },
  { id: 62, name: 'R.Kamala kannan', employeeCode: 'TN-1173', designation: 'BRP', mobileNumber: '7010323031', dateOfBirth: '1969-06-02', password: 'password123', status: 'active' },
  { id: 63, name: 'P.Tamilselvi', employeeCode: 'TN-1168', designation: 'BRP', mobileNumber: '9790327365', dateOfBirth: '1973-02-08', password: 'password123', status: 'active' },
  { id: 64, name: 'R.Sivagnanam', employeeCode: 'TN-1177', designation: 'BRP', mobileNumber: '9629719080', dateOfBirth: '1981-06-05', password: 'password123', status: 'active' },
  { id: 65, name: 'R.Pandian', employeeCode: 'TN-876', designation: 'BRP', mobileNumber: '8248104168', dateOfBirth: '1980-05-01', password: 'password123', status: 'active' },
  { id: 66, name: 'D.Krishna kumar', employeeCode: 'TN-1325', designation: 'BRP', mobileNumber: '9944882907', dateOfBirth: '1983-04-11', password: 'password123', status: 'active' },
  { id: 67, name: 'R.Anthony aruldass', employeeCode: 'TN-945', designation: 'BRP', mobileNumber: '9787658266', dateOfBirth: '1982-12-01', password: 'password123', status: 'active' },
  { id: 68, name: 'R.Danivel raj', employeeCode: 'TN-942', designation: 'BRP', mobileNumber: '9787646940', dateOfBirth: '1989-06-21', password: 'password123', status: 'active' },
  { id: 69, name: 'R.Joicemalar', employeeCode: 'TN-984', designation: 'BRP', mobileNumber: '6381642636', dateOfBirth: '1980-07-10', password: 'password123', status: 'active' },
  { id: 70, name: 'A.Elangovan', employeeCode: 'TN-988', designation: 'BRP', mobileNumber: '7339103840', dateOfBirth: '1973-02-05', password: 'password123', status: 'active' },
  { id: 71, name: 'N.Kothai', employeeCode: 'TN-983', designation: 'BRP', mobileNumber: '6380392133', dateOfBirth: '1970-06-27', password: 'password123', status: 'active' },
  { id: 72, name: 'Y. Philip', employeeCode: 'TN-996', designation: 'BRP', mobileNumber: '9487249836', dateOfBirth: '1973-06-30', password: 'password123', status: 'active' },
  { id: 73, name: 'S.Bavani', employeeCode: 'TN-1158', designation: 'BRP', mobileNumber: '8940876396', dateOfBirth: '1984-10-09', password: 'password123', status: 'active' },
  { id: 74, name: 'C. Arockiyammal', employeeCode: 'TN-995', designation: 'BRP', mobileNumber: '9486344853', dateOfBirth: '1978-02-15', password: 'password123', status: 'active' },
  { id: 75, name: 'V.Ranganathan', employeeCode: 'TN-724', designation: 'BRP', mobileNumber: '9688248815', dateOfBirth: '1981-06-21', password: 'password123', status: 'active' },
  { id: 76, name: 'B.Jothimurugan', employeeCode: 'TN-985', designation: 'BRP', mobileNumber: '9655602721', dateOfBirth: '1976-06-10', password: 'password123', status: 'active' },
  { id: 77, name: 'G.Suthanthiram', employeeCode: 'TN-705', designation: 'BRP', mobileNumber: '9994958390', dateOfBirth: '1975-06-19', password: 'password123', status: 'active' },
  { id: 78, name: 'K.Thangavelu', employeeCode: 'TN-726', designation: 'BRP', mobileNumber: '9842067212', dateOfBirth: '1969-06-25', password: 'password123', status: 'active' },
  { id: 79, name: 'C.Muthumanickam', employeeCode: 'TN-239', designation: 'BRP', mobileNumber: '6369832754', dateOfBirth: '1982-07-15', password: 'password123', status: 'active' },
  { id: 80, name: 'J.Sathiyaraj', employeeCode: 'TN-710', designation: 'BRP', mobileNumber: '9943953900', dateOfBirth: '1986-02-11', password: 'password123', status: 'active' },
  { id: 81, name: 'M.Mercy', employeeCode: 'TN-823', designation: 'BRP', mobileNumber: '8220063833', dateOfBirth: '1983-05-12', password: 'password123', status: 'active' },
  { id: 82, name: 'R.Nallathambi', employeeCode: 'TN-1179', designation: 'BRP', mobileNumber: '8973055194', dateOfBirth: '1974-05-10', password: 'password123', status: 'active' },
  { id: 83, name: 'A.Selvam', employeeCode: 'TN-829', designation: 'BRP', mobileNumber: '8754660330', dateOfBirth: '1984-05-10', password: 'password123', status: 'active' },
  { id: 84, name: 'C.Stalin', employeeCode: 'TN-98', designation: 'BRP', mobileNumber: '6380230139', dateOfBirth: '1970-05-02', password: 'password123', status: 'active' },
  { id: 85, name: 'T.Lakshmi', employeeCode: 'TN-905', designation: 'BRP', mobileNumber: '9751396655', dateOfBirth: '1977-09-05', password: 'password123', status: 'active' },
  { id: 86, name: 'S.Thirumurugan', employeeCode: 'TN-1314', designation: 'BRP', mobileNumber: '9952437295', dateOfBirth: '1985-03-10', password: 'password123', status: 'active' },
  { id: 87, name: 'P.Venkatesan', employeeCode: 'TN-889', designation: 'BRP', mobileNumber: '8220248808', dateOfBirth: '1982-03-01', password: 'password123', status: 'active' },
  { id: 88, name: 'A.Sivasankar', employeeCode: 'TN-877', designation: 'BRP', mobileNumber: '9159025186', dateOfBirth: '1981-05-31', password: 'password123', status: 'active' },
  { id: 89, name: 'D.Devendiran ^', employeeCode: 'TN-822', designation: 'BRP', mobileNumber: '9487320861', dateOfBirth: '1966-04-12', password: 'password123', status: 'active' },
  { id: 90, name: 'J.Prabu', employeeCode: 'TN-1203', designation: 'BRP', mobileNumber: '9345810502', dateOfBirth: '1981-07-30', password: 'password123', status: 'active' },
  { id: 91, name: 'D.Gayathiri', employeeCode: 'TN-900', designation: 'BRP', mobileNumber: '9944377954', dateOfBirth: '1983-03-23', password: 'password123', status: 'active' },
  { id: 92, name: 'S.Paripooranamarry', employeeCode: 'TN-852', designation: 'BRP', mobileNumber: '9444863059', dateOfBirth: '1969-04-05', password: 'password123', status: 'active' },
  { id: 93, name: 'V.Thirupathi', employeeCode: 'TN-205', designation: 'BRP', mobileNumber: '8489832203', dateOfBirth: '1977-05-30', password: 'password123', status: 'active' },
  { id: 94, name: 'R.Jayapal', employeeCode: 'TN-901', designation: 'BRP', mobileNumber: '9751570191', dateOfBirth: '1976-06-05', password: 'password123', status: 'active' },
  { id: 95, name: 'N.Ganesh ', employeeCode: 'TN-897', designation: 'BRP', mobileNumber: '9789735099', dateOfBirth: '1965-04-03', password: 'password123', status: 'active' },
  { id: 96, name: 'T.Rajinikanthan', employeeCode: 'TN-1197', designation: 'BRP', mobileNumber: '9843125659', dateOfBirth: '1977-01-06', password: 'password123', status: 'active' },
  { id: 97, name: 'R.Srinivasan', employeeCode: 'TN-784', designation: 'BRP', mobileNumber: '9566929829', dateOfBirth: '1985-03-23', password: 'password123', status: 'active' },
  { id: 98, name: 'G.Sampath', employeeCode: 'TN-898', designation: 'BRP', mobileNumber: '9944365324', dateOfBirth: '1973-03-20', password: 'password123', status: 'active' },
  { id: 99, name: 'S.Sangeetha', employeeCode: 'TN-903', designation: 'BRP', mobileNumber: '9786539541', dateOfBirth: '1982-05-20', password: 'password123', status: 'active' },
  { id: 100, name: 'S.Tamilselvi', employeeCode: 'TN-1184', designation: 'BRP', mobileNumber: '9442414539', dateOfBirth: '1975-05-01', password: 'password123', status: 'active' }
];
