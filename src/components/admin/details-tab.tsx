
'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { differenceInMonths, format } from 'date-fns';
import {
  Check,
  ChevronsUpDown,
  Edit,
  Search,
  Trash2,
  User as UserIcon,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { MOCK_PANCHAYATS } from '@/services/panchayats';
import { useUsers, ROLES } from '@/services/users';
import { useVRPs } from '@/services/vrp';

export function DetailsTab() {
    const { user } = useAuth();
    const { users, deleteUser } = useUsers();
    const { vrps, deleteVrp } = useVRPs();
    const router = useRouter();
    const { toast } = useToast();

    const [staffFilters, setStaffFilters] = useState({ search: '', role: 'all', district: 'all', employeeCodes: [] as string[] });
    const [vrpFilters, setVrpFilters] = useState({ search: '', district: 'all', locationType: 'all' });

    const canManageUsers = user && ['ADMIN', 'CREATOR', 'CONSULTANT'].includes(user.designation);
    
    const uniqueDistricts = useMemo(() => Array.from(new Set(MOCK_PANCHAYATS.map(p => p.district))).sort(), []);

    const filteredStaff = useMemo(() => {
        return users.filter(u => {
            const searchLower = staffFilters.search.toLowerCase();
            const roleMatch = staffFilters.role === 'all' || u.designation === staffFilters.role;
            const districtMatch = staffFilters.district === 'all' || u.district === staffFilters.district;
            const employeeMatch = staffFilters.employeeCodes.length === 0 || staffFilters.employeeCodes.includes(u.employeeCode);

            const searchMatch = !staffFilters.search ? true : (
                u.name.toLowerCase().includes(searchLower) ||
                u.employeeCode.toLowerCase().includes(searchLower) ||
                u.mobileNumber.includes(searchLower) ||
                (u.email || '').toLowerCase().includes(searchLower)
            );
            
            return roleMatch && districtMatch && employeeMatch && searchMatch;
        });
    }, [users, staffFilters]);
    
    const filteredVrps = useMemo(() => {
        return vrps.filter(vrp => {
            const searchLower = vrpFilters.search.toLowerCase();
            const districtMatch = vrpFilters.district === 'all' || vrp.district === vrpFilters.district;
            const locationMatch = vrpFilters.locationType === 'all' || (vrp.hasEmployeeCode === 'no' && vrp.locationType === vrpFilters.locationType);

            const searchMatch = !vrpFilters.search ? true : (
                vrp.name.toLowerCase().includes(searchLower) ||
                vrp.employeeCode.toLowerCase().includes(searchLower) ||
                vrp.contactNumber1.includes(searchLower) ||
                vrp.pfmsId.toLowerCase().includes(searchLower)
            );
            
            return districtMatch && locationMatch && searchMatch;
        });
    }, [vrps, vrpFilters]);
    
    const calculateExperience = (experience: any[]) => {
      if (!experience || experience.length === 0) return 'N/A';
      let totalMonths = 0;
      experience.forEach(exp => {
        const fromDate = new Date(exp.fromDate);
        const toDate = new Date(exp.toDate);
        totalMonths += differenceInMonths(toDate, fromDate);
      });
      const years = Math.floor(totalMonths / 12);
      const months = totalMonths % 12;
      return `${years} years, ${months} months`;
    };

    const handleDeleteUser = (userId: number) => {
        deleteUser(userId);
        toast({ title: 'User Deleted', description: 'The user has been successfully deleted.' });
    };

    return (
        <Tabs defaultValue="staff-details">
            <TabsList>
                <TabsTrigger value="staff-details">Staff Details</TabsTrigger>
                <TabsTrigger value="vrp-details">VRP</TabsTrigger>
            </TabsList>
            <TabsContent value="staff-details" className="pt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Staff Details</CardTitle>
                        <CardDescription>Manage and view registered staff members.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 p-4 border rounded-lg">
                            <div className="relative lg:col-span-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input placeholder="Search by Name, Contact, Email..." className="pl-10" value={staffFilters.search || ''} onChange={e => setStaffFilters(f => ({ ...f, search: e.target.value }))} />
                            </div>
                            <Select value={staffFilters.role} onValueChange={v => setStaffFilters(f => ({ ...f, role: v }))}>
                                <SelectTrigger><SelectValue placeholder="All Roles" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select value={staffFilters.district} onValueChange={v => setStaffFilters(f => ({ ...f, district: v }))}>
                                <SelectTrigger><SelectValue placeholder="All Districts" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Districts</SelectItem>
                                    {uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="justify-between">
                                        {staffFilters.employeeCodes.length > 0 ? `${staffFilters.employeeCodes.length} codes selected` : "Select Employee Code..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search Employee Code..." />
                                        <CommandEmpty>No employee found.</CommandEmpty>
                                        <CommandList>
                                            {users.map((u) => (
                                                <CommandItem
                                                    key={u.employeeCode}
                                                    value={u.employeeCode}
                                                    onSelect={() => {
                                                        setStaffFilters(f => {
                                                            const codes = f.employeeCodes;
                                                            const index = codes.indexOf(u.employeeCode);
                                                            if (index > -1) {
                                                                codes.splice(index, 1);
                                                            } else {
                                                                codes.push(u.employeeCode);
                                                            }
                                                            return { ...f, employeeCodes: [...codes] };
                                                        })
                                                    }}
                                                >
                                                    <Check className={cn("mr-2 h-4 w-4", staffFilters.employeeCodes.includes(u.employeeCode) ? "opacity-100" : "opacity-0")} />
                                                    {u.employeeCode}
                                                </CommandItem>
                                            ))}
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="w-full overflow-x-auto relative">
                            <Table className="min-w-max">
                                <TableHeader className="sticky top-0 bg-background z-20">
                                    <TableRow>
                                        <TableHead colSpan={6} className="text-center border-r">Basic Information</TableHead>
                                        <TableHead colSpan={4} className="text-center border-r">Location Details</TableHead>
                                        <TableHead colSpan={3} className="text-center border-r">Family Details</TableHead>
                                        <TableHead colSpan={7} className="text-center border-r">Personal Details</TableHead>
                                        <TableHead colSpan={11} className="text-center border-r">Personal Info</TableHead>
                                        <TableHead colSpan={3} className="text-center border-r">Education &amp; Experience</TableHead>
                                        <TableHead colSpan={4} className="text-center border-r">Working Details</TableHead>
                                        <TableHead colSpan={8} className="text-center border-r">Training &amp; Pilot Audit</TableHead>
                                        <TableHead className="text-center">Actions</TableHead>
                                    </TableRow>
                                    <TableRow>
                                        <TableHead className="sticky left-0 bg-background z-10">S.No</TableHead>
                                        <TableHead className="sticky left-12 bg-background z-10">Name</TableHead>
                                        <TableHead>Photo</TableHead>
                                        <TableHead>Recruitment Type</TableHead>
                                        <TableHead>Employee Code</TableHead>
                                        <TableHead>Contact No</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>District/Block/Urban</TableHead>
                                        <TableHead>Address</TableHead>
                                        <TableHead>Pincode</TableHead>
                                        <TableHead>Father's Name</TableHead>
                                        <TableHead>Mother's Name</TableHead>
                                        <TableHead>Spouse's Name</TableHead>
                                        <TableHead>Religion</TableHead>
                                        <TableHead>Caste</TableHead>
                                        <TableHead>DOB</TableHead>
                                        <TableHead>Age</TableHead>
                                        <TableHead>Gender</TableHead>
                                        <TableHead>Differently Abled</TableHead>
                                        <TableHead>Health Issues</TableHead>
                                        <TableHead>Contact 2</TableHead>
                                        <TableHead>Email ID</TableHead>
                                        <TableHead>E-Portal Email</TableHead>
                                        <TableHead>PFMS ID</TableHead>
                                        <TableHead>Bank</TableHead>
                                        <TableHead>Branch</TableHead>
                                        <TableHead>Account No</TableHead>
                                        <TableHead>IFSC</TableHead>
                                        <TableHead>Aadhaar</TableHead>
                                        <TableHead>PAN</TableHead>
                                        <TableHead>UAN</TableHead>
                                        <TableHead>Qualification</TableHead>
                                        <TableHead>Experience</TableHead>
                                        <TableHead>Skills</TableHead>
                                        <TableHead>Joining Date</TableHead>
                                        <TableHead>Worked Duration</TableHead>
                                        <TableHead>Present Duration</TableHead>
                                        <TableHead>DRP I/C</TableHead>
                                        <TableHead>Training Taken</TableHead>
                                        <TableHead>Training Name</TableHead>
                                        <TableHead>Training Given</TableHead>
                                        <TableHead>Training Name</TableHead>
                                        <TableHead>Pilot Audit</TableHead>
                                        <TableHead>Scheme Name</TableHead>
                                        <TableHead>State Office</TableHead>
                                        <TableHead>Work Particulars</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStaff.map((staff, index) => {
                                        const lastCourse = staff.academicDetails?.[staff.academicDetails.length - 1]?.course || 'N/A';
                                        const totalExperience = calculateExperience(staff.workExperience || []);
                                        const skills = staff.skills?.map(s => s.skill).join(', ') || 'N/A';
                                        const presentStation = staff.designation === 'BRP'
                                            ? staff.brpWorkHistory?.find(h => h.station === 'present')
                                            : staff.designation === 'DRP' || staff.designation === 'DRP I/C'
                                            ? staff.drpWorkHistory?.find(h => h.station === 'present')
                                            : null;

                                        return (
                                        <TableRow key={staff.id}>
                                            <TableCell className="sticky left-0 bg-background z-10">{index + 1}</TableCell>
                                            <TableCell className="font-medium sticky left-12 bg-background z-10">{staff.name}</TableCell>
                                            <TableCell><Avatar className="h-10 w-10"><AvatarImage src={staff.profilePicture || undefined} alt={staff.name} /><AvatarFallback><UserIcon /></AvatarFallback></Avatar></TableCell>
                                            <TableCell>{staff.recruitmentType}</TableCell>
                                            <TableCell>{staff.employeeCode}</TableCell>
                                            <TableCell>{staff.mobileNumber}</TableCell>
                                            <TableCell>{staff.locationType}</TableCell>
                                            <TableCell>{staff.locationType === 'rural' ? `${staff.district}, ${staff.block}, ${staff.panchayatName}` : `${staff.district}, ${staff.urbanBodyType}, ${staff.urbanBodyName}`}</TableCell>
                                            <TableCell>{staff.fullAddress}</TableCell>
                                            <TableCell>{staff.pincode}</TableCell>
                                            <TableCell>{staff.fatherName}</TableCell>
                                            <TableCell>{staff.motherName}</TableCell>
                                            <TableCell>{staff.spouseName}</TableCell>
                                            <TableCell>{staff.religion}</TableCell>
                                            <TableCell>{staff.caste}</TableCell>
                                            <TableCell>{staff.dateOfBirth ? format(new Date(staff.dateOfBirth), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                                            <TableCell>{staff.age}</TableCell>
                                            <TableCell>{staff.gender} {staff.gender === 'female' && staff.femaleType ? `(${staff.femaleType})` : ''}</TableCell>
                                            <TableCell>{staff.isDifferentlyAbled}</TableCell>
                                            <TableCell>{staff.healthIssues}</TableCell>
                                            <TableCell>{staff.contactNumber2}</TableCell>
                                            <TableCell>{staff.emailId}</TableCell>
                                            <TableCell>{staff.eportalEmailId}</TableCell>
                                            <TableCell>{staff.pfmsId}</TableCell>
                                            <TableCell>{staff.bankName}</TableCell>
                                            <TableCell>{staff.branchName}</TableCell>
                                            <TableCell>{staff.accountNumber}</TableCell>
                                            <TableCell>{staff.ifscCode}</TableCell>
                                            <TableCell>{staff.aadhaar}</TableCell>
                                            <TableCell>{staff.pan}</TableCell>
                                            <TableCell>{staff.uan}</TableCell>
                                            <TableCell>{lastCourse}</TableCell>
                                            <TableCell>{totalExperience}</TableCell>
                                            <TableCell>{skills}</TableCell>
                                            <TableCell>{staff.joiningDate ? format(new Date(staff.joiningDate), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                                            <TableCell>{/* Worked Duration - Placeholder */}</TableCell>
                                            <TableCell>{presentStation ? calculateExperience([presentStation]) : 'N/A'}</TableCell>
                                            <TableCell>{staff.workedAsDrpIc}</TableCell>
                                            <TableCell>{staff.trainingTaken}</TableCell>
                                            <TableCell>{staff.trainingTakenDetails?.[0]?.trainingName || 'N/A'}</TableCell>
                                            <TableCell>{staff.trainingGiven}</TableCell>
                                            <TableCell>{staff.trainingGivenDetails?.[0]?.trainingName || 'N/A'}</TableCell>
                                            <TableCell>{staff.pilotAudit}</TableCell>
                                            <TableCell>{staff.pilotAuditDetails?.[0]?.schemeName || 'N/A'}</TableCell>
                                            <TableCell>{staff.stateOfficeActivities}</TableCell>
                                            <TableCell>{staff.stateOfficeActivitiesDetails?.[0]?.workParticulars || 'N/A'}</TableCell>
                                            <TableCell className="space-x-2">
                                                <Button variant="outline" size="sm" onClick={() => router.push(`/registration/staff?edit=${staff.employeeCode}`)}><Edit className="h-4 w-4" /></Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild><Button variant="destructive" size="sm" disabled={!canManageUsers}><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>This will permanently delete the staff record for {staff.name}.</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteUser(staff.id)}>Continue</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    )})}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="vrp-details">
                <Card>
                    <CardHeader>
                        <CardTitle>VRP Details</CardTitle>
                        <CardDescription>Manage and view registered Village Resource Persons.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <Input placeholder="Search by Name, Code, PFMS, Contact..." value={vrpFilters.search || ''} onChange={e => setVrpFilters(f => ({ ...f, search: e.target.value }))} />
                            <Select value={vrpFilters.district} onValueChange={v => setVrpFilters(f => ({ ...f, district: v }))}>
                                <SelectTrigger><SelectValue placeholder="All Districts" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Districts</SelectItem>
                                    {uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select value={vrpFilters.locationType} onValueChange={v => setVrpFilters(f => ({ ...f, locationType: v }))}>
                                <SelectTrigger><SelectValue placeholder="All Locations" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Locations</SelectItem>
                                    <SelectItem value="rural">Rural</SelectItem>
                                    <SelectItem value="urban">Urban</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full overflow-x-auto relative">
                            <Table className="min-w-max">
                                <TableHeader className="sticky top-0 bg-background z-10">
                                    <TableRow>
                                        <TableHead>S.No</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Has Emp Code?</TableHead>
                                        <TableHead>Employee Code</TableHead>
                                        <TableHead>Scheme</TableHead>
                                        <TableHead>Job Card</TableHead>
                                        <TableHead>Location Type</TableHead>
                                        <TableHead>District</TableHead>
                                        <TableHead>Block</TableHead>
                                        <TableHead>Panchayat</TableHead>
                                        <TableHead>Urban Body</TableHead>
                                        <TableHead>Address</TableHead>
                                        <TableHead>Pincode</TableHead>
                                        <TableHead>Contact 1</TableHead>
                                        <TableHead>Contact 2</TableHead>
                                        <TableHead>Father/Husband</TableHead>
                                        <TableHead>Caste</TableHead>
                                        <TableHead>DOB</TableHead>
                                        <TableHead>Age</TableHead>
                                        <TableHead>Gender</TableHead>
                                        <TableHead>Qualification</TableHead>
                                        <TableHead>PFMS ID</TableHead>
                                        <TableHead>Bank</TableHead>
                                        <TableHead>Branch</TableHead>
                                        <TableHead>Account No</TableHead>
                                        <TableHead>IFSC</TableHead>
                                        <TableHead>Aadhaar</TableHead>
                                        <TableHead>PAN</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredVrps.map((vrp, index) => (
                                        <TableRow key={vrp.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="font-medium">{vrp.name}</TableCell>
                                            <TableCell>{vrp.role}</TableCell>
                                            <TableCell>{vrp.hasEmployeeCode}</TableCell>
                                            <TableCell>{vrp.employeeCode}</TableCell>
                                            <TableCell>{vrp.hasEmployeeCode === 'no' ? vrp.scheme : 'MGNREGS'}</TableCell>
                                            <TableCell>{vrp.hasEmployeeCode === 'yes' ? vrp.mgnregaJobCard : 'N/A'}</TableCell>
                                            <TableCell>{vrp.hasEmployeeCode === 'no' ? vrp.locationType : 'rural'}</TableCell>
                                            <TableCell>{vrp.district}</TableCell>
                                            <TableCell>{vrp.block}</TableCell>
                                            <TableCell>{vrp.panchayatName}</TableCell>
                                            <TableCell>{vrp.hasEmployeeCode === 'no' && vrp.locationType === 'urban' ? `${vrp.urbanBodyType} - ${vrp.urbanBodyName}` : 'N/A'}</TableCell>
                                            <TableCell>{vrp.address}</TableCell>
                                            <TableCell>{vrp.pincode}</TableCell>
                                            <TableCell>{vrp.contactNumber1}</TableCell>
                                            <TableCell>{vrp.contactNumber2}</TableCell>
                                            <TableCell>{vrp.familyRelation}: {vrp.familyName}</TableCell>
                                            <TableCell>{vrp.caste}</TableCell>
                                            <TableCell>{format(new Date(vrp.dob), 'dd/MM/yyyy')}</TableCell>
                                            <TableCell>{vrp.age}</TableCell>
                                            <TableCell>{vrp.gender}</TableCell>
                                            <TableCell>{vrp.qualification}</TableCell>
                                            <TableCell>{vrp.pfmsId}</TableCell>
                                            <TableCell>{vrp.bankName}</TableCell>
                                            <TableCell>{vrp.branchName}</TableCell>
                                            <TableCell>{vrp.accountNumber}</TableCell>
                                            <TableCell>{vrp.ifscCode}</TableCell>
                                            <TableCell>{vrp.aadhaar}</TableCell>
                                            <TableCell>{vrp.pan}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="outline" size="sm" onClick={() => { /* handle edit */ }}>Edit</Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" size="sm" disabled={!canManageUsers}>Delete</Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>This will permanently delete the VRP record.</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => deleteVrp(vrp.id)}>Continue</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
