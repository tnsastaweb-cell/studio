'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, differenceInYears, differenceInMonths, differenceInDays, parseISO } from 'date-fns';
import { CalendarIcon, Upload, ChevronsUpDown, Check, X, PlusCircle, Trash2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { cn } from "@/lib/utils";
import { useAuth } from '@/hooks/use-auth';
import { useUsers, ROLES, User as StaffUser } from '@/services/users';
import { useToast } from '@/hooks/use-toast';
import { MOCK_PANCHAYATS, Panchayat } from '@/services/panchayats';
import { MOCK_ULBS, UrbanLocalBody, ULB_TYPES } from '@/services/ulb';
import { uniqueDistricts } from '@/lib/utils';
import { MOCK_SCHEMES } from '@/services/schemes';


import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

const complaintSchema = z.object({
  receivedOn: z.date(),
  complainantDetails: z.string().optional(),
  complaint: z.string().optional(),
  remarks: z.string().optional(),
  actionTaken: z.string().optional(),
});

const staffFormSchema = z.object({
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
  urbanBodyType: z.enum(ULB_TYPES).optional(),
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

  // Training & Audit Particulars
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

  complaints: z.array(complaintSchema).optional(),
  
  declaration: z.boolean().refine(val => val === true, {
    message: "You must accept the declaration to submit."
  }),

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


type StaffFormValues = z.infer<typeof staffFormSchema>;

const allowedRoles: StaffUser['designation'][] = ['AO', 'SS', 'AAO', 'SLM', 'ADMIN', 'MIS ASSISTANT', 'DRP', 'BRP'];

export default function StaffRegistrationPage() {
    const { user, loading: authLoading } = useAuth();
    const { users, updateUser: updateUserService, addUser: addUserService } = useUsers();
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const editEmployeeCode = searchParams.get('edit');

    const [isEditMode, setIsEditMode] = useState(!!editEmployeeCode);
    const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
    
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const form = useForm<StaffFormValues>({
        resolver: zodResolver(staffFormSchema),
        defaultValues: {
          designation: '',
          recruitmentType: undefined,
          employeeCode: '',
          name: '',
          contactNumber: '',
          photo: undefined,
          locationType: undefined,
          district: '',
          block: '',
          panchayat: '',
          lgdCode: '',
          urbanBodyType: undefined,
          urbanBodyName: '',
          fullAddress: '',
          pincode: '',
          fatherName: '',
          motherName: '',
          spouseName: '',
          religion: '',
          caste: '',
          dateOfBirth: undefined,
          age: '',
          gender: '',
          femaleType: 'none',
          bloodGroup: '',
          isDifferentlyAbled: undefined,
          healthIssues: undefined,
          healthIssuesDetails: '',
          differentlyAbledCert: undefined,
          medicalCert: undefined,
          contactNumber2: '',
          emailId: '',
          eportalEmailId: '',
          pfmsId: '',
          bankName: '',
          branchName: '',
          accountNumber: '',
          ifscCode: '',
          aadhaar: '',
          aadhaarUpload: undefined,
          pan: '',
          panUpload: undefined,
          uan: '',
          academicDetails: [],
          workExperience: [],
          skills: [],
          joiningDate: undefined,
          brpWorkHistory: [],
          drpWorkHistory: [],
          workedAsDrpIc: 'no',
          drpIcWorkHistory: [],
          trainingTaken: 'no',
          trainingTakenDetails: [],
          trainingGiven: 'no',
          trainingGivenDetails: [],
          pilotAudit: 'no',
          pilotAuditDetails: [],
          stateOfficeActivities: 'no',
          stateOfficeActivitiesDetails: [],
          complaints: [],
          declaration: false,
        }
    });

    useEffect(() => {
        if (editEmployeeCode) {
            const userToEdit = users.find(u => u.employeeCode === editEmployeeCode);
            if (userToEdit) {
                setEditingUser(userToEdit);
                setIsEditMode(true);
                setSelectedRole(userToEdit.designation);

                const dateFieldsToConvert = ['dateOfBirth', 'joiningDate'];
                const arrayFieldsToConvert = ['academicDetails', 'workExperience', 'brpWorkHistory', 'drpWorkHistory', 'drpIcWorkHistory', 'trainingTakenDetails', 'trainingGivenDetails', 'pilotAuditDetails', 'stateOfficeActivitiesDetails', 'complaints'];

                let formData: any = {...userToEdit};

                dateFieldsToConvert.forEach(field => {
                    if (formData[field]) {
                        formData[field] = parseISO(formData[field]);
                    }
                });

                arrayFieldsToConvert.forEach(arrayField => {
                    if (formData[arrayField] && Array.isArray(formData[arrayField])) {
                        formData[arrayField] = formData[arrayField].map((item: any) => {
                             let newItem: any = {...item};
                             Object.keys(item).forEach(key => {
                                 if (key.toLowerCase().includes('date') && item[key]) {
                                     newItem[key] = parseISO(item[key]);
                                 }
                             });
                             return newItem;
                        });
                    }
                });

                form.reset(formData);
                setPhotoPreview(userToEdit.profilePicture || null);
            }
        }
    }, [editEmployeeCode, users, form]);
    
    const watchedLocationType = form.watch("locationType");
    const watchedDistrict = form.watch("district");
    const watchedBlock = form.watch("block");
    const watchedPanchayat = form.watch("panchayat");
    const watchedUrbanBodyType = form.watch("urbanBodyType");
    const watchedDob = form.watch("dateOfBirth");
    const watchedGender = form.watch("gender");
    const watchedDifferentlyAbled = form.watch("isDifferentlyAbled");
    const watchedHealthIssues = form.watch("healthIssues");
    const watchedWorkedAsDrpIc = form.watch("workedAsDrpIc");
    const watchedTrainingTaken = form.watch("trainingTaken");
    const watchedTrainingGiven = form.watch("trainingGiven");
    const watchedPilotAudit = form.watch("pilotAudit");
    const watchedStateOfficeActivities = form.watch("stateOfficeActivities");

    
    const { fields: academicFields, append: appendAcademic, remove: removeAcademic } = useFieldArray({ control: form.control, name: "academicDetails" });
    const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({ control: form.control, name: "workExperience" });
    const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({ control: form.control, name: "skills" });
    const { fields: brpWorkFields, append: appendBrpWork, remove: removeBrpWork } = useFieldArray({ control: form.control, name: "brpWorkHistory" });
    const { fields: drpWorkFields, append: appendDrpWork, remove: removeDrpWork } = useFieldArray({ control: form.control, name: "drpWorkHistory" });
    const { fields: drpIcWorkFields, append: appendDrpIcWork, remove: removeDrpIcWork } = useFieldArray({ control: form.control, name: "drpIcWorkHistory" });
    const { fields: complaintFields, append: appendComplaint, remove: removeComplaint } = useFieldArray({ control: form.control, name: "complaints" });

    const { fields: trainingTakenFields, append: appendTrainingTaken, remove: removeTrainingTaken } = useFieldArray({ control: form.control, name: 'trainingTakenDetails' });
    const { fields: trainingGivenFields, append: appendTrainingGiven, remove: removeTrainingGiven } = useFieldArray({ control: form.control, name: 'trainingGivenDetails' });
    const { fields: pilotAuditFields, append: appendPilotAudit, remove: removePilotAudit } = useFieldArray({ control: form.control, name: 'pilotAuditDetails' });
    const { fields: stateOfficeFields, append: appendStateOffice, remove: removeStateOffice } = useFieldArray({ control: form.control, name: 'stateOfficeActivitiesDetails' });



    const blocksForDistrict = useMemo(() => {
        if (!watchedDistrict) return [];
        return Array.from(new Set(MOCK_PANCHAYATS.filter(p => p.district === watchedDistrict).map(p => p.block))).sort();
    }, [watchedDistrict]);

    const panchayatsForBlock = useMemo(() => {
        if (!watchedBlock) return [];
        return MOCK_PANCHAYATS.filter(p => p.block === watchedBlock).sort((a, b) => a.name.localeCompare(b.name));
    }, [watchedBlock]);
    
    const urbanBodiesForDistrictAndType = useMemo(() => {
        if(!watchedDistrict || !watchedUrbanBodyType) return [];
        return MOCK_ULBS.filter(u => u.district === watchedDistrict && u.type === watchedUrbanBodyType).sort((a,b) => a.name.localeCompare(b.name));
    }, [watchedDistrict, watchedUrbanBodyType]);

    useEffect(() => {
        if (watchedDistrict) {
            form.setValue("block", "");
            form.setValue("panchayat", "");
            form.setValue("urbanBodyName", "");
        }
    }, [watchedDistrict, form]);

    useEffect(() => {
        if (watchedBlock) {
           form.setValue("panchayat", "");
        }
    }, [watchedBlock, form]);
    
     useEffect(() => {
        if(watchedPanchayat){
            const lgdCode = MOCK_PANCHAYATS.find(p => p.lgdCode === watchedPanchayat)?.lgdCode || '';
            form.setValue('lgdCode', lgdCode);
        } else {
            form.setValue('lgdCode', '');
        }
    }, [watchedPanchayat, form]);

    useEffect(() => {
        if (watchedUrbanBodyType) {
            form.setValue("urbanBodyName", "");
        }
    }, [watchedUrbanBodyType, form]);

     useEffect(() => {
        if (watchedDob) {
            const age = differenceInYears(new Date(), watchedDob);
            form.setValue('age', age.toString());
        }
    }, [watchedDob, form]);


    const handleRoleChange = (value: string) => {
        if (!isEditMode) {
            setSelectedRole(value);
            form.reset(); // Reset form when role changes, but not in edit mode
            form.setValue('designation', value);
        }
    };

    const handleEmployeeCodeChange = (employeeCode: string) => {
        if(isEditMode) return;
        const selectedUser = users.find(u => u.employeeCode === employeeCode);
        if (selectedUser) {
            form.setValue('employeeCode', selectedUser.employeeCode);
            form.setValue('name', selectedUser.name);
            form.setValue('contactNumber', selectedUser.mobileNumber);
        }
    };
    
    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast({
                    variant: 'destructive',
                    title: "File too large",
                    description: "Photo size must not exceed 5MB."
                });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
                form.setValue('photo', file);
            };
            reader.readAsDataURL(file);
        }
    };

    const filteredUsersByRole = useMemo(() => {
        if (!selectedRole) return [];
        return users.filter(u => u.designation === selectedRole);
    }, [selectedRole, users]);

    const onSubmit = (data: StaffFormValues) => {
        console.log("Saving section:", data);
        toast({
            title: "Form Section Saved!",
            description: "Your details have been saved for this section.",
        });
    };

    const onFinalSubmit = (data: StaffFormValues) => {
        console.log("Final Submit:", data);

        const finalData = { ...data };
        // Convert date objects back to strings before saving
        finalData.dateOfBirth = format(data.dateOfBirth, 'yyyy-MM-dd');
        finalData.joiningDate = format(data.joiningDate, 'yyyy-MM-dd');
        // TODO: Handle file uploads and convert other dates in arrays

        if (isEditMode && editingUser) {
            updateUserService({ ...editingUser, ...finalData });
             toast({
                title: "Registration Updated!",
                description: "The staff details have been successfully updated.",
            });
        } else {
             // addUserService(finalData); This will be for new registration.
             toast({
                title: "Registration Submitted!",
                description: "Your registration has been submitted for review.",
            });
        }
       
        router.push('/admin'); // Redirect to admin panel after submit
    };

    const canViewAndEditComplaints = user && ['ADMIN', 'CREATOR', 'CONSULTANT'].includes(user.designation);

    const tabsConfig = [
        { value: "basic-info", label: "Basic Information", roles: ['all'] },
        { value: "location-details", label: "Location Details", roles: ['all'] },
        { value: "family-details", label: "Family Details", roles: ['all'] },
        { value: "personal-details", label: "Personal Details", roles: ['all'] },
        { value: "personal-info", label: "Personal Info", roles: ['all'] },
        { value: "education-experience", label: "Education & Experience", roles: ['all'] },
        { value: "working-details", label: "Working details", roles: ['BRP', 'DRP', 'DRP I/C'] },
        { value: "training-audit", label: "Training & pilot Audit Particulars", roles: ['BRP', 'DRP', 'DRP I/C'] },
        { value: "complaints", label: "Complaints", roles: ['BRP', 'DRP', 'DRP I/C'], adminOnly: true },
    ];

    const visibleTabs = selectedRole 
        ? tabsConfig.filter(tab => {
            const roleMatch = tab.roles.includes('all') || tab.roles.includes(selectedRole);
            const adminMatch = !tab.adminOnly || canViewAndEditComplaints;
            return roleMatch && adminMatch;
        })
        : [];
        
    const calculateDuration = (from: Date | undefined, to: Date | undefined) => {
      if (!from || !to) return '';
      const years = differenceInYears(to, from);
      const months = differenceInMonths(to, from) % 12;
      return `${years} years, ${months} months`;
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <MainNavigation />
            <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>{isEditMode ? 'Edit Staff Details' : 'Staff Registration'}</CardTitle>
                        <CardDescription>
                             {isEditMode ? `Editing details for ${editingUser?.name}` : 'Please select a role to begin the registration process. The form will adapt based on the selected role.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onFinalSubmit)} className="space-y-8">
                                {!isEditMode && (
                                    <FormField
                                        control={form.control}
                                        name="designation"
                                        render={({ field }) => (
                                            <FormItem className="max-w-md">
                                                <FormLabel>Role/Designation</FormLabel>
                                                <Select onValueChange={(value) => {
                                                    field.onChange(value);
                                                    handleRoleChange(value);
                                                }} value={field.value || ''} disabled={isEditMode}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a role" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {allowedRoles.map(role => (
                                                            <SelectItem key={role} value={role}>{role}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {selectedRole && (
                                    <Tabs defaultValue={visibleTabs[0].value} className="w-full pt-4">
                                        <TabsList className="grid w-full h-auto" style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, minmax(0, 1fr))`}}>
                                            {visibleTabs.map(tab => (
                                                <TabsTrigger key={tab.value} value={tab.value} className="text-xs break-words h-full py-2 whitespace-normal">
                                                    {tab.label}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                        
                                        <TabsContent value="basic-info">
                                            <Card>
                                                <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
                                                <CardContent className="space-y-6 pt-6">
                                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                      <FormField
                                                          control={form.control}
                                                          name="photo"
                                                          render={({ field }) => (
                                                              <FormItem>
                                                                  <FormLabel>Photo Upload* (Max 5MB)</FormLabel>
                                                                  <div className="flex items-center gap-4">
                                                                       <Avatar className="h-24 w-24 border">
                                                                          <AvatarImage src={photoPreview || undefined} />
                                                                          <AvatarFallback><Upload /></AvatarFallback>
                                                                      </Avatar>
                                                                      <FormControl>
                                                                           <Input type="file" accept="image/*" onChange={(e) => {
                                                                              field.onChange(e.target.files?.[0]);
                                                                              handlePhotoUpload(e);
                                                                          }} />
                                                                      </FormControl>
                                                                  </div>
                                                                  <FormMessage />
                                                              </FormItem>
                                                          )}
                                                      />
                                                       <FormField
                                                          control={form.control}
                                                          name="recruitmentType"
                                                          render={({ field }) => (
                                                              <FormItem>
                                                                  <FormLabel>Recruitment Type*</FormLabel>
                                                                  <Select onValueChange={field.onChange} value={field.value}>
                                                                      <FormControl><SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger></FormControl>
                                                                      <SelectContent>
                                                                          <SelectItem value="direct">Direct</SelectItem>
                                                                          <SelectItem value="retired">Retired</SelectItem>
                                                                      </SelectContent>
                                                                  </Select>
                                                                  <FormMessage />
                                                              </FormItem>
                                                          )}
                                                      />
                                                   </div>
                                                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                     <FormField
                                                        control={form.control}
                                                        name="employeeCode"
                                                        render={({ field }) => (
                                                            <FormItem className="flex flex-col">
                                                                <FormLabel>Employee Code*</FormLabel>
                                                                 <FormControl>
                                                                    <Input {...field} readOnly={isEditMode} className={cn(isEditMode ? "bg-muted" : "")}/>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                      <FormField control={form.control} name="name" render={({ field }) => (
                                                          <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                      )} />
                                                       <FormField control={form.control} name="contactNumber" render={({ field }) => (
                                                          <FormItem><FormLabel>Contact Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                      )} />
                                                   </div>
                                                   <div className="flex justify-end">
                                                       <Button type="button" onClick={form.handleSubmit(onSubmit)}>Save</Button>
                                                   </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>
                                         <TabsContent value="location-details">
                                            <Card>
                                                 <CardHeader><CardTitle>Location Details</CardTitle></CardHeader>
                                                 <CardContent className="space-y-6 pt-6">
                                                     <FormField control={form.control} name="locationType" render={({ field }) => (
                                                        <FormItem className="space-y-3">
                                                            <FormLabel>Type*</FormLabel>
                                                            <FormControl>
                                                                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                                                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="rural" /></FormControl><FormLabel className="font-normal">Rural</FormLabel></FormItem>
                                                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="urban" /></FormControl><FormLabel className="font-normal">Urban</FormLabel></FormItem>
                                                                </RadioGroup>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                     )} />

                                                    {watchedLocationType === 'rural' && (
                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                            <FormField control={form.control} name="district" render={({ field }) => (
                                                                <FormItem><FormLabel>District*</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value ?? ""}><FormControl><SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger></FormControl>
                                                                    <SelectContent>{uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                                                </Select><FormMessage /></FormItem>
                                                            )} />
                                                            <FormField control={form.control} name="block" render={({ field }) => (
                                                                <FormItem><FormLabel>Block*</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value || ""} disabled={!watchedDistrict}><FormControl><SelectTrigger><SelectValue placeholder="Select Block" /></SelectTrigger></FormControl>
                                                                    <SelectContent>{blocksForDistrict.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                                                                </Select><FormMessage /></FormItem>
                                                            )} />
                                                             <FormField control={form.control} name="panchayat" render={({ field }) => (
                                                                <FormItem><FormLabel>Panchayat*</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value || ""} disabled={!watchedBlock}><FormControl><SelectTrigger><SelectValue placeholder="Select Panchayat" /></SelectTrigger></FormControl>
                                                                    <SelectContent>{panchayatsForBlock.map(p => <SelectItem key={p.lgdCode} value={p.lgdCode}>{p.name}</SelectItem>)}</SelectContent>
                                                                </Select><FormMessage /></FormItem>
                                                            )} />
                                                            <FormField control={form.control} name="lgdCode" render={({ field }) => (
                                                                <FormItem><FormLabel>LGD Code</FormLabel><FormControl><Input {...field} readOnly className="bg-muted" /></FormControl><FormMessage /></FormItem>
                                                            )} />
                                                        </div>
                                                    )}
                                                     {watchedLocationType === 'urban' && (
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                            <FormField control={form.control} name="district" render={({ field }) => (
                                                                <FormItem><FormLabel>District*</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value ?? ""}><FormControl><SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger></FormControl>
                                                                    <SelectContent>{uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                                                </Select><FormMessage /></FormItem>
                                                            )} />
                                                            <FormField control={form.control} name="urbanBodyType" render={({ field }) => (
                                                                <FormItem><FormLabel>Urban Body Type*</FormLabel>
                                                                    <Select onValueChange={field.onChange} value={field.value} disabled={!watchedDistrict}><FormControl><SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger></FormControl>
                                                                        <SelectContent>{ULB_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                                                                    </Select><FormMessage /></FormItem>
                                                            )} />
                                                            <FormField control={form.control} name="urbanBodyName" render={({ field }) => (
                                                                <FormItem><FormLabel>Urban Body Name*</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value || ""} disabled={!watchedUrbanBodyType}>
                                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Name" /></SelectTrigger></FormControl>
                                                                    <SelectContent>{urbanBodiesForDistrictAndType.map(u => <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>)}</SelectContent>
                                                                </Select><FormMessage /></FormItem>
                                                            )} />
                                                        </div>
                                                     )}
                                                     <FormField control={form.control} name="fullAddress" render={({ field }) => (
                                                        <FormItem><FormLabel>Full Address* (as per Aadhaar)</FormLabel><FormControl><Textarea placeholder="Enter full address" {...field} className="h-28" /></FormControl><FormMessage /></FormItem>
                                                     )} />
                                                     <FormField control={form.control} name="pincode" render={({ field }) => (
                                                        <FormItem className="max-w-xs"><FormLabel>Pincode*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                     )} />

                                                    <div className="flex justify-end mt-8">
                                                        <Button type="button" onClick={form.handleSubmit(onSubmit)}>Save</Button>
                                                    </div>
                                                 </CardContent>
                                            </Card>
                                        </TabsContent>
                                        <TabsContent value="family-details">
                                             <Card>
                                                 <CardHeader><CardTitle>Family Details</CardTitle></CardHeader>
                                                 <CardContent className="space-y-6 pt-6">
                                                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                         <FormField control={form.control} name="fatherName" render={({ field }) => (
                                                            <FormItem><FormLabel>Father's Name*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                         )} />
                                                         <FormField control={form.control} name="motherName" render={({ field }) => (
                                                            <FormItem><FormLabel>Mother's Name*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                         )} />
                                                         <FormField control={form.control} name="spouseName" render={({ field }) => (
                                                            <FormItem><FormLabel>Spouse Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                         )} />
                                                     </div>
                                                     <div className="flex justify-end mt-8">
                                                        <Button type="button" onClick={form.handleSubmit(onSubmit)}>Save</Button>
                                                    </div>
                                                 </CardContent>
                                             </Card>
                                        </TabsContent>
                                        <TabsContent value="personal-details">
                                            <Card>
                                                <CardHeader><CardTitle>Personal Details</CardTitle></CardHeader>
                                                <CardContent className="space-y-6 pt-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                                                        <FormField control={form.control} name="religion" render={({ field }) => (<FormItem><FormLabel>Religion*</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Religion" /></SelectTrigger></FormControl><SelectContent><SelectItem value="hindu">Hindu</SelectItem><SelectItem value="muslim">Muslim</SelectItem><SelectItem value="christian">Christian</SelectItem><SelectItem value="others">Others</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="caste" render={({ field }) => (<FormItem><FormLabel>Caste*</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Caste" /></SelectTrigger></FormControl><SelectContent><SelectItem value="SC">SC</SelectItem><SelectItem value="ST">ST</SelectItem><SelectItem value="OBC">OBC</SelectItem><SelectItem value="BC">BC</SelectItem><SelectItem value="MBC">MBC</SelectItem><SelectItem value="GENERAL">GENERAL</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="dateOfBirth" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Date of Birth*</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="age" render={({ field }) => (<FormItem><FormLabel>Age</FormLabel><FormControl><Input {...field} readOnly className="bg-muted" /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="gender" render={({ field }) => (<FormItem><FormLabel>Gender*</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                                        {watchedGender === 'female' && (<FormField control={form.control} name="femaleType" render={({ field }) => (<FormItem><FormLabel>Female Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="none">None</SelectItem><SelectItem value="single_women">Single Women</SelectItem><SelectItem value="widow">Widow</SelectItem><SelectItem value="married">Married</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />)}
                                                         <FormField control={form.control} name="bloodGroup" render={({ field }) => (<FormItem><FormLabel>Blood Group</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Blood Group" /></SelectTrigger></FormControl><SelectContent><SelectItem value="A+">A+ (A Positive)</SelectItem><SelectItem value="A-">A- (A Negative)</SelectItem><SelectItem value="B+">B+ (B Positive)</SelectItem><SelectItem value="B-">B- (B Negative)</SelectItem><SelectItem value="AB+">AB+ (AB Positive)</SelectItem><SelectItem value="AB-">AB- (AB Negative)</SelectItem><SelectItem value="O+">O+ (O Positive)</SelectItem><SelectItem value="O-">O- (O Negative)</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                                    </div>
                                                    <div className="space-y-4 pt-4 border-t">
                                                        <h4 className="font-medium">Health Related</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                          <FormField control={form.control} name="isDifferentlyAbled" render={({ field }) => (<FormItem className="space-y-3"><FormLabel>Differently Abled?*</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)} />
                                                          {watchedDifferentlyAbled === 'yes' && (<FormField control={form.control} name="differentlyAbledCert" render={({ field }) => (<FormItem><FormLabel>Upload Certificate* (Max 5MB)</FormLabel><FormControl><Input type="file" onChange={(e) => field.onChange(e.target.files?.[0])} /></FormControl><FormMessage /></FormItem>)} />)}
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                           <FormField control={form.control} name="healthIssues" render={({ field }) => (<FormItem className="space-y-3"><FormLabel>Health Issues?*</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="normal" /></FormControl><FormLabel className="font-normal">Normal</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="minor" /></FormControl><FormLabel className="font-normal">Minor</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="major" /></FormControl><FormLabel className="font-normal">Major</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)} />
                                                           <div className="space-y-4">
                                                                {(watchedHealthIssues === 'minor' || watchedHealthIssues === 'major') && (<FormField control={form.control} name="healthIssuesDetails" render={({ field }) => (<FormItem><FormLabel>Type of Issues</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />)}
                                                                {watchedHealthIssues === 'major' && (<FormField control={form.control} name="medicalCert" render={({ field }) => (<FormItem><FormLabel>Upload Medical Certificate* (Max 20MB)</FormLabel><FormControl><Input type="file" onChange={(e) => field.onChange(e.target.files?.[0])} /></FormControl><FormMessage /></FormItem>)} />)}
                                                           </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end mt-8">
                                                        <Button type="button" onClick={form.handleSubmit(onSubmit)}>Save</Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>
                                        <TabsContent value="personal-info">
                                            <Card>
                                                <CardHeader><CardTitle>Personal Info</CardTitle></CardHeader>
                                                <CardContent className="space-y-6 pt-6">
                                                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                        <FormField control={form.control} name="contactNumber2" render={({ field }) => (<FormItem><FormLabel>Contact 2</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="emailId" render={({ field }) => (<FormItem><FormLabel>Email ID*</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="eportalEmailId" render={({ field }) => (<FormItem><FormLabel>E-Portal Email ID*</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="pfmsId" render={({ field }) => (<FormItem><FormLabel>PFMS ID*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="bankName" render={({ field }) => (<FormItem><FormLabel>Bank Name*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="branchName" render={({ field }) => (<FormItem><FormLabel>Branch Name*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="accountNumber" render={({ field }) => (<FormItem><FormLabel>Account Number*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="ifscCode" render={({ field }) => (<FormItem><FormLabel>IFSC Code*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="aadhaar" render={({ field }) => (<FormItem><FormLabel>Aadhaar*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="aadhaarUpload" render={({ field }) => (<FormItem><FormLabel>Aadhaar Upload*</FormLabel><FormControl><Input type="file" onChange={e => field.onChange(e.target.files)} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="pan" render={({ field }) => (<FormItem><FormLabel>PAN*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="panUpload" render={({ field }) => (<FormItem><FormLabel>PAN Upload*</FormLabel><FormControl><Input type="file" onChange={e => field.onChange(e.target.files)} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="uan" render={({ field }) => (<FormItem><FormLabel>UAN No(Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                     </div>
                                                     <div className="flex justify-end mt-8">
                                                        <Button type="button" onClick={form.handleSubmit(onSubmit)}>Save</Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>
                                        <TabsContent value="education-experience">
                                            <div className="space-y-8">
                                                <Card>
                                                  <CardHeader><CardTitle>Academic Details*</CardTitle></CardHeader>
                                                  <CardContent>
                                                      <div className="overflow-x-auto">
                                                          <Table>
                                                            <TableHeader>
                                                              <TableRow>
                                                                <TableHead>Sl.No</TableHead>
                                                                <TableHead>Course</TableHead>
                                                                <TableHead>Institution</TableHead>
                                                                <TableHead>Board/University</TableHead>
                                                                <TableHead>From</TableHead>
                                                                <TableHead>To</TableHead>
                                                                <TableHead>Aggregate %</TableHead>
                                                                <TableHead>Certificate</TableHead>
                                                                <TableHead>Action</TableHead>
                                                              </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                              {academicFields.map((field, index) => (
                                                                <TableRow key={field.id}>
                                                                    <TableCell>{index + 1}</TableCell>
                                                                    <TableCell><FormField control={form.control} name={`academicDetails.${index}.course`} render={({ field }) => <Input {...field} />} /></TableCell>
                                                                    <TableCell><FormField control={form.control} name={`academicDetails.${index}.institution`} render={({ field }) => <Input {...field} />} /></TableCell>
                                                                    <TableCell><FormField control={form.control} name={`academicDetails.${index}.board`} render={({ field }) => <Input {...field} />} /></TableCell>
                                                                    <TableCell><FormField control={form.control} name={`academicDetails.${index}.fromYear`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(field.value, 'yyyy') : 'Year'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell>
                                                                    <TableCell><FormField control={form.control} name={`academicDetails.${index}.toYear`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(field.value, 'yyyy') : 'Year'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell>
                                                                    <TableCell><FormField control={form.control} name={`academicDetails.${index}.aggregate`} render={({ field }) => <div className="flex items-center"><Input type="number" {...field} className="w-24" /><span className="ml-2">%</span></div>} /></TableCell>
                                                                    <TableCell><FormField control={form.control} name={`academicDetails.${index}.certificate`} render={({ field }) => <Input type="file" onChange={(e) => field.onChange(e.target.files?.[0])} /> } /></TableCell>
                                                                    <TableCell><Button type="button" variant="destructive" size="icon" onClick={() => removeAcademic(index)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                                                </TableRow>
                                                              ))}
                                                            </TableBody>
                                                          </Table>
                                                      </div>
                                                      <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendAcademic({ course: '', institution: '', board: '', fromYear: new Date(), toYear: new Date(), aggregate: 0, certificate: null })}><PlusCircle className="mr-2 h-4 w-4" /> Add Academic Record</Button>
                                                  </CardContent>
                                                </Card>
                                                <Card>
                                                  <CardHeader><CardTitle>Work Experience*</CardTitle></CardHeader>
                                                  <CardContent>
                                                      <div className="overflow-x-auto">
                                                          <Table>
                                                             <TableHeader>
                                                                <TableRow>
                                                                    <TableHead>Sl.No</TableHead>
                                                                    <TableHead>Company Name</TableHead>
                                                                    <TableHead>Nature of Job</TableHead>
                                                                    <TableHead>From</TableHead>
                                                                    <TableHead>To</TableHead>
                                                                    <TableHead>Duration</TableHead>
                                                                    <TableHead>Certificate</TableHead>
                                                                    <TableHead>Action</TableHead>
                                                                </TableRow>
                                                              </TableHeader>
                                                              <TableBody>
                                                                {experienceFields.map((field, index) => {
                                                                  const fromDate = form.watch(`workExperience.${index}.fromDate`);
                                                                  const toDate = form.watch(`workExperience.${index}.toDate`);
                                                                  const duration = calculateDuration(fromDate, toDate);
                                                                  return (
                                                                    <TableRow key={field.id}>
                                                                        <TableCell>{index + 1}</TableCell>
                                                                        <TableCell><FormField control={form.control} name={`workExperience.${index}.companyName`} render={({ field }) => <Input {...field} />} /></TableCell>
                                                                        <TableCell><FormField control={form.control} name={`workExperience.${index}.natureOfJob`} render={({ field }) => <Input {...field} />} /></TableCell>
                                                                        <TableCell><FormField control={form.control} name={`workExperience.${index}.fromDate`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(field.value, 'PPP') : 'Date'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell>
                                                                        <TableCell><FormField control={form.control} name={`workExperience.${index}.toDate`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(field.value, 'PPP') : 'Date'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell>
                                                                        <TableCell><Input value={duration} readOnly className="bg-muted" /></TableCell>
                                                                        <TableCell><FormField control={form.control} name={`workExperience.${index}.certificate`} render={({ field }) => <Input type="file" onChange={(e) => field.onChange(e.target.files?.[0])} /> } /></TableCell>
                                                                        <TableCell><Button type="button" variant="destructive" size="icon" onClick={() => removeExperience(index)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                                                    </TableRow>
                                                                  )
                                                                })}
                                                              </TableBody>
                                                          </Table>
                                                      </div>
                                                      <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendExperience({ companyName: '', natureOfJob: '', fromDate: new Date(), toDate: new Date(), duration: '', certificate: null })}><PlusCircle className="mr-2 h-4 w-4" /> Add Work Experience</Button>
                                                  </CardContent>
                                                </Card>
                                                <Card>
                                                    <CardHeader><CardTitle>Skills*</CardTitle></CardHeader>
                                                    <CardContent>
                                                      <Table>
                                                        <TableHeader>
                                                          <TableRow>
                                                            <TableHead>Sl.No</TableHead>
                                                            <TableHead>Skill</TableHead>
                                                            <TableHead>Action</TableHead>
                                                          </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                          {skillFields.map((field, index) => (
                                                            <TableRow key={field.id}>
                                                                <TableCell>{index + 1}</TableCell>
                                                                <TableCell><FormField control={form.control} name={`skills.${index}.skill`} render={({ field }) => <Input {...field} />} /></TableCell>
                                                                <TableCell><Button type="button" variant="destructive" size="icon" onClick={() => removeSkill(index)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                                            </TableRow>
                                                          ))}
                                                        </TableBody>
                                                      </Table>
                                                      <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendSkill({ skill: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Skill</Button>
                                                    </CardContent>
                                                </Card>
                                                <div className="flex justify-end mt-8">
                                                    <Button type="button" onClick={form.handleSubmit(onSubmit)}>Save</Button>
                                                </div>
                                            </div>
                                        </TabsContent>
                                        
                                        <TabsContent value="working-details">
                                            <Card>
                                                <CardHeader><CardTitle>Working Details</CardTitle></CardHeader>
                                                <CardContent className="space-y-6 pt-6">
                                                   <FormField
                                                      control={form.control}
                                                      name="joiningDate"
                                                      render={({ field }) => (
                                                        <FormItem className="flex flex-col max-w-xs">
                                                            <FormLabel>Joining Date*</FormLabel>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <FormControl>
                                                                        <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                        </Button>
                                                                    </FormControl>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent>
                                                            </Popover>
                                                            <FormMessage />
                                                        </FormItem>
                                                      )}
                                                    />

                                                    {selectedRole === 'BRP' && (
                                                        <div className='space-y-6'>
                                                            <div>
                                                                <h3 className="text-lg font-semibold mb-2">BRP Working Info*</h3>
                                                                <div className="overflow-x-auto">
                                                                    <Table>
                                                                        <TableHeader>
                                                                            <TableRow>
                                                                                <TableHead>Sl.No</TableHead>
                                                                                <TableHead>Station</TableHead>
                                                                                <TableHead>District</TableHead>
                                                                                <TableHead>Block</TableHead>
                                                                                <TableHead>From Date</TableHead>
                                                                                <TableHead>To Date</TableHead>
                                                                                <TableHead>Duration</TableHead>
                                                                                <TableHead>Action</TableHead>
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody>
                                                                            {brpWorkFields.map((item, index) => (
                                                                                <TableRow key={item.id}>
                                                                                    <TableCell>{index + 1}</TableCell>
                                                                                    <TableCell><FormField control={form.control} name={`brpWorkHistory.${index}.station`} render={({field}) => <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="worked">Worked</SelectItem><SelectItem value="present">Present</SelectItem></SelectContent></Select>}/></TableCell>
                                                                                    <TableCell><FormField control={form.control} name={`brpWorkHistory.${index}.district`} render={({field}) => <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>}/></TableCell>
                                                                                    <TableCell>
                                                                                        <FormField control={form.control} name={`brpWorkHistory.${index}.block`} render={({ field }) => (
                                                                                            <Select onValueChange={field.onChange} value={field.value || ""} disabled={!form.watch(`brpWorkHistory.${index}.district`)}>
                                                                                                <FormControl><SelectTrigger><SelectValue placeholder="Select Block" /></SelectTrigger></FormControl>
                                                                                                <SelectContent>
                                                                                                    {MOCK_PANCHAYATS.filter(p=>p.district === form.watch(`brpWorkHistory.${index}.district`)).map(p => p.block).filter((v, i, a) => a.indexOf(v) === i).map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                                                                                </SelectContent>
                                                                                            </Select>
                                                                                        )} />
                                                                                    </TableCell>
                                                                                    <TableCell><FormField control={form.control} name={`brpWorkHistory.${index}.fromDate`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(field.value, 'PPP') : 'Date'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell>
                                                                                    <TableCell><FormField control={form.control} name={`brpWorkHistory.${index}.toDate`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(field.value, 'PPP') : 'Date'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell>
                                                                                    <TableCell><Input value={calculateDuration(form.watch(`brpWorkHistory.${index}.fromDate`), form.watch(`brpWorkHistory.${index}.toDate`))} readOnly className="bg-muted"/></TableCell>
                                                                                    <TableCell><Button type="button" variant="destructive" size="icon" onClick={() => removeBrpWork(index)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                                                                </TableRow>
                                                                            ))}
                                                                        </TableBody>
                                                                    </Table>
                                                                </div>
                                                                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendBrpWork({ station: 'worked', district: '', block: '', fromDate: new Date(), toDate: new Date() })}><PlusCircle className="mr-2 h-4 w-4" /> Add Station</Button>
                                                            </div>
                                                            
                                                             <div className="space-y-4 pt-4 border-t">
                                                                <FormField control={form.control} name="workedAsDrpIc" render={({ field }) => (
                                                                    <FormItem className="space-y-3"><FormLabel>Have you worked as DRP I/C?*</FormLabel><FormControl>
                                                                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>
                                                                )} />
                                                                {watchedWorkedAsDrpIc === 'yes' && (
                                                                     <div>
                                                                        <h3 className="text-lg font-semibold mb-2">DRP I/C Working Info</h3>
                                                                        <div className="overflow-x-auto">
                                                                            <Table>
                                                                                <TableHeader>
                                                                                    <TableRow>
                                                                                        <TableHead>Sl.No</TableHead>
                                                                                        <TableHead>Station</TableHead>
                                                                                        <TableHead>District</TableHead>
                                                                                        <TableHead>From Date</TableHead>
                                                                                        <TableHead>To Date</TableHead>
                                                                                        <TableHead>Duration</TableHead>
                                                                                        <TableHead>Action</TableHead>
                                                                                    </TableRow>
                                                                                </TableHeader>
                                                                                 <TableBody>
                                                                                    {drpIcWorkFields.map((item, index) => (
                                                                                        <TableRow key={item.id}>
                                                                                            <TableCell>{index + 1}</TableCell>
                                                                                            <TableCell><FormField control={form.control} name={`drpIcWorkHistory.${index}.station`} render={({field}) => <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="worked">Worked</SelectItem><SelectItem value="present">Present</SelectItem></SelectContent></Select>}/></TableCell>
                                                                                            <TableCell><FormField control={form.control} name={`drpIcWorkHistory.${index}.district`} render={({field}) => <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>}/></TableCell>
                                                                                            <TableCell><FormField control={form.control} name={`drpIcWorkHistory.${index}.fromDate`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(field.value, 'PPP') : 'Date'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell>
                                                                                            <TableCell><FormField control={form.control} name={`drpIcWorkHistory.${index}.toDate`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(field.value, 'PPP') : 'Date'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell>
                                                                                            <TableCell><Input value={calculateDuration(form.watch(`drpIcWorkHistory.${index}.fromDate`), form.watch(`drpIcWorkHistory.${index}.toDate`))} readOnly className="bg-muted"/></TableCell>
                                                                                            <TableCell><Button type="button" variant="destructive" size="icon" onClick={() => removeDrpIcWork(index)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                                                                        </TableRow>
                                                                                    ))}
                                                                                </TableBody>
                                                                            </Table>
                                                                        </div>
                                                                        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendDrpIcWork({ station: 'worked', district: '', fromDate: new Date(), toDate: new Date() })}><PlusCircle className="mr-2 h-4 w-4" /> Add Station</Button>
                                                                     </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                     {selectedRole === 'DRP' && (
                                                         <div>
                                                            <h3 className="text-lg font-semibold mb-2">DRP Working Info*</h3>
                                                            <div className="overflow-x-auto">
                                                                <Table>
                                                                    <TableHeader>
                                                                        <TableRow>
                                                                            <TableHead>Sl.No</TableHead>
                                                                            <TableHead>Station</TableHead>
                                                                            <TableHead>District</TableHead>
                                                                            <TableHead>From Date</TableHead>
                                                                            <TableHead>To Date</TableHead>
                                                                            <TableHead>Duration</TableHead>
                                                                            <TableHead>Action</TableHead>
                                                                        </TableRow>
                                                                    </TableHeader>
                                                                    <TableBody>
                                                                    {drpWorkFields.map((item, index) => (
                                                                        <TableRow key={item.id}>
                                                                            <TableCell>{index + 1}</TableCell>
                                                                            <TableCell><FormField control={form.control} name={`drpWorkHistory.${index}.station`} render={({field}) => <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="worked">Worked</SelectItem><SelectItem value="present">Present</SelectItem></SelectContent></Select>}/></TableCell>
                                                                            <TableCell><FormField control={form.control} name={`drpWorkHistory.${index}.district`} render={({field}) => <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>}/></TableCell>
                                                                            <TableCell><FormField control={form.control} name={`drpWorkHistory.${index}.fromDate`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(field.value, 'PPP') : 'Date'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell>
                                                                            <TableCell><FormField control={form.control} name={`drpWorkHistory.${index}.toDate`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(field.value, 'PPP') : 'Date'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell>
                                                                            <TableCell><Input value={calculateDuration(form.watch(`drpWorkHistory.${index}.fromDate`), form.watch(`drpWorkHistory.${index}.toDate`))} readOnly className="bg-muted"/></TableCell>
                                                                            <TableCell><Button type="button" variant="destructive" size="icon" onClick={() => removeDrpWork(index)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                    </TableBody>
                                                                </Table>
                                                            </div>
                                                            <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendDrpWork({ station: 'worked', district: '', fromDate: new Date(), toDate: new Date() })}><PlusCircle className="mr-2 h-4 w-4" /> Add Station</Button>
                                                         </div>
                                                     )}

                                                    <div className="flex justify-end mt-8">
                                                        <Button type="button" onClick={form.handleSubmit(onSubmit)}>Save</Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>
                                        
                                       <TabsContent value="training-audit">
                                            <Card>
                                                <CardHeader><CardTitle>Training & Pilot Audit Particulars</CardTitle></CardHeader>
                                                <CardContent>
                                                    <Tabs defaultValue="training-taken" className="w-full">
                                                        <TabsList>
                                                            <TabsTrigger value="training-taken">Training Taken</TabsTrigger>
                                                            <TabsTrigger value="training-given">Training Given</TabsTrigger>
                                                            <TabsTrigger value="pilot-audit">Pilot Audit</TabsTrigger>
                                                            <TabsTrigger value="state-office-activities">State Office Activities</TabsTrigger>
                                                        </TabsList>
                                                        <TabsContent value="training-taken" className="pt-4">
                                                            <FormField control={form.control} name="trainingTaken" render={({ field }) => (
                                                                <FormItem className="mb-4"><FormLabel>Training Taken?*</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4 pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl></FormItem>
                                                            )} />
                                                            {watchedTrainingTaken === 'yes' && (
                                                                <div className="space-y-4">
                                                                     <Table><TableHeader><TableRow><TableHead>Start Date</TableHead><TableHead>End Date</TableHead><TableHead>Location</TableHead><TableHead>Training Name</TableHead><TableHead>Grade</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                                                                        <TableBody>{trainingTakenFields.map((field, index) => (<TableRow key={field.id}><TableCell><FormField control={form.control} name={`trainingTakenDetails.${index}.startDate`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(field.value, 'PPP') : 'Date'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell><TableCell><FormField control={form.control} name={`trainingTakenDetails.${index}.endDate`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(field.value, 'PPP') : 'Date'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell><TableCell><FormField control={form.control} name={`trainingTakenDetails.${index}.location`} render={({ field }) => <Input {...field} />} /></TableCell><TableCell><FormField control={form.control} name={`trainingTakenDetails.${index}.trainingName`} render={({ field }) => <Input {...field} />} /></TableCell><TableCell><FormField control={form.control} name={`trainingTakenDetails.${index}.grade`} render={({ field }) => <Input {...field} />} /></TableCell><TableCell><Button type="button" variant="destructive" size="icon" onClick={() => removeTrainingTaken(index)}><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>))}</TableBody>
                                                                     </Table>
                                                                     <Button type="button" variant="outline" size="sm" onClick={() => appendTrainingTaken({ startDate: new Date(), endDate: new Date(), location: '', trainingName: '', grade: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Row</Button>
                                                                </div>
                                                            )}
                                                        </TabsContent>
                                                         <TabsContent value="training-given" className="pt-4">
                                                            <FormField control={form.control} name="trainingGiven" render={({ field }) => (
                                                                <FormItem className="mb-4"><FormLabel>Training Given?*</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4 pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl></FormItem>
                                                            )} />
                                                            {watchedTrainingGiven === 'yes' && (
                                                                <div className="space-y-4">
                                                                    <Table><TableHeader><TableRow><TableHead>Start Date</TableHead><TableHead>End Date</TableHead><TableHead>Location</TableHead><TableHead>Training Name</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                                                                        <TableBody>{trainingGivenFields.map((field, index) => (<TableRow key={field.id}><TableCell><FormField control={form.control} name={`trainingGivenDetails.${index}.startDate`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(field.value, 'PPP') : 'Date'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell><TableCell><FormField control={form.control} name={`trainingGivenDetails.${index}.endDate`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(field.value, 'PPP') : 'Date'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell><TableCell><FormField control={form.control} name={`trainingGivenDetails.${index}.location`} render={({ field }) => <Input {...field} />} /></TableCell><TableCell><FormField control={form.control} name={`trainingGivenDetails.${index}.trainingName`} render={({ field }) => <Input {...field} />} /></TableCell><TableCell><Button type="button" variant="destructive" size="icon" onClick={() => removeTrainingGiven(index)}><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>))}</TableBody>
                                                                     </Table>
                                                                    <Button type="button" variant="outline" size="sm" onClick={() => appendTrainingGiven({ startDate: new Date(), endDate: new Date(), location: '', trainingName: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Row</Button>
                                                                </div>
                                                            )}
                                                        </TabsContent>
                                                        <TabsContent value="pilot-audit" className="pt-4">
                                                             <FormField control={form.control} name="pilotAudit" render={({ field }) => (
                                                                <FormItem className="mb-4"><FormLabel>Pilot Audit?*</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4 pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl></FormItem>
                                                             )} />
                                                             {watchedPilotAudit === 'yes' && (
                                                                <div className="space-y-4">
                                                                     <Table><TableHeader><TableRow><TableHead>Start Date</TableHead><TableHead>End Date</TableHead><TableHead>Location</TableHead><TableHead>Scheme Name</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                                                                         <TableBody>{pilotAuditFields.map((field, index) => (<TableRow key={field.id}><TableCell><FormField control={form.control} name={`pilotAuditDetails.${index}.startDate`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(field.value, 'PPP') : 'Date'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell><TableCell><FormField control={form.control} name={`pilotAuditDetails.${index}.endDate`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(field.value, 'PPP') : 'Date'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell><TableCell><FormField control={form.control} name={`pilotAuditDetails.${index}.location`} render={({ field }) => <Input {...field} />} /></TableCell><TableCell><FormField control={form.control} name={`pilotAuditDetails.${index}.schemeName`} render={({ field }) => <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Scheme" /></SelectTrigger></FormControl><SelectContent>{MOCK_SCHEMES.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent></Select>} /></TableCell><TableCell><Button type="button" variant="destructive" size="icon" onClick={() => removePilotAudit(index)}><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>))}</TableBody>
                                                                     </Table>
                                                                     <Button type="button" variant="outline" size="sm" onClick={() => appendPilotAudit({ startDate: new Date(), endDate: new Date(), location: '', schemeName: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Row</Button>
                                                                </div>
                                                             )}
                                                        </TabsContent>
                                                        <TabsContent value="state-office-activities" className="pt-4">
                                                             <FormField control={form.control} name="stateOfficeActivities" render={({ field }) => (
                                                                <FormItem className="mb-4"><FormLabel>State Office Activities?*</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4 pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl></FormItem>
                                                             )} />
                                                             {watchedStateOfficeActivities === 'yes' && (
                                                                <div className="space-y-4">
                                                                     <Table><TableHeader><TableRow><TableHead>Year</TableHead><TableHead>Work Particulars</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                                                                         <TableBody>{stateOfficeFields.map((field, index) => (<TableRow key={field.id}><TableCell><FormField control={form.control} name={`stateOfficeActivitiesDetails.${index}.year`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(field.value, 'yyyy') : 'Year'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell><TableCell><FormField control={form.control} name={`stateOfficeActivitiesDetails.${index}.workParticulars`} render={({ field }) => <Textarea {...field} />} /></TableCell><TableCell><Button type="button" variant="destructive" size="icon" onClick={() => removeStateOffice(index)}><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>))}</TableBody>
                                                                     </Table>
                                                                     <Button type="button" variant="outline" size="sm" onClick={() => appendStateOffice({ year: new Date(), workParticulars: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Row</Button>
                                                                </div>
                                                             )}
                                                        </TabsContent>
                                                    </Tabs>
                                                </CardContent>
                                            </Card>
                                       </TabsContent>

                                        <TabsContent value="complaints">
                                            <Card>
                                                <CardHeader><CardTitle>Complaints</CardTitle></CardHeader>
                                                <CardContent>
                                                <Tabs defaultValue="complaint" className="w-full">
                                                    <TabsList>
                                                        <TabsTrigger value="complaint">Complaint</TabsTrigger>
                                                        <TabsTrigger value="others">Others</TabsTrigger>
                                                    </TabsList>
                                                    <TabsContent value="complaint" className="pt-4">
                                                        <div className="overflow-x-auto">
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow>
                                                                        <TableHead>Sl.No</TableHead>
                                                                        <TableHead>Received On</TableHead>
                                                                        <TableHead>Complainant Name & Contact</TableHead>
                                                                        <TableHead>Complaint</TableHead>
                                                                        <TableHead>Remarks</TableHead>
                                                                        <TableHead>Action Taken</TableHead>
                                                                        <TableHead>Action</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {complaintFields.map((field, index) => (
                                                                        <TableRow key={field.id}>
                                                                            <TableCell>{index + 1}</TableCell>
                                                                            <TableCell><FormField control={form.control} name={`complaints.${index}.receivedOn`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(field.value, 'PPP') : 'Date'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell>
                                                                            <TableCell><FormField control={form.control} name={`complaints.${index}.complainantDetails`} render={({ field }) => <Textarea {...field} />} /></TableCell>
                                                                            <TableCell><FormField control={form.control} name={`complaints.${index}.complaint`} render={({ field }) => <Textarea {...field} />} /></TableCell>
                                                                            <TableCell><FormField control={form.control} name={`complaints.${index}.remarks`} render={({ field }) => <Textarea {...field} />} /></TableCell>
                                                                            <TableCell><FormField control={form.control} name={`complaints.${index}.actionTaken`} render={({ field }) => <Textarea {...field} />} /></TableCell>
                                                                            <TableCell><Button type="button" variant="destructive" size="icon" onClick={() => removeComplaint(index)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendComplaint({ receivedOn: new Date() })}><PlusCircle className="mr-2 h-4 w-4" /> Add Complaint</Button>
                                                        <div className="flex justify-end mt-8">
                                                            <Button type="button" onClick={form.handleSubmit(onSubmit)}>Save Complaints</Button>
                                                        </div>
                                                    </TabsContent>
                                                    <TabsContent value="others" className="pt-4">
                                                        <p className="text-muted-foreground">This section is under construction.</p>
                                                    </TabsContent>
                                                </Tabs>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>
                                        
                                        {visibleTabs.filter(tab => !['basic-info', 'location-details', 'family-details', 'personal-details', 'personal-info', 'education-experience', 'working-details', 'training-audit', 'complaints'].includes(tab.value)).map(tab => (
                                            <TabsContent key={tab.value} value={tab.value}>
                                                <Card>
                                                    <CardHeader><CardTitle>{tab.label}</CardTitle></CardHeader>
                                                    <CardContent>
                                                        <p className="text-muted-foreground">Content for {tab.label} will be built here.</p>
                                                        <div className="flex justify-end mt-8">
                                                          <Button type="button" onClick={form.handleSubmit(onSubmit)}>Save</Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </TabsContent>
                                        ))}
                                    </Tabs>
                                )}

                                {selectedRole && (
                                     <div className="pt-8 mt-8 border-t space-y-4">
                                         <h3 className="text-lg font-semibold text-primary">Disclaimer</h3>
                                        <FormField
                                            control={form.control}
                                            name="declaration"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>
                                                            I hereby declare that the information provided is true and correct to the best of my knowledge.
                                                        </FormLabel>
                                                        <FormMessage />
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                        <div className="flex justify-end space-x-4">
                                            <Button variant="outline" type="button">Preview All Details</Button>
                                            <Button type="submit" disabled={!form.watch('declaration')}>{isEditMode ? 'Update Details' : 'Final Submit'}</Button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </main>
            <Footer />
            <BottomNavigation />
        </div>
    );
}
